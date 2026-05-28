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

/**
 * PRODUCTION SERVICE: Mock Factory & CBT Management
 */

// 1. REGISTRY OPERATIONS
export async function getAllMocks(): Promise<MockTest[]> {
  try {
    const q = query(collection(db, 'mocks'), limit(100));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockTest));
    // Client-side sort to avoid index requirements for initial dev
    return data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (e) {
    console.error("Registry Fetch Error:", e);
    return [];
  }
}

export async function getMockDetails(mockId: string): Promise<MockTest | null> {
  if (!mockId) return null;
  const docRef = doc(db, 'mocks', mockId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as MockTest;
}

export async function updateMock(id: string, data: Partial<MockTest>) {
  const ref = doc(db, 'mocks', id);
  await updateDoc(ref, { ...data, updatedAt: Date.now() });
}

export async function duplicateMock(id: string) {
  const mock = await getMockDetails(id);
  if (!mock) throw new Error("Source artifact missing.");
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
    publishedAt: Date.now()
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

// 3. ANALYTICS & MONITORING
export async function getMockAnalytics(mockId: string) {
  try {
    const q = query(
      collection(db, 'attempts'), 
      where('mockId', '==', mockId), 
      where('status', '==', 'completed'),
      limit(500)
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
  } catch (e) {
    return { totalAttempts: 0, avgScore: 0, avgAccuracy: 0 };
  }
}

// 4. CBT ENGINE LOGIC
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
    deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
  };

  await setDoc(attemptRef, payload, { merge: true });
  return attemptId;
}

export async function getMockQuestions(mockId: string): Promise<Question[]> {
  const mockRef = doc(db, 'mocks', mockId);
  const mockSnap = await getDoc(mockRef);
  const questionIds = mockSnap.data()?.questionIds || [];
  
  if (questionIds.length === 0) return [];

  const questions: Question[] = [];
  // Use sequential fetches if batch is too large, or map limit
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
  // Admin universal override
  const userSnap = await getDoc(doc(db, 'users', userId));
  const userData = userSnap.data();
  if (userData?.role === 'admin' || userData?.role === 'superadmin' || userData?.email === 'arshdeepgrewal1122@gmail.com') {
    return { allowed: true };
  }
  
  if (mock.accessType === 'free') return { allowed: true };
  
  const subSnap = await getDoc(doc(db, 'premiumAccess', userId));
  if (!subSnap.exists() || subSnap.data().status !== 'active' || subSnap.data().expiresAt < Date.now()) {
    return { allowed: false, reason: `Requires PASS+ subscription.` };
  }
  return { allowed: true };
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
  setDoc(answerRef, { ...data, lastSavedAt: Date.now() }, { merge: true })
    .catch(() => console.warn("Background sync delay..."));
}

export async function updateAttemptActivity(attemptId: string, updates: any) {
  const ref = doc(db, 'attempts', attemptId);
  updateDoc(ref, { ...updates, lastActiveAt: Date.now() })
    .catch(() => {});
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
  updateDoc(userRef, { 
    xp: increment(xpGain), 
    streak: increment(1) 
  }).catch(() => {});
}
