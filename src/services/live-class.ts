'use client';

import { collection, query, orderBy, getDocs, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

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

export function markAttendance(userId: string, classId: string) {
  const attendanceRef = collection(db, 'attendance');
  
  addDoc(attendanceRef, {
    userId,
    classId,
    joinedAt: Date.now()
  }).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: attendanceRef.path,
      operation: 'create',
      requestResourceData: { userId, classId },
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
  
  const userRef = doc(db, 'users', userId);
  updateDoc(userRef, {
    xp: increment(20)
  }).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: userRef.path,
      operation: 'update',
      requestResourceData: { xp: 'increment(20)' },
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}