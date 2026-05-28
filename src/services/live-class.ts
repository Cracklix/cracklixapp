
'use client';

import { collection, query, orderBy, getDocs, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface LiveClass {
  id: string;
  title: string;
  teacherId: string;
  teacherName: string;
  exam: string;
  thumbnail: string;
  description: string;
  live: boolean;
  meetingId: string;
  scheduledAt: number;
  createdAt: number;
}

export async function getLiveClasses(): Promise<LiveClass[]> {
  const q = query(collection(db, 'liveClasses'), orderBy('scheduledAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LiveClass));
}

export async function markAttendance(userId: string, classId: string) {
  try {
    await addDoc(collection(db, 'attendance'), {
      userId,
      classId,
      joinedAt: Date.now()
    });
    
    // Increment XP for attending a class
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      xp: increment(20)
    });
  } catch (error) {
    console.error("Failed to mark attendance", error);
  }
}
