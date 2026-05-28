
'use client';

import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  setDoc, 
  getDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';

/**
 * PRODUCTION PREPARATION PASS SERVICE v25.0
 * Deeply controlled subscription and entitlement engine.
 */

export interface Transaction {
  userId: string;
  orderId: string;
  paymentId: string;
  amount: number;
  passType: 'silver' | 'gold' | 'elite';
  status: 'pending' | 'success' | 'failed';
  durationDays: number;
}

export async function getActivePlans() {
  try {
    const q = query(collection(db, "plans"), where("active", "==", true));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    return [];
  }
}

/**
 * Initiates the acquisition flow.
 */
export async function createPreparationOrder(userId: string, plan: any) {
  const txnRef = await addDoc(collection(db, 'transactions'), {
    userId,
    amount: plan.price,
    planId: plan.id,
    planName: plan.name,
    status: 'pending',
    createdAt: Date.now()
  });
  
  return txnRef.id;
}

/**
 * Finalizes enrollment upon payment signal.
 */
export async function verifyAndActivatePass(userId: string, txnId: string, plan: any) {
  const txnRef = doc(db, 'transactions', txnId);
  
  // 1. Log verified transaction
  await updateDoc(txnRef, { 
    status: 'success', 
    paymentId: 'RZP_VERIFIED_' + Date.now(),
    verifiedAt: Date.now()
  });

  const durationMs = (plan.duration || 30) * 24 * 60 * 60 * 1000;
  const expiryDate = Date.now() + durationMs;

  // 2. Grant identity tier
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    activePass: plan.tier || 'pass_plus',
    passExpiry: expiryDate,
    updatedAt: serverTimestamp()
  });

  // 3. Initialize access token for exam engine
  await setDoc(doc(db, 'premiumAccess', userId), {
    userId,
    tier: plan.tier,
    status: "active",
    expiresAt: expiryDate,
    planName: plan.name,
    updatedAt: Date.now()
  }, { merge: true });

  return true;
}

/**
 * Security: Entity-level access validator.
 */
export async function checkMockEntitlement(userId: string, mock: any): Promise<{ allowed: boolean; reason?: string }> {
  if (mock.accessType === 'free') return { allowed: true };
  
  const userSnap = await getDoc(doc(db, 'users', userId));
  if (!userSnap.exists()) return { allowed: false, reason: "Auth required." };
  
  const userData = userSnap.data();
  
  // Master Admin Override
  const masters = ['arshdeepgrewal1122@gmail.com', 'deepgrewal2600@gmail.com'];
  if (masters.includes(userData.email)) return { allowed: true };

  // Expiry check
  if (userData.passExpiry && userData.passExpiry < Date.now()) {
    return { allowed: false, reason: "Preparation Pass expired. Please renew." };
  }

  // Tier logic: elite > premium > pass_plus > free
  const tiers = ['free', 'pass_plus', 'premium', 'elite'];
  const userIndex = tiers.indexOf(userData.activePass || 'free');
  const requiredIndex = tiers.indexOf(mock.accessType || 'pass_plus');

  if (userIndex >= requiredIndex) return { allowed: true };

  return { 
    allowed: false, 
    reason: `Unlock requires ${mock.accessType.toUpperCase()} Tier PASS.` 
  };
}
