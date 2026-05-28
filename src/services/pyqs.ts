
'use client';

import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PYQ {
  id: string;
  exam: string;
  year: number;
  question_en: string;
  question_pa: string;
  options_en: string[];
  options_pa: string[];
  correctAnswer: number;
  subject: string;
  topic: string;
  explanation?: string;
  createdAt: number;
}

export async function getPYQsByExam(examName: string, year?: number): Promise<PYQ[]> {
  let q = query(
    collection(db, 'pyqs'),
    where('exam', '==', examName),
    orderBy('year', 'desc'),
    limit(50)
  );
  
  if (year) {
    q = query(
      collection(db, 'pyqs'),
      where('exam', '==', examName),
      where('year', '==', year),
      orderBy('createdAt', 'desc')
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PYQ));
}

export async function getRecentPYQs(): Promise<PYQ[]> {
  const q = query(
    collection(db, 'pyqs'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PYQ));
}
