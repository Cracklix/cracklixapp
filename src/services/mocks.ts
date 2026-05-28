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
  writeBatch,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MockTest, Question, Subject, MockStatus, ExamAttempt, AttemptAnswer, QuestionStatus } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * ENTERPRISE SERVICE: Mock Factory & CBT Engine
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
  
  let baseQuery = query(
    bankRef,
    where("status", "==", "published"),
    where("usageCount", "==", 0), 
    limit(params.count * 3) 
  );

  if (params.type === 'sectional' && params.subject) {
    baseQuery = query(bankRef, where("status", "==", "published"), where("usageCount", "==", 0), where("subject", "==", params.subject), limit(params.count * 2));
  } else if (params.type === 'chapter' && params.topic) {
    baseQuery = query(bankRef, where("status", "==", "published"), where("usageCount", "==", 0), where("topic", "==", params.topic), limit(params.count * 2));
  }

  const snap = await getDocs(baseQuery);
  let questionsPool = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (params.difficulty !== 'mixed') {
    questionsPool = questionsPool.filter((q: any) => q.difficulty === params.difficulty);
  }

  const selectedIds = questionsPool
    .sort(() => 0.5 - Math.random())
    .slice(0, params.count)
    .map((q: any) => q.id);

  if (selectedIds.length === 0) throw new Error(`Insufficient UNUSED questions in bank.`);

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

export async function getAllMocks(): Promise<MockTest[]> {
  const q = query(collection(db, 'mocks'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockTest)).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function getMockDetails(mockId: string): Promise<MockTest> {
  const docRef = doc(db, 'mocks', mockId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Mock not found.');
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

export async function publishMock(mockId: string) {
  const mockRef = doc(db, 'mocks', mockId);
  const mockSnap = await getDoc(mockRef);
  const questionIds = mockSnap.data()?.questionIds || [];
  const batch = writeBatch(db);
  
  batch.update(mockRef, { status: 'published', publishedAt: Date.now() });

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

/**
 * CBT ENGINE PERSISTENCE
 */

export async function startAttempt(userId: string, mock: MockTest): Promise<string> {
  const attemptId = `${userId}_${mock.id}`;
  const attemptRef = doc(db, 'attempts', attemptId);
  
  const existing = await getDoc(attemptRef);
  if (existing.exists() && existing.data().status === 'completed') {
    throw new Error('Simulation already finalized.');
  }

  if (existing.exists()) return attemptId;

  const startedAt = Date.now();
  const payload: Partial<ExamAttempt> = {
    userId,
    mockId: mock.id,
    mockTitle: mock.title,
    status: 'ongoing',
    startedAt,
    expiresAt: startedAt + (mock.duration * 60 * 1000),
    lastActiveAt: startedAt,
    currentQuestionIndex: 0,
    cheatFlags: 0,
    deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
  };

  await setDoc(attemptRef, payload);
  return attemptId;
}

export async function getAttemptState(attemptId: string) {
  const snap = await getDoc(doc(db, 'attempts', attemptId));
  if (!snap.exists()) return null;
  
  const answersSnap = await getDocs(collection(db, 'attempts', attemptId, 'answers'));
  const answers: Record<number, AttemptAnswer> = {};
  answersSnap.docs.forEach(d => {
    const data = d.data() as AttemptAnswer;
    answers[parseInt(d.id)] = data;
  });

  return {
    ...snap.data() as ExamAttempt,
    id: snap.id,
    answers
  };
}

export async function saveQuestionState(attemptId: string, qIndex: number, data: AttemptAnswer) {
  const answerRef = doc(db, 'attempts', attemptId, 'answers', qIndex.toString());
  setDoc(answerRef, {
    ...data,
    lastSavedAt: Date.now()
  }, { merge: true }).catch(async (err) => {
    const permissionError = new FirestorePermissionError({
      path: answerRef.path,
      operation: 'write',
      requestResourceData: data
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}

export async function updateAttemptActivity(attemptId: string, updates: any) {
  const ref = doc(db, 'attempts', attemptId);
  updateDoc(ref, {
    ...updates,
    lastActiveAt: Date.now()
  }).catch(() => {});
}

export async function finalizeAttempt(userId: string, attemptId: string, analytics: any, xpGain: number) {
  const attemptRef = doc(db, 'attempts', attemptId);
  await updateDoc(attemptRef, {
    status: 'completed',
    score: analytics.score,
    accuracy: analytics.accuracy,
    completedAt: Date.now()
  });

  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    xp: increment(xpGain),
    streak: increment(1)
  });
}

export async function updateMock(id: string, data: Partial<MockTest>) {
  const ref = doc(db, 'mocks', id);
  await updateDoc(ref, { ...data, updatedAt: Date.now() });
}

export async function duplicateMock(id: string) {
  const mock = await getMockDetails(id);
  const { id: _, ...data } = mock;
  return await addDoc(collection(db, "mocks"), {
    ...data,
    title: `${data.title} (Copy)`,
    status: "draft",
    createdAt: Date.now(),
  });
}

export async function getMockAnalytics(mockId: string) {
  const q = query(collection(db, 'attempts'), where('mockId', '==', mockId), where('status', '==', 'completed'));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const scores = snap.docs.map(d => d.data().score || 0);
  return {
    totalAttempts: snap.size,
    avgScore: scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0,
    scores
  };
}

export async function deleteMock(mockId: string) {
  await deleteDoc(doc(db, 'mocks', mockId));
}
