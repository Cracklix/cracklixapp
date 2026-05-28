'use client';

import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Enterprise Service for Duplicate & Quality Management.
 */

export async function findPotentialDuplicates(textEn: string) {
  if (!textEn || textEn.length < 10) return [];
  
  // Normalize text for search: remove special chars and lowercase
  const normalized = textEn.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 30);
  
  // Simple prefix search as a fallback for vector search in MVP
  const q = query(
    collection(db, 'questions'),
    where('question_en', '>=', textEn.substring(0, 20)),
    where('question_en', '<=', textEn.substring(0, 20) + '\uf8ff'),
    limit(3)
  );

  try {
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    return [];
  }
}

/**
 * Rates the quality of a question based on structural completeness.
 */
export function calculateQualityScore(q: any): number {
  let score = 100;
  
  if (!q.question_pa) score -= 25;
  if (!q.explanation_en) score -= 10;
  if (!q.options_en || q.options_en.length !== 4) score -= 30;
  if (!q.correctAnswer) score -= 20;
  if (!q.subject) score -= 5;
  
  return Math.max(0, score);
}
