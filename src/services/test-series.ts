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
