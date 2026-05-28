'use client';

import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  query,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface GenerateMockParams {
  exam: string;
  totalQuestions: number;
}

export async function generateAIMock({
  exam,
  totalQuestions,
}: GenerateMockParams) {
  // Fetch all questions for the bank
  const snapshot = await getDocs(collection(db, "questions"));
  const allQuestions = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as any[];

  // PYQ PRIORITY
  const pyqs = allQuestions.filter(
    (q) => q.exam === exam && q.pyq === true
  ).sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));

  const normalQuestions = allQuestions.filter(
    (q) => q.exam === exam && !q.pyq
  ).sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));

  // DIFFICULTY BALANCING (Approx 20% Easy, 50% Medium, 30% Hard)
  const easy = normalQuestions.filter((q) => q.difficulty === "easy");
  const medium = normalQuestions.filter((q) => q.difficulty === "medium");
  const hard = normalQuestions.filter((q) => q.difficulty === "hard");

  // Selection logic based on priority and balance
  const selectedQuestions = [
    ...pyqs.slice(0, Math.floor(totalQuestions * 0.3)), // 30% PYQs
    ...easy.slice(0, Math.floor(totalQuestions * 0.2)),
    ...medium.slice(0, Math.floor(totalQuestions * 0.3)),
    ...hard.slice(0, Math.floor(totalQuestions * 0.2)),
  ].slice(0, totalQuestions);

  // If we don't have enough, fill with normal questions
  if (selectedQuestions.length < totalQuestions) {
    const remaining = normalQuestions.filter(q => !selectedQuestions.find(sq => sq.id === q.id));
    selectedQuestions.push(...remaining.slice(0, totalQuestions - selectedQuestions.length));
  }

  const mock = {
    title: `${exam} AI Mock ${new Date().toLocaleDateString()}`,
    exam,
    duration: 60,
    totalQuestions: selectedQuestions.length,
    aiGenerated: true,
    published: false,
    createdAt: Date.now(),
  };

  const mockRef = await addDoc(collection(db, "aiGeneratedMocks"), mock);

  // Save questions to subcollection for the CBT engine to work
  for (const q of selectedQuestions) {
    const qRef = doc(db, "aiGeneratedMocks", mockRef.id, "questions", q.id);
    await setDoc(qRef, q);
  }

  return {
    mockId: mockRef.id,
    questions: selectedQuestions,
  };
}
