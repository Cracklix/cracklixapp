
'use client';

import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Service to check for duplicate questions in the bank.
 * Uses a basic text-matching logic for MVP, can be upgraded to vector search.
 */
export async function findPotentialDuplicates(textEn: string) {
  // Normalize text for search
  const normalized = textEn.toLowerCase().trim().substring(0, 50);
  
  const q = query(
    collection(db, 'questions'),
    where('question_en', '>=', normalized),
    where('question_en', '<=', normalized + '\uf8ff'),
    limit(5)
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Rates the quality of a question based on structural completeness.
 */
export function calculateQualityScore(q: any): number {
  let score = 100;
  
  if (!q.question_pa) score -= 20;
  if (!q.explanation_en) score -= 10;
  if (q.options_en?.length !== 4) score -= 30;
  if (!q.topic) score -= 5;
  
  return Math.max(0, score);
}
