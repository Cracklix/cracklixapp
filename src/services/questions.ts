'use client';

import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Question } from "@/types";

/**
 * Service for managing the Academic Question Bank.
 */

export async function addQuestion(data: Omit<Question, 'id'>) {
  return await addDoc(collection(db, "questions"), {
    ...data,
    createdAt: Date.now()
  });
}

export async function getQuestionsBySubject(subject: string, limitCount = 50) {
  const q = query(
    collection(db, "questions"),
    where("subject", "==", subject),
    where("status", "==", "published"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Question));
}

export async function updateQuestion(id: string, data: Partial<Question>) {
  const ref = doc(db, "questions", id);
  return await updateDoc(ref, data);
}

export async function deleteQuestion(id: string) {
  const ref = doc(db, "questions", id);
  return await deleteDoc(ref);
}

export async function getRecentQuestions(limitCount = 20) {
  const q = query(
    collection(db, "questions"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Question));
}
