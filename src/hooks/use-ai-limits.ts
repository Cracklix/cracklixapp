'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { usePremium } from './usePremium';

/**
 * Hook to manage and enforce AI usage limits.
 * Free: 10 daily chats
 * Premium: Unlimited
 */
export function useAiLimits(userId: string | undefined) {
  const { isPremium } = usePremium(userId);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!userId) return;

    async function loadLimit() {
      const docRef = doc(db, 'aiUsage', `${userId}_${today}`);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        setCount(snap.data().count || 0);
      } else {
        await setDoc(docRef, { count: 0, date: today, userId });
      }
      setLoading(false);
    }

    loadLimit();
  }, [userId, today]);

  const incrementUsage = async () => {
    if (!userId) return;
    const docRef = doc(db, 'aiUsage', `${userId}_${today}`);
    await updateDoc(docRef, {
      count: increment(1)
    });
    setCount(prev => prev + 1);
  };

  const canUseAi = isPremium || count < 10;
  const remaining = isPremium ? Infinity : Math.max(0, 10 - count);

  return { canUseAi, count, remaining, loading, incrementUsage };
}
