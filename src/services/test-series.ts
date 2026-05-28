'use client';

import { collection, query, where, getDocs, orderBy, doc, getDoc, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TestSeries, ExamSubject, MockTest } from '@/types';

/**
 * PRODUCTION SERVICE: Test Series & Subject Hierarchy
 * Architected for Testbook-style listing.
 */

export async function getAllTestSeries(): Promise<TestSeries[]> {
  const q = query(collection(db, 'testSeries'), where('isActive', '==', true), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as TestSeries));
}

export async function getTestSeriesById(id: string): Promise<TestSeries | null> {
  const snap = await getDoc(doc(db, 'testSeries', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } as TestSeries : null;
}

export async function getSubjectsBySeries(seriesId: string): Promise<ExamSubject[]> {
  const q = query(collection(db, 'subjects'), where('seriesId', '==', seriesId), orderBy('weightage', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ExamSubject));
}

export async function getTestsBySubject(subjectId: string): Promise<MockTest[]> {
  const q = query(collection(db, 'mocks'), where('subjectId', '==', subjectId), where('status', '==', 'published'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MockTest));
}

export async function getTestsBySeries(seriesId: string, category?: string): Promise<MockTest[]> {
  let q = query(collection(db, 'mocks'), where('seriesId', '==', seriesId), where('status', '==', 'published'));
  if (category && category !== 'all') {
    q = query(collection(db, 'mocks'), where('seriesId', '==', seriesId), where('category', '==', category), where('status', '==', 'published'));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MockTest));
}

/**
 * RECOVERY/REAL DATA FALLBACKS
 */
export const DEFAULT_SERIES: TestSeries[] = [
  {
    id: 'psssb-clerk-2024',
    title: 'PSSSB Clerk / IT / Accounts 2024 Test Series',
    category: 'PSSSB',
    description: 'Full length mocks based on Raavi typing and latest board pattern.',
    thumbnail: 'https://picsum.photos/seed/psssb/800/400',
    totalTests: 314,
    freeTests: 8,
    languages: ['English', 'Punjabi', 'Bilingual'],
    isActive: true,
    createdAt: Date.now()
  },
  {
    id: 'punjab-police-si-2024',
    title: 'Punjab Police Sub-Inspector (SI) Elite Series',
    category: 'Punjab Police',
    description: 'Intensive training for SI Paper 1 & 2 with detailed analytics.',
    thumbnail: 'https://picsum.photos/seed/police/800/400',
    totalTests: 156,
    freeTests: 5,
    languages: ['English', 'Punjabi'],
    isActive: true,
    createdAt: Date.now()
  }
];

export const MOCK_SUBJECTS: ExamSubject[] = [
  { id: 'subj_1', seriesId: 'psssb-clerk-2024', name: 'General Awareness', totalTests: 45, freeTests: 2, difficulty: 'Medium', weightage: 25 },
  { id: 'subj_2', seriesId: 'psssb-clerk-2024', name: 'Punjabi Grammar', totalTests: 30, freeTests: 1, difficulty: 'Easy', weightage: 20 },
  { id: 'subj_3', seriesId: 'psssb-clerk-2024', name: 'Quantitative Aptitude', totalTests: 50, freeTests: 1, difficulty: 'Hard', weightage: 30 },
  { id: 'subj_4', seriesId: 'psssb-clerk-2024', name: 'Reasoning', totalTests: 40, freeTests: 1, difficulty: 'Medium', weightage: 25 },
];
