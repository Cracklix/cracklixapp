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
  onSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MockTest, Question, AttemptAnswer, ExamAttempt, MockAccessType } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * PRODUCTION SERVICE: Simulation Factory & CBT Registry (Enterprise Grade v12)
 * Includes deep question calibration and tier gating.
 */

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

export async function updateMock(mockId: string, updates: Partial<MockTest>) {
  const ref = doc(db, 'mocks', mockId);
  return updateDoc(ref, { ...updates, updatedAt: Date.now() });
}

export async function publishMock(mockId: string, publish: boolean) {
  return updateMock(mockId, { status: publish ? 'published' : 'draft', publishedAt: publish ? Date.now() : null });
}

export async function toggleMockLock(mockId: string, locked: boolean) {
  return updateMock(mockId, { status: locked ? 'draft' : 'published' });
}

export async function updateMockAccess(mockId: string, tier: MockAccessType) {
  return updateMock(mockId, { accessType: tier });
}

export async function deleteMock(mockId: string) {
  const batch = writeBatch(db);
  const mockRef = doc(db, 'mocks', mockId);
  
  // Recursively delete questions
  const qSnap = await getDocs(collection(db, 'mocks', mockId, 'questions'));
  qSnap.forEach(d => batch.delete(d.ref));
  
  batch.delete(mockRef);
  return batch.commit();
}

/**
 * ARTIFACT MANAGEMENT (CALIBRATION)
 */

export async function getMockQuestions(mockId: string): Promise<Question[]> {
  const colRef = collection(db, 'mocks', mockId, 'questions');
  const snap = await getDocs(colRef);
  
  if (snap.empty) return [];

  const questions = snap.docs.map(d => ({ id: d.id, ...d.data() } as Question));
  return questions.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function subscribeMockQuestions(mockId: string, callback: (questions: Question[]) => void) {
  const colRef = collection(db, 'mocks', mockId, 'questions');
  return onSnapshot(colRef, (snap) => {
    const questions = snap.docs.map(d => ({ id: d.id, ...d.data() } as Question));
    callback(questions.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
  }, (err) => {
    console.error(`[MockService] Subscription Error:`, err);
  });
}

export async function addQuestionToMock(mockId: string, question: Partial<Question>) {
  const colRef = collection(db, 'mocks', mockId, 'questions');
  const docRef = doc(colRef);
  const payload = { 
    ...question, 
    id: docRef.id, 
    order: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now() 
  };
  await setDoc(docRef, payload);
  await updateDoc(doc(db, 'mocks', mockId), { totalQuestions: increment(1) });
  return docRef.id;
}

export async function updateMockQuestion(mockId: string, questionId: string, updates: Partial<Question>) {
  const qRef = doc(db, 'mocks', mockId, 'questions', questionId);
  return updateDoc(qRef, { ...updates, updatedAt: Date.now() });
}

export async function deleteMockQuestion(mockId: string, questionId: string) {
  const qRef = doc(db, 'mocks', mockId, 'questions', questionId);
  await deleteDoc(qRef);
  await updateDoc(doc(db, 'mocks', mockId), { totalQuestions: increment(-1) });
}

export async function linkGlobalToMock(mockId: string, globalQuestionId: string) {
  const globalSnap = await getDoc(doc(db, 'questions', globalQuestionId));
  if (!globalSnap.exists()) throw new Error("Global artifact not found.");
  const data = globalSnap.data();
  return addQuestionToMock(mockId, { ...data, id: globalQuestionId } as Question);
}

/**
 * CBT LIFECYCLE ENGINE
 */

export async function startAttempt(userId: string, mock: MockTest): Promise<string> {
  const attemptRef = doc(collection(db, 'attempts'));
  const payload: Partial<ExamAttempt> = {
    userId,
    mockId: mock.id,
    mockTitle: mock.title,
    status: 'ongoing',
    startedAt: Date.now(),
    expiresAt: Date.now() + (mock.duration * 60 * 1000),
    currentQuestionIndex: 0,
    deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server'
  };
  
  await setDoc(attemptRef, payload);
  await updateDoc(doc(db, 'mocks', mock.id), { attemptCount: increment(1) });
  return attemptRef.id;
}

export async function saveAnswer(attemptId: string, questionIndex: number, answer: AttemptAnswer) {
  const ref = doc(db, 'attempts', attemptId, 'answers', questionIndex.toString());
  return setDoc(ref, answer, { merge: true });
}

export async function getAttemptAnswers(attemptId: string): Promise<Record<number, AttemptAnswer>> {
  const snap = await getDocs(collection(db, 'attempts', attemptId, 'answers'));
  const answers: Record<number, AttemptAnswer> = {};
  snap.forEach(d => {
    answers[parseInt(d.id)] = d.data() as AttemptAnswer;
  });
  return answers;
}

export async function finalizeAttempt(userId: string, attemptId: string, analytics: any) {
  const ref = doc(db, 'attempts', attemptId);
  await updateDoc(ref, {
    status: 'completed',
    completedAt: Date.now(),
    ...analytics
  });

  const xpGain = Math.max(10, Math.round(analytics.score || 0));
  await updateDoc(doc(db, 'users', userId), {
    xp: increment(xpGain),
    streak: increment(1)
  });

  await setDoc(doc(db, 'leaderboards', userId), {
    xp: increment(xpGain),
    lastAttempt: Date.now(),
    accuracy: analytics.accuracy,
    name: (await getDoc(doc(db, 'users', userId))).data()?.name || 'Aspirant'
  }, { merge: true });
}

/**
 * FEATURE GATING: Access Validation
 */
export async function checkMockAccess(userId: string, mock: MockTest): Promise<{ allowed: boolean; reason?: string }> {
  if (mock.accessType === 'free') return { allowed: true };
  
  const userSnap = await getDoc(doc(db, 'users', userId));
  const userData = userSnap.data();
  if (userData?.role === 'admin' || userData?.role === 'superadmin') return { allowed: true };

  const subSnap = await getDoc(doc(db, 'premiumAccess', userId));
  if (!subSnap.exists() || subSnap.data().status !== 'active' || subSnap.data().expiresAt < Date.now()) {
    return { allowed: false, reason: `${mock.accessType.toUpperCase()} Required.` };
  }
  
  // Tier Check
  const sub = subSnap.data();
  if (sub.tier === 'elite' || sub.tier === 'vip') return { allowed: true };
  
  if (mock.accessType === 'pass_plus' && sub.tier !== 'free') return { allowed: true };

  return { allowed: false, reason: "Insufficient Access Tier." };
}