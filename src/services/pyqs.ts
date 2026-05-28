
'use client';

import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PYQ {
  id: string;
  exam: string;
  year: number;
  question_en: string;
  question_pa: string;
  options_en: string[];
  options_pa: string[];
  correctAnswer: string; 
  subject: string;
  topic: string;
  explanation_en?: string;
  explanation_pa?: string;
  shortcut_trick?: string;
  related_concept?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: number;
}

/**
 * Enterprise Service for Student Artifact Retrieval.
 */
export async function getPYQsByExam(examName: string, year?: number): Promise<PYQ[]> {
  let q = query(
    collection(db, 'pyqs'),
    where('exam', '==', examName),
    limit(100)
  );
  
  if (year) {
    q = query(
      collection(db, 'pyqs'),
      where('exam', '==', examName),
      where('year', '==', year),
      limit(100)
    );
  }

  const snapshot = await getDocs(q);
  const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PYQ));
  return results.sort((a, b) => b.year - a.year);
}

export async function getRecentPYQs(): Promise<PYQ[]> {
  const q = query(
    collection(db, 'pyqs'),
    limit(50)
  );
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PYQ));
  return results.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
