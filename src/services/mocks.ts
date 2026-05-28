
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
  Firestore
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MockTest, Question } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

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

export async function getMockQuestions(mockId: string): Promise<Question[]> {
  const q = query(collection(db, 'mocks', mockId, 'questions'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
}

export function saveAttempt(userId: string, data: any) {
  const attemptsRef = collection(db, 'attempts');
  
  addDoc(attemptsRef, {
    ...data,
    userId,
    createdAt: Date.now()
  }).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: attemptsRef.path,
      operation: 'create',
      requestResourceData: data,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });

  // Update user XP
  const userRef = doc(db, 'users', userId);
  updateDoc(userRef, {
    xp: increment(50),
    lastActive: Date.now()
  }).catch(async (serverError) => {
     const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'update',
        requestResourceData: { xp: 'increment(50)' },
     } satisfies SecurityRuleContext);
     errorEmitter.emit('permission-error', permissionError);
  });
}
