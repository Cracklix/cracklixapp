
'use client';

import { collection, addDoc, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function saveMistake(userId: string, question: any, userAnswer: string) {
  await addDoc(collection(db, "mistakeNotebook"), {
    userId,
    questionId: question.id,
    questionText: question.question,
    correctAnswer: question.correctAnswer,
    userAnswer,
    topic: question.topic || 'General',
    subject: question.subject || 'Punjab GK',
    savedAt: Date.now()
  });
}

export async function getMistakes(userId: string) {
  const q = query(
    collection(db, "mistakeNotebook"),
    where("userId", "==", userId),
    orderBy("savedAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
