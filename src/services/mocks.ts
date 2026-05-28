'use client';

import { collection, getDocs, doc, getDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MockTest, Question } from '@/types';

export async function getMocksByExam(examName: string): Promise<MockTest[]> {
  const q = query(
    collection(db, 'mocks'),
    where('exam', '==', examName),
    where('published', '==', true),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockTest));
}

export async function getMockDetails(mockId: string): Promise<MockTest> {
  const docRef = doc(db, 'mocks', mockId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Mock not found');
  return { id: snap.id, ...snap.data() } as MockTest;
}

export async function getMockQuestions(mockId: string): Promise<Question[]> {
  const q = query(collection(db, 'mocks', mockId, 'questions'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
}
