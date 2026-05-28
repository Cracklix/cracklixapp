'use client';

import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Exam } from '@/types';

/**
 * Strictly focused on Punjab Government Exams.
 */
export async function getAllExams(): Promise<Exam[]> {
  const examsRef = collection(db, 'exams');
  const q = query(
    examsRef, 
    where('category', '==', 'Punjab'), 
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Exam[];
}

export async function getExamBySlug(slug: string): Promise<Exam | null> {
  const q = query(collection(db, 'exams'), where('slug', '==', slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Exam;
}
