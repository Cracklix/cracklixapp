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
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MockTest, Question, ExamAttempt, AttemptAnswer } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * PRODUCTION SERVICE: Simulation Factory & CBT Registry (Testbook Standard)
 */

// 1. REGISTRY OPERATIONS
export async function getAllMocks(): Promise<MockTest[]> {
  try {
    const q = query(collection(db, 'mocks'), limit(100));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockTest))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (e) {
    console.error("Registry Fetch Failure:", e);
    return [];
  }
}

export async function getMockDetails(mockId: string): Promise<MockTest | null> {
  if (!mockId) return null;
  const snap = await getDoc(doc(db, 'mocks', mockId));
  return snap.exists() ? { id: snap.id, ...snap.data() } as MockTest : null;
}

export async function updateMock(mockId: string, updates: Partial<MockTest>) {
  const ref = doc(db, 'mocks', mockId);
  await updateDoc(ref, { ...updates, updatedAt: Date.now() });
}

export async function publishMock(mockId: string, isPublished: boolean) {
  await updateDoc(doc(db, 'mocks', mockId), { 
    status: isPublished ? 'published' : 'draft', 
    updatedAt: Date.now() 
  });
}

export async function setMockLive(mockId: string, isLive: boolean) {
  return publishMock(mockId, isLive);
}

export async function deleteMock(mockId: string) {
  const batch = writeBatch(db);
  // Delete subcollection questions
  const qSnap = await getDocs(collection(db, 'mocks', mockId, 'questions'));
  qSnap.forEach(d => batch.delete(d.ref));
  // Delete mock doc
  batch.delete(doc(db, 'mocks', mockId));
  await batch.commit();
}

export async function duplicateMock(mockId: string) {
  const sourceMock = await getMockDetails(mockId);
  if (!sourceMock) throw new Error("Source mock not found.");

  const { id: _, ...rest } = sourceMock;
  const newMock = {
    ...rest,
    title: `${rest.title} (Copy)`,
    status: 'draft' as const,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const newMockRef = await addDoc(collection(db, 'mocks'), newMock);
  
  // Copy questions
  const questions = await getMockQuestions(mockId);
  const batch = writeBatch(db);
  questions.forEach((q, idx) => {
    const { id: __, ...qRest } = q;
    const qRef = doc(collection(db, 'mocks', newMockRef.id, 'questions'));
    batch.set(qRef, { ...qRest, id: qRef.id, order: idx });
  });
  
  await batch.commit();
  return newMockRef.id;
}

// 2. QUESTION MANAGEMENT (Subcollection Pattern)
export async function getMockQuestions(mockId: string): Promise<Question[]> {
  const q = query(collection(db, 'mocks', mockId, 'questions'), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Question));
}

export function subscribeMockQuestions(mockId: string, callback: (questions: Question[]) => void) {
  const q = query(collection(db, 'mocks', mockId, 'questions'), orderBy('order', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Question)));
  }, (error) => {
    console.warn("[MockService] Questions sync suspended:", error.message);
  });
}

export async function addQuestionToMock(mockId: string, question: Partial<Question>) {
  const mockRef = doc(db, 'mocks', mockId);
  const qRef = doc(collection(db, 'mocks', mockId, 'questions'));
  
  const payload = { 
    ...question, 
    id: qRef.id, 
    createdAt: Date.now(),
    order: Date.now() // Simple ordering for now
  };
  
  const batch = writeBatch(db);
  batch.set(qRef, payload);
  batch.update(mockRef, { totalQuestions: increment(1), updatedAt: Date.now() });
  await batch.commit();
  return qRef.id;
}

export async function linkGlobalToMock(mockId: string, globalQuestionId: string) {
  const qSnap = await getDoc(doc(db, 'questions', globalQuestionId));
  if (!qSnap.exists()) throw new Error("Global artifact not found.");
  return addQuestionToMock(mockId, qSnap.data());
}

export async function deleteMockQuestion(mockId: string, questionId: string) {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'mocks', mockId, 'questions', questionId));
  batch.update(doc(db, 'mocks', mockId), { totalQuestions: increment(-1), updatedAt: Date.now() });
  await batch.commit();
}

export async function updateMockQuestion(mockId: string, questionId: string, updates: Partial<Question>) {
  const qRef = doc(db, 'mocks', mockId, 'questions', questionId);
  await updateDoc(qRef, { ...updates, updatedAt: Date.now() });
}

// 3. ANALYTICS
export async function getMockAnalytics(mockId: string) {
  const q = query(collection(db, 'attempts'), where('mockId', '==', mockId));
  const snap = await getDocs(q);
  const attempts = snap.docs.map(d => d.data());
  
  if (attempts.length === 0) return { totalAttempts: 0, avgScore: 0, avgAccuracy: 0 };
  
  const totalAttempts = attempts.length;
  const avgScore = attempts.reduce((acc, curr: any) => acc + (curr.score || 0), 0) / totalAttempts;
  const avgAccuracy = attempts.reduce((acc, curr: any) => acc + (curr.accuracy || 0), 0) / totalAttempts;
  
  return {
    totalAttempts,
    avgScore: Number(avgScore.toFixed(2)),
    avgAccuracy: Math.round(avgAccuracy)
  };
}

// 4. CBT ENGINE PROTOCOLS
export async function startAttempt(userId: string, mock: MockTest): Promise<string> {
  const attemptId = `${userId}_${mock.id}`;
  const attemptRef = doc(db, 'attempts', attemptId);
  const existing = await getDoc(attemptRef);
  
  if (existing.exists() && existing.data().status === 'ongoing') {
    return attemptId;
  }

  const payload: Partial<ExamAttempt> = {
    userId,
    mockId: mock.id,
    mockTitle: mock.title,
    status: 'ongoing',
    startedAt: Date.now(),
    expiresAt: Date.now() + (mock.duration * 60 * 1000),
    currentQuestionIndex: 0,
    deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
  };

  await setDoc(attemptRef, payload, { merge: true });
  return attemptId;
}

export async function saveAnswer(attemptId: string, qIndex: number, answer: AttemptAnswer) {
  const ref = doc(db, 'attempts', attemptId, 'answers', qIndex.toString());
  setDoc(ref, { ...answer, lastSavedAt: Date.now() }, { merge: true })
    .catch(async (e) => {
      const pErr = new FirestorePermissionError({ path: ref.path, operation: 'write', requestResourceData: answer });
      errorEmitter.emit('permission-error', pErr);
    });
}

export async function finalizeAttempt(userId: string, attemptId: string, analytics: any) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'attempts', attemptId), {
    status: 'completed',
    completedAt: Date.now(),
    analytics: analytics,
    score: analytics.score,
    accuracy: analytics.accuracy
  });
  batch.update(doc(db, 'users', userId), {
    xp: increment(50),
    coins: increment(10)
  });
  await batch.commit();
}

// 5. ACCESS CONTROL
export async function checkMockAccess(userId: string, mock: MockTest): Promise<{ allowed: boolean; reason?: string }> {
  if (mock.accessType === 'free') return { allowed: true };
  
  const userSnap = await getDoc(doc(db, 'users', userId));
  const userData = userSnap.data();
  if (userData?.role === 'admin' || userData?.role === 'superadmin') return { allowed: true };

  const subSnap = await getDoc(doc(db, 'premiumAccess', userId));
  if (!subSnap.exists() || subSnap.data().status !== 'active' || subSnap.data().expiresAt < Date.now()) {
    return { allowed: false, reason: "Membership required. Unlock with PASS+." };
  }
  return { allowed: true };
}