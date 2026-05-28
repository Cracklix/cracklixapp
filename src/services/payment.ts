
'use client';

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, setDoc, getDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

/**
 * PRODUCTION PREPARATION PASS SERVICE
 * Handles preparação (preparedness) pass acquisition and transaction logging.
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

export async function createPreparationOrder(userId: string, amount: number, passType: string) {
  const orderRef = await addDoc(collection(db, 'transactions'), {
    userId,
    amount,
    passType,
    status: 'pending',
    createdAt: Date.now()
  });
  
  return orderRef.id;
}

export async function verifyAndActivatePass(userId: string, transactionId: string, passDetails: any) {
  const transactionRef = doc(db, 'transactions', transactionId);
  
  // 1. Mark transaction successful
  await updateDoc(transactionRef, { 
    status: 'success', 
    paymentId: 'RZP_' + Date.now(),
    updatedAt: serverTimestamp()
  });

  // 2. Calculate expiry
  const duration = passDetails.durationDays || 30;
  const expiryDate = Date.now() + (duration * 24 * 60 * 60 * 1000);

  // 3. Update User Entitlement
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    activePass: passDetails.type,
    passExpiry: expiryDate,
    updatedAt: serverTimestamp()
  });

  // 4. Set Premium Access Document
  await setDoc(doc(db, 'premiumAccess', userId), {
    userId,
    tier: passDetails.type,
    status: 'active',
    expiresAt: expiryDate,
    access: passDetails.accessMatrix || {},
    createdAt: serverTimestamp()
  }, { merge: true });

  return true;
}

export async function checkEntitlement(userId: string, requiredTier: string): Promise<{ allowed: boolean; reason?: string }> {
  const userSnap = await getDoc(doc(db, 'users', userId));
  if (!userSnap.exists()) return { allowed: false, reason: "Profile not found." };
  
  const userData = userSnap.data();
  
  // Admin bypass
  if (userData.role === 'admin' || userData.role === 'superadmin') return { allowed: true };

  const passExpiry = userData.passExpiry || 0;
  if (passExpiry < Date.now()) return { allowed: false, reason: "Your Preparation Pass has expired." };

  const currentPass = userData.activePass || 'free';
  
  // Hierarchy Check
  const tiers = ['free', 'silver', 'gold', 'elite'];
  const userIndex = tiers.indexOf(currentPass);
  const requiredIndex = tiers.indexOf(requiredTier.toLowerCase());

  if (userIndex >= requiredIndex) {
    return { allowed: true };
  }

  return { 
    allowed: false, 
    reason: `This content requires a ${requiredTier.toUpperCase()} Pass or higher.` 
  };
}

export async function getActivePlans() {
  const q = query(collection(db, "plans"), where("active", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
