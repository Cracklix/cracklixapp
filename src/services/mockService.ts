
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
 * CENTRALIZED STABILIZATION SERVICE
 * Defensive fetching with mandatory null guards.
 */

export const mockService = {
  async getMock(mockId: string): Promise<MockTest | null> {
    if (!mockId) return null;
    try {
      const docRef = doc(db, "mocks", mockId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as MockTest;
    } catch (error) {
      console.error(`[MockService] Fetch error for ${mockId}:`, error);
      return null;
    }
  },

  async getQuestions(mockId: string): Promise<Question[]> {
    if (!mockId) return [];
    try {
      const mock = await this.getMock(mockId);
      const qIds = mock?.questionIds || [];
      if (qIds.length === 0) return [];

      const questions: Question[] = [];
      const fetches = qIds.slice(0, 100).map(id => getDoc(doc(db, "questions", id)));
      const results = await Promise.all(fetches);
      
      results.forEach(snap => {
        if (snap.exists()) {
          questions.push({ id: snap.id, ...snap.data() } as Question);
        }
      });

      return questions;
    } catch (error) {
      console.error(`[MockService] Questions error for ${mockId}:`, error);
      return [];
    }
  },

  subscribeToMocks(callback: (mocks: MockTest[]) => void) {
    const q = query(
      collection(db, "mocks"),
      where("status", "==", "published"),
      limit(20)
    );

    return onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as MockTest));
      callback(data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    }, (err) => {
      console.warn("[MockService] Real-time sync suspended.", err.message);
    });
  }
};
