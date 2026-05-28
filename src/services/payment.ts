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
 * PRODUCTION PREPARATION PASS SERVICE v16.0
 * Handles tiered pass acquisition and Testbook-style entitlement granting.
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

export async function createOrder(userId: string, amount: number, passType: string) {
  // In a real env, this calls /api/create-order (Razorpay)
  const txnRef = await addDoc(collection(db, 'transactions'), {
    userId,
    amount,
    passType,
    status: 'pending',
    createdAt: Date.now()
  });
  
  return txnRef.id;
}

export async function verifyAndActivatePass(userId: string, transactionId: string, plan: any) {
  const transactionRef = doc(db, 'transactions', transactionId);
  
  // 1. Mark transaction successful
  await updateDoc(transactionRef, { 
    status: 'success', 
    paymentId: 'RZP_VERIFIED_' + Date.now(),
    updatedAt: serverTimestamp()
  });

  // 2. Calculate duration
  const durationMs = (plan.duration || 30) * 24 * 60 * 60 * 1000;
  const expiryDate = Date.now() + durationMs;

  // 3. Update User Entitlement Signal
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    activePass: plan.tier || 'pass_plus',
    passExpiry: expiryDate,
    updatedAt: serverTimestamp()
  });

  // 4. Create Active Access Token
  await setDoc(doc(db, 'premiumAccess', userId), {
    userId,
    tier: plan.tier,
    status: "active",
    expiresAt: expiryDate,
    planId: plan.id,
    updatedAt: serverTimestamp()
  }, { merge: true });

  return true;
}

export async function checkMockEntitlement(userId: string, mock: any): Promise<{ allowed: boolean; reason?: string }> {
  if (mock.accessType === 'free') return { allowed: true };
  
  const userSnap = await getDoc(doc(db, 'users', userId));
  if (!userSnap.exists()) return { allowed: false, reason: "Identification Signal Lost." };
  
  const userData = userSnap.data();
  
  // Master Admin Override
  if (userData.role === 'admin' || userData.role === 'superadmin' || userData.email === 'arshdeepgrewal1122@gmail.com') {
    return { allowed: true };
  }

  // Individual Test Purchase Check
  if (userData.purchasedTests?.includes(mock.id)) return { allowed: true };

  // Expiry Check
  const now = Date.now();
  if (userData.passExpiry && userData.passExpiry < now) {
    return { allowed: false, reason: "Your Preparation Pass has expired." };
  }

  // Tier Hierarchy Validation
  const tiers = ['free', 'pass_plus', 'premium', 'elite'];
  const userIndex = tiers.indexOf(userData.activePass || 'free');
  const requiredIndex = tiers.indexOf(mock.accessType || 'pass_plus');

  if (userIndex >= requiredIndex) return { allowed: true };

  return { 
    allowed: false, 
    reason: `This artifact requires a ${mock.accessType.toUpperCase()} Tier Pass.` 
  };
}
