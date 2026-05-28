
'use client';

import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface SyllabusItem {
  id: string;
  examId: string;
  subject: string;
  topics: string[];
  weightage?: number;
}

export async function getSyllabusByExam(examId: string): Promise<SyllabusItem[]> {
  const q = query(
    collection(db, 'syllabus'),
    where('examId', '==', examId),
    orderBy('weightage', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SyllabusItem));
}
