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
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MockTest, Question, AttemptAnswer, ExamAttempt, PassTier } from '@/types';

/**
 * PRODUCTION SERVICE: Simulation Factory & CBT Registry (Enterprise Grade v18.0)
 * Optimized for sectional navigation, real-time sync, and Testbook-style flow.
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

/**
 * ADMINISTRATIVE SIGNAL CONTROLS
 */

export async function publishMock(mockId: string, publish: boolean) {
  const ref = doc(db, 'mocks', mockId);
  return updateDoc(ref, { 
    status: publish ? 'published' : 'draft',
    publishedAt: Date.now(),
    updatedAt: Date.now() 
  });
}

export async function updateMockAccess(mockId: string, accessType: PassTier) {
  const ref = doc(db, 'mocks', mockId);
  return updateDoc(ref, { 
    accessType, 
    updatedAt: Date.now() 
  });
}

/**
 * CBT SESSION LIFECYCLE
 */

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

export async function startAttempt(userId: string, mock: MockTest): Promise<string> {
  const attemptRef = doc(collection(db, 'attempts'));
  const payload: Partial<ExamAttempt> = {
    userId,
    mockId: mock.id,
    mockTitle: mock.title,
    status: 'ongoing',
    startedAt: Date.now(),
    remainingTime: mock.duration * 60,
    currentQuestionIndex: 0,
    answers: {},
    deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
    suspiciousActivityCount: 0
  };
  
  await setDoc(attemptRef, payload);
  await updateDoc(doc(db, 'mocks', mock.id), { attemptCount: increment(1) });
  return attemptRef.id;
}

export async function saveAnswer(attemptId: string, questionId: string, answer: AttemptAnswer) {
  const ref = doc(db, 'attempts', attemptId);
  // Using dynamic key for minimal payload size during real-time sync
  return updateDoc(ref, {
    [`answers.${questionId}`]: {
      ...answer,
      lastUpdated: Date.now()
    },
    updatedAt: Date.now()
  });
}

export async function finalizeAttempt(userId: string, attemptId: string, analytics: any) {
  const ref = doc(db, 'attempts', attemptId);
  await updateDoc(ref, {
    status: 'completed',
    completedAt: Date.now(),
    ...analytics
  });

  const xpGain = Math.max(20, Math.round(analytics.score || 0));
  await updateDoc(doc(db, 'users', userId), {
    xp: increment(xpGain),
    streak: increment(1)
  });

  // Update State Leaderboard Registry
  await setDoc(doc(db, 'leaderboards', userId), {
    userId,
    xp: increment(xpGain),
    lastAttemptAt: Date.now(),
    accuracy: analytics.accuracy,
    name: (await getDoc(doc(db, 'users', userId))).data()?.name || 'Aspirant'
  }, { merge: true });
}

/**
 * ARTIFACT MANAGEMENT
 */

export async function getMockQuestions(mockId: string): Promise<Question[]> {
  const colRef = collection(db, 'mocks', mockId, 'questions');
  const snap = await getDocs(colRef);
  const questions = snap.docs.map(d => ({ id: d.id, ...d.data() } as Question));
  return questions.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function subscribeMockQuestions(mockId: string, callback: (qs: Question[]) => void) {
  const colRef = collection(db, 'mocks', mockId, 'questions');
  return onSnapshot(colRef, (snap) => {
    const qs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Question));
    callback(qs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
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
    updatedAt: Date.now(),
    status: "published"
  };
  await setDoc(docRef, payload);
  await updateDoc(doc(db, 'mocks', mockId), { totalQuestions: increment(1) });
  return docRef.id;
}

export async function updateMockQuestion(mockId: string, questionId: string, updates: Partial<Question>) {
  const docRef = doc(db, 'mocks', mockId, 'questions', questionId);
  await updateDoc(docRef, { ...updates, updatedAt: Date.now() });
}

export async function deleteMockQuestion(mockId: string, questionId: string) {
  const docRef = doc(db, 'mocks', mockId, 'questions', questionId);
  await deleteDoc(docRef);
  await updateDoc(doc(db, 'mocks', mockId), { totalQuestions: increment(-1) });
}

export async function updateMock(mockId: string, updates: Partial<MockTest>) {
  const ref = doc(db, 'mocks', mockId);
  return updateDoc(ref, { ...updates, updatedAt: Date.now() });
}

export async function deleteMock(mockId: string) {
  const batch = writeBatch(db);
  const mockRef = doc(db, 'mocks', mockId);
  // Also delete all subcollection artifacts
  const qSnap = await getDocs(collection(db, 'mocks', mockId, 'questions'));
  qSnap.forEach(d => batch.delete(d.ref));
  batch.delete(mockRef);
  return batch.commit();
}