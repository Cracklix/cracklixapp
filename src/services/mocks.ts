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
  updateDoc,
  increment,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MockTest, Question } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * Enterprise Service for the Mock Test CBT Engine.
 */

export async function generateAutoMock(params: {
  exam: string;
  subjects: string[];
  count: number;
  difficulty: string;
}) {
  const bankRef = collection(db, "questions");
  const q = query(
    bankRef,
    where("exam", "==", params.exam),
    where("difficulty", "==", params.difficulty),
    limit(params.count)
  );
  
  const snap = await getDocs(q);
  const selectedIds = snap.docs.map(d => d.id);

  if (selectedIds.length === 0) throw new Error("Not enough questions in bank for these criteria.");

  const mockData = {
    title: `${params.exam} Auto-Gen ${new Date().toLocaleDateString()}`,
    exam: params.exam,
    questionIds: selectedIds,
    duration: 60,
    negativeMarking: 0.25,
    published: false,
    createdAt: Date.now()
  };

  return await addDoc(collection(db, "mocks"), mockData);
}

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
  if (!snap.exists()) throw new Error('Mock structure not found in registry.');
  return { id: snap.id, ...snap.data() } as MockTest;
}

export async function getMockQuestions(mockId: string): Promise<Question[]> {
  const mockRef = doc(db, 'mocks', mockId);
  const mockSnap = await getDoc(mockRef);
  const questionIds = mockSnap.data()?.questionIds || [];
  
  const questions: Question[] = [];
  for (const id of questionIds) {
    const qSnap = await getDoc(doc(db, "questions", id));
    if (qSnap.exists()) questions.push({ id: qSnap.id, ...qSnap.data() } as Question);
  }
  
  return questions;
}

export function saveAttempt(userId: string, data: any) {
  const attemptsRef = collection(db, 'attempts');
  
  addDoc(attemptsRef, {
    ...data,
    userId,
    status: 'captured',
    createdAt: Date.now()
  }).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: attemptsRef.path,
      operation: 'create',
      requestResourceData: data,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });

  const userRef = doc(db, 'users', userId);
  updateDoc(userRef, {
    xp: increment(50),
    lastAttemptAt: Date.now()
  }).catch(async (serverError) => {
     const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'update',
        requestResourceData: { xp: 'increment(50)' },
     } satisfies SecurityRuleContext);
     errorEmitter.emit('permission-error', permissionError);
  });
}
