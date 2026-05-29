'use client';

import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc,
  increment,
  limit,
  deleteDoc,
  writeBatch,
  setDoc,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MockTest, Question, AttemptAnswer, ExamAttempt } from '@/types';

export async function getAllMocks(): Promise<MockTest[]> {
  try {
    const q = query(collection(db, 'mocks'), orderBy('createdAt', 'desc'), limit(100));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockTest));
  } catch (e) {
    console.error("Registry Fetch Failure:", e);
    return [];
  }
}

export async function getMockDetails(mockId: string): Promise<MockTest | null> {
  if (!mockId) return null;
  try {
    const snap = await getDoc(doc(db, 'mocks', mockId));
    return snap.exists() ? { id: snap.id, ...snap.data() } as MockTest : null;
  } catch (e) {
    return null;
  }
}

export async function createMock(data: Partial<MockTest>) {
  const docRef = await addDoc(collection(db, 'mocks'), {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: data.status || 'draft',
    attemptCount: 0,
    totalQuestions: data.totalQuestions || 0
  });
  return docRef.id;
}

export async function updateMock(mockId: string, updates: Partial<MockTest>) {
  const ref = doc(db, 'mocks', mockId);
  return updateDoc(ref, { ...updates, updatedAt: Date.now() });
}

export async function getMockQuestions(mockId: string): Promise<Question[]> {
  const colRef = collection(db, 'mocks', mockId, 'questions');
  const snap = await getDocs(colRef);
  const questions = snap.docs.map(d => ({ id: d.id, ...d.data() } as Question));
  return questions.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function startAttempt(userId: string, mockId: string, mockTitle: string, duration: number): Promise<string> {
  const attemptRef = doc(collection(db, 'attempts'));
  const payload: Partial<ExamAttempt> = {
    userId,
    mockId,
    mockTitle,
    status: 'ongoing',
    startedAt: Date.now(),
    remainingTime: duration * 60,
    currentQuestionIndex: 0,
    answers: {},
  };
  
  await setDoc(attemptRef, payload);
  await updateDoc(doc(db, 'mocks', mockId), { attemptCount: increment(1) });
  return attemptRef.id;
}

export async function saveAnswer(attemptId: string, questionId: string, answer: AttemptAnswer) {
  const ref = doc(db, 'attempts', attemptId);
  return updateDoc(ref, {
    [`answers.${questionId}`]: {
      ...answer,
      lastUpdated: Date.now()
    },
    updatedAt: Date.now()
  });
}

export async function getOngoingAttempt(userId: string, mockId: string): Promise<ExamAttempt | null> {
  const q = query(
    collection(db, 'attempts'),
    where('userId', '==', userId),
    where('mockId', '==', mockId),
    where('status', 'in', ['ongoing', 'paused']),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as ExamAttempt;
}
