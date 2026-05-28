
'use client';

import { 
  doc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  limit, 
  orderBy,
  onSnapshot,
  FirestoreError
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MockTest, Question } from "@/types";

/**
 * Centralized, Robust Mock Service
 * Implements defensive fetching and error isolation.
 */

export const mockService = {
  /**
   * Fetches a single mock with deep validation
   */
  async getMock(mockId: string): Promise<MockTest | null> {
    if (!mockId) return null;
    try {
      const docRef = doc(db, "mocks", mockId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as MockTest;
    } catch (error) {
      console.error(`[MockService] Failed to fetch mock ${mockId}:`, error);
      return null;
    }
  },

  /**
   * Fetches questions for a mock with error fallbacks
   */
  async getQuestions(mockId: string): Promise<Question[]> {
    if (!mockId) return [];
    try {
      // First check if mock has questionIds
      const mock = await this.getMock(mockId);
      const qIds = mock?.questionIds || [];
      
      if (qIds.length === 0) return [];

      const questions: Question[] = [];
      // Batch fetch for efficiency
      const fetches = qIds.map(id => getDoc(doc(db, "questions", id)));
      const results = await Promise.all(fetches);
      
      results.forEach(snap => {
        if (snap.exists()) {
          questions.push({ id: snap.id, ...snap.data() } as Question);
        }
      });

      return questions;
    } catch (error) {
      console.error(`[MockService] Failed to fetch questions for ${mockId}:`, error);
      return [];
    }
  },

  /**
   * Real-time listener for published mocks (optimized)
   */
  subscribeToMocks(callback: (mocks: MockTest[]) => void) {
    const q = query(
      collection(db, "mocks"),
      where("status", "==", "published"),
      limit(50)
    );

    return onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as MockTest));
      // Sort client side to avoid index requirement loops
      callback(data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    }, (error: FirestoreError) => {
      console.warn("[MockService] Real-time mock sync failed. Likely missing index.", error.message);
    });
  }
};
