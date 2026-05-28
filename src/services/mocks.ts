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
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MockTest, Question, AttemptAnswer } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * PRODUCTION SERVICE: Simulation Factory & CBT Registry (Enterprise Grade)
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
  return updateDoc(ref, { ...updates, updatedAt: Date.now() })
    .catch(async (e) => {
      const pErr = new FirestorePermissionError({ 
        path: ref.path, 
        operation: 'update', 
        requestResourceData: updates 
      });
      errorEmitter.emit('permission-error', pErr);
    });
}

export async function publishMock(mockId: string, publish: boolean) {
  return updateMock(mockId, { status: publish ? 'published' : 'draft', publishedAt: publish ? Date.now() : null });
}

export async function duplicateMock(mockId: string) {
  const original = await getMockDetails(mockId);
  if (!original) throw new Error("Source simulation artifact not found.");

  const { id, ...data } = original;
  const newMockRef = await addDoc(collection(db, 'mocks'), {
    ...data,
    title: `${data.title} (Clone)`,
    status: 'draft',
    attemptCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  const questions = await getMockQuestions(mockId);
  if (questions.length > 0) {
    const batch = writeBatch(db);
    questions.forEach((q, i) => {
      const { id: oldId, ...qData } = q;
      const newQRef = doc(collection(db, 'mocks', newMockRef.id, 'questions'));
      batch.set(newQRef, { 
        ...qData, 
        order: q.order ?? i,
        createdAt: Date.now() 
      });
    });
    await batch.commit();
    await updateDoc(newMockRef, { totalQuestions: questions.length });
  }

  return newMockRef.id;
}

export async function deleteMock(mockId: string) {
  const batch = writeBatch(db);
  const mockRef = doc(db, 'mocks', mockId);
  const qSnap = await getDocs(collection(db, 'mocks', mockId, 'questions'));
  qSnap.forEach(d => batch.delete(d.ref));
  batch.delete(mockRef);
  return batch.commit();
}

/**
 * ARTIFACT SUB-LAYER MANAGEMENT (Questions)
 */

export function subscribeMockQuestions(mockId: string, callback: (questions: Question[]) => void) {
  const colRef = collection(db, 'mocks', mockId, 'questions');
  const q = query(colRef, orderBy('order', 'asc'));

  return onSnapshot(q, (snap) => {
    const questions = snap.docs.map(d => ({ id: d.id, ...d.data() } as Question));
    callback(questions);
  }, (err) => {
    console.error("Mock Questions Sync Error:", err);
  });
}

export async function getMockQuestions(mockId: string): Promise<Question[]> {
  const colRef = collection(db, 'mocks', mockId, 'questions');
  const snap = await getDocs(colRef);
  const questions = snap.docs.map(d => ({ id: d.id, ...d.data() } as Question));
  return questions.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function addQuestionToMock(mockId: string, question: Question) {
  const colRef = collection(db, 'mocks', mockId, 'questions');
  const { id, ...data } = question;
  const docRef = id ? doc(colRef, id) : doc(colRef);
  
  await setDoc(docRef, { ...data, updatedAt: Date.now() });
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
 * CBT LIFECYCLE
 */

export async function startAttempt(userId: string, mock: MockTest): Promise<string> {
  const attemptRef = await addDoc(collection(db, 'attempts'), {
    userId,
    mockId: mock.id,
    mockTitle: mock.title,
    status: 'ongoing',
    startedAt: Date.now(),
    expiresAt: Date.now() + (mock.duration * 60 * 1000),
    currentQuestionIndex: 0,
    deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server'
  });
  
  await updateDoc(doc(db, 'mocks', mock.id), {
    attemptCount: increment(1)
  });

  return attemptRef.id;
}

export function saveAnswer(attemptId: string, questionIndex: number, answer: AttemptAnswer) {
  const ref = doc(db, 'attempts', attemptId, 'answers', questionIndex.toString());
  setDoc(ref, answer, { merge: true })
    .catch(async (e) => {
      const pErr = new FirestorePermissionError({ 
        path: ref.path, 
        operation: 'write', 
        requestResourceData: answer 
      });
      errorEmitter.emit('permission-error', pErr);
    });
}

export async function finalizeAttempt(userId: string, attemptId: string, analytics: any) {
  const ref = doc(db, 'attempts', attemptId);
  await updateDoc(ref, {
    status: 'completed',
    completedAt: Date.now(),
    ...analytics
  });

  const xpGain = Math.round(analytics.score || 10);
  await updateDoc(doc(db, 'users', userId), {
    xp: increment(xpGain),
    streak: increment(1)
  });

  const rankRef = doc(db, 'leaderboards', userId);
  await setDoc(rankRef, {
    xp: increment(xpGain),
    lastAttempt: Date.now(),
    accuracy: analytics.accuracy,
    name: (await getDoc(doc(db, 'users', userId))).data()?.name || 'Aspirant'
  }, { merge: true });
}

export async function checkMockAccess(userId: string, mock: MockTest): Promise<{ allowed: boolean; reason?: string }> {
  if (mock.accessType === 'free') return { allowed: true };
  const userSnap = await getDoc(doc(db, 'users', userId));
  const userData = userSnap.data();
  if (userData?.role === 'admin' || userData?.role === 'superadmin') return { allowed: true };

  const subSnap = await getDoc(doc(db, 'premiumAccess', userId));
  if (!subSnap.exists() || subSnap.data().status !== 'active' || subSnap.data().expiresAt < Date.now()) {
    return { allowed: false, reason: "PASS+ Membership Required." };
  }
  return { allowed: true };
}

export async function getMockAnalytics(mockId: string) {
  const q = query(collection(db, 'attempts'), where('mockId', '==', mockId));
  const snap = await getDocs(q);
  const attempts = snap.docs.map(d => d.data());
  if (attempts.length === 0) return { totalAttempts: 0, avgScore: 0, avgAccuracy: 0 };
  const total = attempts.length;
  const avgScore = attempts.reduce((acc, curr: any) => acc + (curr.score || 0), 0) / total;
  const avgAccuracy = attempts.reduce((acc, curr: any) => acc + (curr.accuracy || 0), 0) / total;
  return {
    totalAttempts: total,
    avgScore: Number(avgScore.toFixed(2)),
    avgAccuracy: Math.round(avgAccuracy)
  };
}