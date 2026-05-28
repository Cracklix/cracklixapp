
'use client';

import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  setDoc,
  increment
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

/**
 * Service for Punjab State Ranking & Leaderboards.
 */

export async function getLeaderboard() {
  const q = query(
    collection(db, "leaderboards"),
    orderBy("xp", "desc"),
    limit(100)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export function updateUserRank(userId: string, name: string, xpGain: number, accuracy: number) {
  const rankRef = doc(db, "leaderboards", userId);
  
  const payload = {
    userId,
    name,
    xp: increment(xpGain),
    accuracy: accuracy,
    lastUpdate: Date.now(),
    status: "active"
  };

  // High-performance merge update for real-time standings
  setDoc(rankRef, payload, { merge: true })
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: rankRef.path,
        operation: 'write',
        requestResourceData: payload,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
}
