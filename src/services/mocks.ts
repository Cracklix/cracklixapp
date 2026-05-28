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
 * PRODUCTION SERVICE: Simulation Factory & CBT Registry (Enterprise Grade v30.0)
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

export async function createMock(data: Partial<MockTest>) {
  const docRef = await addDoc(collection(db, 'mocks'), {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: 'draft',
    attemptCount: 0
  });
  return docRef.id;
}

export async function updateMock(mockId: string, updates: Partial<MockTest>) {
  const ref = doc(db, 'mocks', mockId);
  return updateDoc(ref, { ...updates, updatedAt: Date.now() });
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
 * CLONE PROTOCOL: Duplicates a mock and its entire question subcollection.
 */
export async function cloneMock(mockId: string) {
  const original = await getMockDetails(mockId);
  if (!original) throw new Error("Source mock missing.");

  const { id, ...data } = original;
  const newMockId = await createMock({
    ...data,
    title: `${data.title} (Copy)`,
    publishedAt: null,
    attemptCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  // Copy questions
  const qSnap = await getDocs(collection(db, 'mocks', mockId, 'questions'));
  const batch = writeBatch(db);
  qSnap.forEach(qDoc => {
    const newQRef = doc(db, 'mocks', newMockId, 'questions', qDoc.id);
    batch.set(newQRef, qDoc.data());
  });

  await batch.commit();
  return newMockId;
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
  };
  
  await setDoc(attemptRef, payload);
  await updateDoc(doc(db, 'mocks', mock.id), { attemptCount: increment(1) });
  return attemptRef.id;
}

export async function saveAnswer(attemptId: string, questionId: string, answer: AttemptAnswer) {
  const ref = doc(db, 'attempts', attemptId);
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
  
  // Real Rank Calculation
  const mockId = (await getDoc(ref)).data()?.mockId;
  const participantsSnap = await getDocs(query(collection(db, 'attempts'), where('mockId', '==', mockId), where('status', '==', 'completed')));
  const scores = participantsSnap.docs.map(d => d.data().score || 0);
  scores.push(analytics.score);
  scores.sort((a, b) => b - a);
  
  const rank = scores.indexOf(analytics.score) + 1;
  const totalParticipants = scores.length;
  const percentile = ((totalParticipants - rank) / totalParticipants) * 100;

  await updateDoc(ref, {
    status: 'completed',
    completedAt: Date.now(),
    ...analytics,
    rank,
    totalParticipants,
    percentile: Number(percentile.toFixed(1))
  });

  const xpGain = Math.max(20, Math.round(analytics.score || 0));
  await updateDoc(doc(db, 'users', userId), {
    xp: increment(xpGain),
    streak: increment(1)
  });

  // Global Leaderboard Node
  await setDoc(doc(db, 'leaderboards', userId), {
    userId,
    xp: increment(xpGain),
    lastAttemptAt: Date.now(),
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

export async function updateQuestionInMock(mockId: string, questionId: string, updates: Partial<Question>) {
  const qRef = doc(db, 'mocks', mockId, 'questions', questionId);
  return updateDoc(qRef, { ...updates, updatedAt: Date.now() });
}

export async function deleteQuestionFromMock(mockId: string, questionId: string) {
  const qRef = doc(db, 'mocks', mockId, 'questions', questionId);
  await deleteDoc(qRef);
  await updateDoc(doc(db, 'mocks', mockId), { totalQuestions: increment(-1) });
}
