
'use client';

import { doc, updateDoc, increment, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Manages the platform's virtual economy (Cracklix Coins).
 */
export async function addCoins(userId: string, amount: number, reason: string) {
  const userRef = doc(db, "users", userId);
  const walletRef = doc(db, "userWallets", userId);

  await updateDoc(userRef, {
    coins: increment(amount)
  });

  // Log transaction
  const logRef = doc(db, "userWallets", userId, "transactions", Date.now().toString());
  await setDoc(logRef, {
    amount,
    reason,
    timestamp: Date.now()
  });
}

export async function getCoins(userId: string): Promise<number> {
  const snap = await getDoc(doc(db, "users", userId));
  return snap.exists() ? (snap.data().coins || 0) : 0;
}
