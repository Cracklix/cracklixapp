
'use client';

import {
  collection,
  doc,
  getDoc,
  getDocs
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getMock(mockId: string) {
  const mockRef = doc(db, "mocks", mockId);
  const mockSnap = await getDoc(mockRef);

  if (!mockSnap.exists()) {
    throw new Error("Mock test not found");
  }

  return {
    id: mockSnap.id,
    ...mockSnap.data(),
  };
}

export async function getQuestions(mockId: string) {
  const snapshot = await getDocs(
    collection(db, "mocks", mockId, "questions")
  );

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
