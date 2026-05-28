'use client';

import { collection, query, where, getDocs, orderBy, doc, getDoc, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TestSeries, ExamSubject, MockTest } from '@/types';

/**
 * PRODUCTION SERVICE: Test Series & Subject Hierarchy
 * Architected for Testbook-style listing.
 * Optimized to avoid index errors by sorting client-side.
 */

export async function getAllTestSeries(): Promise<TestSeries[]> {
  try {
    const q = query(collection(db, 'testSeries'), where('isActive', '==', true));
    const snap = await getDocs(q);
    const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as TestSeries));
    // Client-side sort to avoid index requirement for isActive + createdAt
    return results.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (e) {
    console.error("Test Series Fetch Failure:", e);
    return [];
  }
}

export async function getTestSeriesById(id: string): Promise<TestSeries | null> {
  if (!id) return null;
  try {
    const snap = await getDoc(doc(db, 'testSeries', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } as TestSeries : null;
  } catch (e) {
    return null;
  }
}

export async function getSubjectsBySeries(seriesId: string): Promise<ExamSubject[]> {
  if (!seriesId) return [];
  try {
    const q = query(collection(db, 'subjects'), where('seriesId', '==', seriesId));
    const snap = await getDocs(q);
    const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as ExamSubject));
    // Client-side sort by weightage descending
    return results.sort((a, b) => (b.weightage || 0) - (a.weightage || 0));
  } catch (e) {
    console.error("Subject Fetch Failure:", e);
    return [];
  }
}

export async function getTestsBySubject(subjectId: string): Promise<MockTest[]> {
  try {
    const q = query(collection(db, 'mocks'), where('subjectId', '==', subjectId), where('status', '==', 'published'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as MockTest));
  } catch (e) {
    return [];
  }
}

export async function getTestsBySeries(seriesId: string, category?: string): Promise<MockTest[]> {
  try {
    let q = query(collection(db, 'mocks'), where('seriesId', '==', seriesId), where('status', '==', 'published'));
    if (category && category !== 'mock-tests') {
      // Mapping categories for PSSSB/CTET flows
      const mappedCat = category === 'pyq' ? 'pyq' : (category === 'sectional' ? 'sectional' : 'chapter');
      q = query(collection(db, 'mocks'), 
        where('seriesId', '==', seriesId), 
        where('category', '==', mappedCat), 
        where('status', '==', 'published')
      );
    }
    const snap = await getDocs(q);
    const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as MockTest));
    return results.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (e) {
    return [];
  }
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
    price: 299,
    passRequired: 'pass_plus',
    isActive: true,
    languages: ['English', 'Punjabi', 'Bilingual'],
    createdAt: Date.now(),
    sections: ['Part A', 'Part B']
  },
  {
    id: 'punjab-police-si-2024',
    title: 'Punjab Police Sub-Inspector (SI) Elite Series',
    category: 'Punjab Police',
    description: 'Intensive training for SI Paper 1 & 2 with detailed analytics.',
    thumbnail: 'https://picsum.photos/seed/police/800/400',
    totalTests: 156,
    freeTests: 5,
    price: 499,
    passRequired: 'premium',
    isActive: true,
    languages: ['English', 'Punjabi'],
    createdAt: Date.now(),
    sections: ['Paper 1', 'Paper 2']
  }
];

export const MOCK_SUBJECTS: ExamSubject[] = [
  { id: 'subj_1', seriesId: 'psssb-clerk-2024', name: 'General Awareness', totalTests: 45, freeTests: 2, difficulty: 'Medium', weightage: 25 },
  { id: 'subj_2', seriesId: 'psssb-clerk-2024', name: 'Punjabi Grammar', totalTests: 30, freeTests: 1, difficulty: 'Easy', weightage: 20 },
  { id: 'subj_3', seriesId: 'psssb-clerk-2024', name: 'Quantitative Aptitude', totalTests: 50, freeTests: 1, difficulty: 'Hard', weightage: 30 },
  { id: 'subj_4', seriesId: 'psssb-clerk-2024', name: 'Reasoning', totalTests: 40, freeTests: 1, difficulty: 'Medium', weightage: 25 },
];