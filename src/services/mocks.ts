
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
  limit,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MockTest, Question, Subject, MockStatus } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * Enterprise Service for the Mock Test CBT Engine.
 */

export async function generateAutoMock(params: {
  title: string;
  exam: string;
  type: 'full' | 'sectional' | 'chapter';
  subject?: string;
  topic?: string;
  count: number;
  difficulty: string;
  duration: number;
  negativeMarking: number;
  isPremium: boolean;
}) {
  const bankRef = collection(db, "questions");
  
  // Build query based on mode, prioritising UNUSED questions
  let baseQuery = query(
    bankRef,
    where("status", "==", "published"),
    where("usageCount", "==", 0), // Default to unused for AI auto-gen
    limit(params.count * 3) 
  );

  if (params.type === 'sectional' && params.subject) {
    baseQuery = query(bankRef, where("status", "==", "published"), where("usageCount", "==", 0), where("subject", "==", params.subject), limit(params.count * 2));
  } else if (params.type === 'chapter' && params.topic) {
    baseQuery = query(bankRef, where("status", "==", "published"), where("usageCount", "==", 0), where("topic", "==", params.topic), limit(params.count * 2));
  }

  const snap = await getDocs(baseQuery);
  let questionsPool = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Difficulty Filter logic
  if (params.difficulty !== 'mixed') {
    questionsPool = questionsPool.filter((q: any) => q.difficulty === params.difficulty);
  }

  // Shuffle and pick
  const selectedIds = questionsPool
    .sort(() => 0.5 - Math.random())
    .slice(0, params.count)
    .map((q: any) => q.id);

  if (selectedIds.length === 0) throw new Error(`Insufficient UNUSED questions in bank for this blueprint.`);

  const mockData = {
    title: params.title,
    exam: params.exam,
    type: params.type,
    subject: params.subject || null,
    topic: params.topic || null,
    questionIds: selectedIds,
    duration: params.duration,
    negativeMarking: params.negativeMarking,
    premium: params.isPremium,
    status: "draft", 
    createdAt: Date.now(),
    totalQuestions: selectedIds.length,
    difficulty: params.difficulty
  };

  return await addDoc(collection(db, "mocks"), mockData);
}

export async function getMocksByStatus(status: MockStatus): Promise<MockTest[]> {
  const q = query(
    collection(db, 'mocks'),
    where('status', '==', status)
  );
  const snapshot = await getDocs(q);
  const mocks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockTest));
  return mocks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function getAllMocks(): Promise<MockTest[]> {
  const q = query(collection(db, 'mocks'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockTest)).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
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
  const fetches = questionIds.map((id: string) => getDoc(doc(db, "questions", id)));
  const snapshots = await Promise.all(fetches);
  
  snapshots.forEach(qSnap => {
    if (qSnap.exists()) {
      questions.push({ id: qSnap.id, ...qSnap.data() } as Question);
    }
  });
  
  return questions;
}

export async function updateMock(id: string, data: Partial<MockTest>) {
  await updateDoc(doc(db, 'mocks', id), {
    ...data,
    updatedAt: Date.now()
  });
}

export async function duplicateMock(mockId: string) {
  const original = await getMockDetails(mockId);
  const { id, ...data } = original;
  return await addDoc(collection(db, "mocks"), {
    ...data,
    title: `${data.title} (Copy)`,
    status: 'draft',
    createdAt: Date.now()
  });
}

export async function publishMock(mockId: string) {
  const mockRef = doc(db, 'mocks', mockId);
  const mockSnap = await getDoc(mockRef);
  const questionIds = mockSnap.data()?.questionIds || [];

  const batch = writeBatch(db);
  
  // 1. Mark mock as published
  batch.update(mockRef, { 
    status: 'published',
    publishedAt: Date.now()
  });

  // 2. Increment usage metrics and update lifecycle status for all questions
  questionIds.forEach((qId: string) => {
    const qRef = doc(db, 'questions', qId);
    batch.update(qRef, {
      usageCount: increment(1),
      lastUsedAt: Date.now(),
      lastMockId: mockId
    });
  });

  await batch.commit();
}

export async function deleteMock(mockId: string) {
  await deleteDoc(doc(db, 'mocks', mockId));
}

export async function getMockAnalytics(mockId: string) {
  const q = query(collection(db, 'attempts'), where('mockId', '==', mockId));
  const snap = await getDocs(q);
  const attempts = snap.docs.map(d => d.data());
  
  if (attempts.length === 0) return null;

  const totalScore = attempts.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalAccuracy = attempts.reduce((acc, curr) => acc + (curr.accuracy || 0), 0);

  return {
    totalAttempts: attempts.length,
    avgScore: (totalScore / attempts.length).toFixed(1),
    avgAccuracy: (totalAccuracy / attempts.length).toFixed(1),
    highestScore: Math.max(...attempts.map(a => a.score || 0))
  };
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
