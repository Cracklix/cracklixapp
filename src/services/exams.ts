
'use client';

import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ExamCategory {
  id: string;
  name: string;
  icon: string;
  category: string; // 'Punjab'
  totalMocks: number;
  activeStudents: number;
  premium: boolean;
  createdAt: number;
}

/**
 * Strictly focused on Punjab Government Exams.
 */
export async function getAllExams() {
  const examsRef = collection(db, 'exams');
  // Filters to ensure only Punjab context exams are fetched
  const q = query(
    examsRef, 
    where('category', '==', 'Punjab'), 
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ExamCategory[];
}

export async function getPunjabExams() {
  return getAllExams();
}
