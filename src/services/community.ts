
'use client';

import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  startAfter,
  Timestamp,
  increment,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

/**
 * PRODUCTION COMMUNITY SERVICE
 * Optimized for high-concurrency Telegram-style chat logic.
 */

export interface CommunityRoom {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  icon: string;
  memberCount: number;
  roomType: 'general' | 'exam' | 'premium';
  lastMessage?: string;
  lastActivity?: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderPhoto?: string;
  text: string;
  messageType: 'text' | 'image' | 'pdf' | 'system';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyTo?: string;
  role: string;
  createdAt: number;
}

// 1. ROOM MANAGEMENT
export async function getRooms(): Promise<CommunityRoom[]> {
  const q = query(collection(db, 'communityRooms'), orderBy('memberCount', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CommunityRoom));
}

// 2. REALTIME MESSAGING ENGINE
export function subscribeToMessages(
  roomId: string, 
  callback: (messages: ChatMessage[]) => void,
  pageSize: number = 50
) {
  const q = query(
    collection(db, 'community_messages'),
    where('roomId', '==', roomId),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as ChatMessage));
    // Sort ascending for UI consumption
    callback(messages.reverse());
  }, (err) => {
    console.error("[Community Service] Stream Interrupted:", err);
  });
}

// 3. BROADCAST PROTOCOL
export async function sendMessage(payload: Omit<ChatMessage, 'id' | 'createdAt'>) {
  const msgData = {
    ...payload,
    createdAt: Date.now(),
    serverTimestamp: Timestamp.now()
  };

  const docRef = await addDoc(collection(db, 'community_messages'), msgData);
  
  // Update Room Metadata Pulse
  const roomRef = doc(db, 'communityRooms', payload.roomId);
  updateDoc(roomRef, {
    lastMessage: payload.text.substring(0, 50),
    lastActivity: Date.now()
  }).catch(() => {}); // Non-critical update

  return docRef.id;
}

// 4. MULTIMEDIA UPLOAD ENGINE
export async function uploadCommunityMedia(file: File, roomId: string): Promise<{ url: string; name: string; size: number }> {
  const path = file.type.includes('image') ? 'images' : 'pdfs';
  const fileRef = ref(storage, `community/${roomId}/${path}/${Date.now()}_${file.name}`);
  
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  
  return {
    url,
    name: file.name,
    size: file.size
  };
}

// 5. MODERATION ACTIONS
export async function deleteMessage(messageId: string) {
  return deleteDoc(doc(db, 'community_messages', messageId));
}

export async function reportMessage(messageId: string, reason: string, reporterId: string) {
  return addDoc(collection(db, 'reports'), {
    targetId: messageId,
    targetType: 'message',
    reason,
    reporterId,
    status: 'pending',
    createdAt: Date.now()
  });
}
