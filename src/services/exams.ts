
'use client';

import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ExamCategory {
  id: string;
  name: string;
  icon: string;
  category: string; // 'National' | 'State'
  totalMocks: number;
  activeStudents: number;
  premium: boolean;
  createdAt: number;
}

export async function getAllExams(type?: string) {
  const examsRef = collection(db, 'exams');
  let q = query(examsRef, orderBy('createdAt', 'desc'));
  
  if (type) {
    q = query(examsRef, where('category', '==', type), orderBy('createdAt', 'desc'));
  }

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ExamCategory[];
}

export async function getNationalExams() {
  return getAllExams('National');
}

export async function getStateExams() {
  return getAllExams('State');
}
