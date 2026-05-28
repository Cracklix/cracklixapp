
'use client';

import { doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function saveDailyTarget(userId: string, target: any) {
  const dateStr = new Date().toISOString().split('T')[0];
  await setDoc(doc(db, "dailyTargets", userId), {
    ...target,
    userId,
    date: dateStr,
    updatedAt: Date.now()
  }, { merge: true });
}

export async function getDailyTarget(userId: string) {
  const snap = await getDoc(doc(db, "dailyTargets", userId));
  return snap.exists() ? snap.data() : null;
}

export async function trackProgress(userId: string, type: 'questions' | 'mocks' | 'minutes', amount: number = 1) {
  const ref = doc(db, "dailyTargets", userId);
  const fieldMap = {
    'questions': 'questionsCompleted',
    'mocks': 'mockCompleted',
    'minutes': 'studyMinutesCompleted'
  };

  try {
    await updateDoc(ref, {
      [fieldMap[type]]: increment(amount)
    });
  } catch (e) {
    // If doc doesn't exist, ignore or initialize
  }
}
