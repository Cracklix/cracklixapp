
'use client';

import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface JobAlert {
  id: string;
  title: string;
  department: string;
  postCount: number;
  lastDate: number;
  applyUrl: string;
  category: string; // PPSC, PSSSB, Police, etc.
  status: 'active' | 'closed';
  type: 'vacancy' | 'result' | 'admit_card' | 'notice';
  createdAt: number;
}

export async function getActiveJobs(): Promise<JobAlert[]> {
  const q = query(
    collection(db, "jobAlerts"),
    where("status", "==", "active"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobAlert));
}

// Admin Operations
export async function addJobAlert(data: Omit<JobAlert, 'id' | 'createdAt'>) {
  return await addDoc(collection(db, "jobAlerts"), {
    ...data,
    createdAt: Date.now()
  });
}

export async function updateJobAlert(id: string, data: Partial<JobAlert>) {
  const jobRef = doc(db, "jobAlerts", id);
  return await updateDoc(jobRef, data);
}

export async function deleteJobAlert(id: string) {
  const jobRef = doc(db, "jobAlerts", id);
  return await deleteDoc(jobRef);
}
