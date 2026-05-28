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
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MockTest, Question, Subject, MockStatus, ExamAttempt, AttemptAnswer, QuestionStatus, MockAccessType } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * PRODUCTION SERVICE: Mock Factory & CBT Management
 */

// 1. REGISTRY OPERATIONS
export async function getAllMocks(): Promise<MockTest[]> {
  const q = query(collection(db, 'mocks'));
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockTest));
  return data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function getMockDetails(mockId: string): Promise<MockTest> {
  const docRef = doc(db, 'mocks', mockId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Simulation signal not found.');
  return { id: snap.id, ...snap.data() } as MockTest;
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
    publishedAt: null,
    liveAt: null
  });
}

export async function deleteMock(mockId: string) {
  const ref = doc(db, 'mocks', mockId);
  await deleteDoc(ref);
}

// 2. PUBLISH & LIVE PROTOCOLS
export async function publishMock(mockId: string) {
  const mockRef = doc(db, 'mocks', mockId);
  const mockSnap = await getDoc(mockRef);
  const questionIds = mockSnap.data()?.questionIds || [];
  const batch = writeBatch(db);
  
  batch.update(mockRef, { 
    status: 'published', 
    publishedAt: Date.now(),
    visibility: 'student'
  });

  // Quarantine linked questions
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

export async function setMockLive(mockId: string, isLive: boolean) {
  const ref = doc(db, 'mocks', mockId);
  await updateDoc(ref, { 
    status: isLive ? 'live' : 'published',
    liveAt: isLive ? Date.now() : null
  });
}

// 3. QUESTION LINKING
export async function linkQuestionToMock(mockId: string, questionId: string) {
  const ref = doc(db, 'mocks', mockId);
  await updateDoc(ref, {
    questionIds: arrayUnion(questionId),
    totalQuestions: increment(1)
  });
}

export async function unlinkQuestionFromMock(mockId: string, questionId: string) {
  const ref = doc(db, 'mocks', mockId);
  await updateDoc(ref, {
    questionIds: arrayRemove(questionId),
    totalQuestions: increment(-1)
  });
}

// 4. ANALYTICS & MONITORING
export async function getMockAnalytics(mockId: string) {
  const q = query(
    collection(db, 'attempts'), 
    where('mockId', '==', mockId), 
    where('status', '==', 'completed')
  );
  const snap = await getDocs(q);
  if (snap.empty) return { totalAttempts: 0, avgScore: 0, avgAccuracy: 0 };
  
  const scores = snap.docs.map(d => d.data().score || 0);
  const accuracies = snap.docs.map(d => d.data().accuracy || 0);
  
  return {
    totalAttempts: snap.size,
    avgScore: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
    avgAccuracy: Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length),
  };
}

// 5. CBT ENGINE CLIENT LOGIC
export async function startAttempt(userId: string, mock: MockTest): Promise<string> {
  const attemptId = `${userId}_${mock.id}`;
  const attemptRef = doc(db, 'attempts', attemptId);
  const existing = await getDoc(attemptRef);
  
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

export async function getMockQuestions(mockId: string): Promise<Question[]> {
  const mockRef = doc(db, 'mocks', mockId);
  const mockSnap = await getDoc(mockRef);
  const questionIds = mockSnap.data()?.questionIds || [];
  
  if (questionIds.length === 0) return [];

  const questions: Question[] = [];
  // Batch fetch questions to prevent multiple round-trips
  const fetches = questionIds.map((id: string) => getDoc(doc(db, "questions", id)));
  const snapshots = await Promise.all(fetches);
  
  snapshots.forEach(qSnap => {
    if (qSnap.exists()) {
      questions.push({ id: qSnap.id, ...qSnap.data() } as Question);
    }
  });
  
  return questions;
}

export async function checkMockAccess(userId: string, mock: MockTest): Promise<{ allowed: boolean; reason?: string }> {
  const userSnap = await getDoc(doc(db, 'users', userId));
  const userData = userSnap.data();
  if (userData?.role === 'admin' || userData?.role === 'superadmin') return { allowed: true };
  
  if (mock.accessType === 'free') return { allowed: true };
  
  const subSnap = await getDoc(doc(db, 'premiumAccess', userId));
  if (!subSnap.exists() || subSnap.data().status !== 'active' || subSnap.data().expiresAt < Date.now()) {
    return { allowed: false, reason: `This simulation requires a PASS+ subscription.` };
  }
  return { allowed: true };
}

// 6. AUTO-GENERATION ENGINE
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
    limit(params.count * 2) 
  );

  const snap = await getDocs(baseQuery);
  const questionsPool = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const selectedIds = questionsPool
    .sort(() => 0.5 - Math.random())
    .slice(0, params.count)
    .map((q: any) => q.id);

  if (selectedIds.length === 0) throw new Error(`Insufficient unused artifacts in bank.`);

  const mockData = {
    title: params.title,
    exam: params.exam,
    type: params.type,
    questionIds: selectedIds,
    duration: params.duration,
    negativeMarking: params.negativeMarking,
    premium: params.isPremium,
    accessType: params.isPremium ? 'pass_plus' : 'free',
    status: "draft", 
    createdAt: Date.now(),
    totalQuestions: selectedIds.length,
    difficulty: params.difficulty,
  };

  return await addDoc(collection(db, "mocks"), mockData);
}

export async function getAttemptState(attemptId: string) {
  const snap = await getDoc(doc(db, 'attempts', attemptId));
  if (!snap.exists()) return null;
  const answersSnap = await getDocs(collection(db, 'attempts', attemptId, 'answers'));
  const answers: Record<number, AttemptAnswer> = {};
  answersSnap.docs.forEach(d => {
    answers[parseInt(d.id)] = d.data() as AttemptAnswer;
  });
  return { ...snap.data() as ExamAttempt, id: snap.id, answers };
}

export async function saveQuestionState(attemptId: string, qIndex: number, data: AttemptAnswer) {
  const answerRef = doc(db, 'attempts', attemptId, 'answers', qIndex.toString());
  await setDoc(answerRef, { ...data, lastSavedAt: Date.now() }, { merge: true });
}

export async function updateAttemptActivity(attemptId: string, updates: any) {
  const ref = doc(db, 'attempts', attemptId);
  await updateDoc(ref, { ...updates, lastActiveAt: Date.now() });
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
  await updateDoc(userRef, { xp: increment(xpGain), streak: increment(1) });
}
