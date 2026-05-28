
'use client';

import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface JobAlert {
  id: string;
  title: string;
  department: string;
  postCount: number;
  lastDate: number;
  applyUrl: string;
  category: string;
  status: 'active' | 'closed';
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
