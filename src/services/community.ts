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
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

/**
 * PRODUCTION COMMUNITY SERVICE v2
 * Optimized for a single global community with functional rooms.
 */

export interface CommunityRoom {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  icon: string;
  memberCount: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  text: string;
  messageType: 'text' | 'image' | 'pdf' | 'system';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: any;
}

// 1. REALTIME LISTENER (Loop-Protected)
export function subscribeToMessages(
  roomId: string, 
  callback: (messages: ChatMessage[]) => void
) {
  // Use communityMessages as specified in the overhaul objective
  const q = query(
    collection(db, 'communityMessages'),
    where('roomId', '==', roomId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as ChatMessage));
    // Sort ascending for the chat feed UI
    callback(messages.sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0)));
  }, (err) => {
    console.warn("[Community Service] Stream sync paused. Retrying...");
  });
}

// 2. STABLE SEND PROTOCOL
export async function sendMessage(payload: Omit<ChatMessage, 'id' | 'createdAt'>) {
  const msgData = {
    ...payload,
    createdAt: serverTimestamp()
  };

  return await addDoc(collection(db, 'communityMessages'), msgData);
}

// 3. MEDIA UPLOAD ENGINE
export async function uploadCommunityMedia(file: File, type: 'image' | 'pdf'): Promise<{ url: string; name: string; size: number }> {
  const path = type === 'image' ? 'community/images' : 'community/pdfs';
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const fileRef = ref(storage, `${path}/${fileName}`);
  
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  
  return {
    url,
    name: file.name,
    size: file.size
  };
}

// 4. MODERATION
export async function deleteMessage(messageId: string) {
  return deleteDoc(doc(db, 'communityMessages', messageId));
}
