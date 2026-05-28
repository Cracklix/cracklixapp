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
  arrayUnion,
  arrayRemove,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MockTest, Question, ExamAttempt, AttemptAnswer } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * PRODUCTION SERVICE: Simulation Factory & CBT Registry
 * Overhauled for sovereign question management and bulk operations.
 */

// 1. REGISTRY OPERATIONS
export async function getAllMocks(): Promise<MockTest[]> {
  try {
    const q = query(collection(db, 'mocks'), limit(500));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockTest));
    return data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (e) {
    console.error("Registry Fetch Failure:", e);
    return [];
  }
}

export async function getMockDetails(mockId: string): Promise<MockTest | null> {
  if (!mockId) return null;
  try {
    const docRef = doc(db, 'mocks', mockId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as MockTest;
  } catch (e) {
    console.error("Fetch Mock Detail Error:", e);
    return null;
  }
}

export function updateMock(id: string, data: Partial<MockTest>) {
  if (!id) return;
  const ref = doc(db, 'mocks', id);
  const payload = { ...data, updatedAt: Date.now() };
  if ('id' in payload) delete (payload as any).id;
  
  updateDoc(ref, payload).catch(async (err) => {
    const permissionError = new FirestorePermissionError({
      path: ref.path,
      operation: 'update',
      requestResourceData: payload,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}

// 2. SOVEREIGN QUESTION MANAGEMENT
export async function getMockQuestionsSovereign(mockId: string): Promise<Question[]> {
  const q = query(
    collection(db, 'mockQuestions'),
    where('mockId', '==', mockId),
    orderBy('order', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Question));
}

export function subscribeMockQuestions(mockId: string, callback: (qs: Question[]) => void) {
  const q = query(
    collection(db, 'mockQuestions'),
    where('mockId', '==', mockId),
    orderBy('order', 'asc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Question)));
  });
}

export async function addQuestionToMock(mockId: string, question: Partial<Question>) {
  const mockRef = doc(db, 'mocks', mockId);
  const mockSnap = await getDoc(mockRef);
  const currentCount = mockSnap.data()?.totalQuestions || 0;

  const payload = {
    ...question,
    mockId,
    order: currentCount,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const qRef = await addDoc(collection(db, 'mockQuestions'), payload);
  await updateDoc(mockRef, {
    totalQuestions: increment(1),
    updatedAt: Date.now()
  });
  return qRef.id;
}

export async function linkGlobalToMock(mockId: string, globalQId: string) {
  const globalRef = doc(db, 'questions', globalQId);
  const globalSnap = await getDoc(globalRef);
  if (!globalSnap.exists()) throw new Error("Global artifact missing.");
  
  const data = globalSnap.data();
  return addQuestionToMock(mockId, {
    ...data,
    status: 'published'
  } as Question);
}

export async function updateMockQuestion(qId: string, updates: Partial<Question>) {
  const ref = doc(db, 'mockQuestions', qId);
  await updateDoc(ref, { ...updates, updatedAt: Date.now() });
}

export async function deleteMockQuestion(mockId: string, qId: string) {
  await deleteDoc(doc(db, 'mockQuestions', qId));
  await updateDoc(doc(db, 'mocks', mockId), {
    totalQuestions: increment(-1),
    updatedAt: Date.now()
  });
}

// 3. PRODUCTION WORKFLOWS
export async function publishMock(mockId: string) {
  const ref = doc(db, 'mocks', mockId);
  await updateDoc(ref, { 
    status: 'published', 
    publishedAt: Date.now(),
    updatedAt: Date.now()
  });
}

export function setMockLive(mockId: string, isLive: boolean) {
  updateMock(mockId, { status: isLive ? 'live' : 'published' });
}

// 4. STUDENT ENGINE DATA
export async function getMockQuestions(mockId: string): Promise<Question[]> {
  // Bridge function for student engine
  return getMockQuestionsSovereign(mockId);
}

export async function checkMockAccess(userId: string, mock: MockTest): Promise<{ allowed: boolean; reason?: string }> {
  if (!userId) return { allowed: false, reason: "Auth required." };
  
  const userSnap = await getDoc(doc(db, 'users', userId));
  const userData = userSnap.data();
  
  if (userData?.role === 'admin' || userData?.role === 'superadmin' || userData?.email === 'arshdeepgrewal1122@gmail.com' || userData?.email === 'deepgrewal2600@gmail.com') {
    return { allowed: true };
  }
  
  if (mock.accessType === 'free') return { allowed: true };
  
  const subSnap = await getDoc(doc(db, 'premiumAccess', userId));
  if (!subSnap.exists() || subSnap.data().status !== 'active' || subSnap.data().expiresAt < Date.now()) {
    return { 
      allowed: false, 
      reason: "Membership required for this CBT session. Upgrade to PASS+." 
    };
  }
  
  return { allowed: true };
}

export async function startAttempt(userId: string, mock: MockTest): Promise<string> {
  const attemptId = `${userId}_${mock.id}`;
  const attemptRef = doc(db, 'attempts', attemptId);
  const existing = await getDoc(attemptRef);
  
  if (existing.exists() && existing.data().status === 'ongoing') {
    return attemptId;
  }

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
    deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Terminal'
  };

  await setDoc(attemptRef, payload, { merge: true });
  return attemptId;
}

export async function getAttemptState(attemptId: string) {
  if (!attemptId) return null;
  const snap = await getDoc(doc(db, 'attempts', attemptId));
  if (!snap.exists()) return null;
  
  const answersSnap = await getDocs(collection(db, 'attempts', attemptId, 'answers'));
  const answers: Record<number, AttemptAnswer> = {};
  answersSnap.docs.forEach(d => {
    answers[parseInt(d.id)] = d.data() as AttemptAnswer;
  });
  
  return { ...snap.data() as ExamAttempt, id: snap.id, answers };
}

export function saveQuestionState(attemptId: string, qIndex: number, data: AttemptAnswer) {
  const answerRef = doc(db, 'attempts', attemptId, 'answers', qIndex.toString());
  setDoc(answerRef, { ...data, lastSavedAt: Date.now() }, { merge: true });
}

export function updateAttemptActivity(attemptId: string, updates: any) {
  const ref = doc(db, 'attempts', attemptId);
  updateDoc(ref, { ...updates, lastActiveAt: Date.now() });
}

export async function finalizeAttempt(userId: string, attemptId: string, analytics: any, xpGain: number) {
  const attemptRef = doc(db, 'attempts', attemptId);
  const userRef = doc(db, 'users', userId);

  const batch = writeBatch(db);

  batch.update(attemptRef, {
    status: 'completed',
    completedAt: Date.now(),
    score: analytics.score,
    accuracy: analytics.accuracy,
    analytics: analytics
  });

  batch.update(userRef, {
    xp: increment(xpGain),
    coins: increment(10)
  });

  await batch.commit();
}
