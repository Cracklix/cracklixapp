'use client';

import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MockTest, Question } from '@/types';

/**
 * Service for the Mock Test CBT Engine.
 */

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

export async function createMockDraft(data: Omit<MockTest, 'id' | 'createdAt'>) {
  return await addDoc(collection(db, "mocks"), {
    ...data,
    published: false,
    createdAt: Date.now()
  });
}

export async function publishMock(id: string) {
  const ref = doc(db, "mocks", id);
  return await updateDoc(ref, { published: true });
}

export async function getMockQuestions(mockId: string): Promise<Question[]> {
  const q = query(collection(db, 'mocks', mockId, 'questions'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
}
