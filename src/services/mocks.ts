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
  arrayRemove
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MockTest, Question, ExamAttempt, AttemptAnswer } from '@/types';

/**
 * PRODUCTION SERVICE: Simulation Factory & CBT Registry
 * Optimized for Testbook-style mock management.
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

export async function updateMock(id: string, data: Partial<MockTest>) {
  if (!id) return;
  const ref = doc(db, 'mocks', id);
  const payload = { ...data, updatedAt: Date.now() };
  // Safety: Prevent ID injection in payload
  if ('id' in payload) delete (payload as any).id;
  
  return updateDoc(ref, payload);
}

export async function duplicateMock(id: string) {
  const mock = await getMockDetails(id);
  if (!mock) throw new Error("Source artifact missing.");
  
  const { id: _, ...data } = mock;
  const payload = {
    ...data,
    title: `${data.title} (Copy)`,
    status: "draft",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    publishedAt: null,
    liveAt: null
  };

  return await addDoc(collection(db, "mocks"), payload);
}

export async function deleteMock(mockId: string) {
  if (!mockId) return;
  const ref = doc(db, 'mocks', mockId);
  return await deleteDoc(ref);
}

// 2. ARTIFACT LINKING ENGINE
export async function linkQuestionToMock(mockId: string, questionId: string) {
  const ref = doc(db, 'mocks', mockId);
  return updateDoc(ref, {
    questionIds: arrayUnion(questionId),
    totalQuestions: increment(1),
    updatedAt: Date.now()
  });
}

export async function unlinkQuestionFromMock(mockId: string, questionId: string) {
  const ref = doc(db, 'mocks', mockId);
  return updateDoc(ref, {
    questionIds: arrayRemove(questionId),
    totalQuestions: increment(-1),
    updatedAt: Date.now()
  });
}

// 3. PRODUCTION WORKFLOWS
export async function publishMock(mockId: string) {
  const mockRef = doc(db, 'mocks', mockId);
  const mockSnap = await getDoc(mockRef);
  if (!mockSnap.exists()) return;
  
  const questionIds = mockSnap.data()?.questionIds || [];
  const batch = writeBatch(db);
  
  batch.update(mockRef, { 
    status: 'published', 
    publishedAt: Date.now(),
    updatedAt: Date.now()
  });

  // Track usage signal on linked artifacts
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
  return updateDoc(ref, { 
    status: isLive ? 'live' : 'published',
    liveAt: isLive ? Date.now() : null,
    updatedAt: Date.now()
  });
}

// 4. CBT ANALYTICS RETRIEVAL
export async function getMockAnalytics(mockId: string) {
  try {
    const q = query(
      collection(db, 'attempts'), 
      where('mockId', '==', mockId), 
      where('status', '==', 'completed'),
      limit(1000)
    );
    const snap = await getDocs(q);
    if (snap.empty) return { totalAttempts: 0, avgScore: 0, avgAccuracy: 0, highScore: 0 };
    
    const scores = snap.docs.map(d => d.data().score || 0);
    const accuracies = snap.docs.map(d => d.data().accuracy || 0);
    
    return {
      totalAttempts: snap.size,
      avgScore: (scores.reduce((a, b) => a + b, 0) / (scores.length || 1)).toFixed(1),
      avgAccuracy: Math.round(accuracies.reduce((a, b) => a + b, 0) / (accuracies.length || 1)),
      highScore: Math.max(0, ...scores)
    };
  } catch (e) {
    return { totalAttempts: 0, avgScore: 0, avgAccuracy: 0, highScore: 0 };
  }
}

// 5. STUDENT ENGINE DATA
export async function getMockQuestions(mockId: string): Promise<Question[]> {
  if (!mockId) return [];
  const mockRef = doc(db, 'mocks', mockId);
  const mockSnap = await getDoc(mockRef);
  const questionIds = mockSnap.data()?.questionIds || [];
  
  if (questionIds.length === 0) return [];

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

export async function checkMockAccess(userId: string, mock: MockTest): Promise<{ allowed: boolean; reason?: string }> {
  if (!userId) return { allowed: false, reason: "Auth required." };
  
  const userSnap = await getDoc(doc(db, 'users', userId));
  const userData = userSnap.data();
  
  // Admin universal bypass
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

export async function saveQuestionState(attemptId: string, qIndex: number, data: AttemptAnswer) {
  const answerRef = doc(db, 'attempts', attemptId, 'answers', qIndex.toString());
  return setDoc(answerRef, { ...data, lastSavedAt: Date.now() }, { merge: true });
}

export async function updateAttemptActivity(attemptId: string, updates: any) {
  const ref = doc(db, 'attempts', attemptId);
  return updateDoc(ref, { ...updates, lastActiveAt: Date.now() });
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
