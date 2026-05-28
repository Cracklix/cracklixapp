
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { usePremium } from './usePremium';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

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
    if (!userId) {
      setLoading(false);
      return;
    }

    async function loadLimit() {
      const docRef = doc(db, 'aiUsage', `${userId}_${today}`);
      try {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setCount(snap.data().count || 0);
        } else {
          // Initialize silently if possible
          setDoc(docRef, { count: 0, date: today, userId }, { merge: true })
            .catch(() => {}); // silent fail if rules block it
        }
      } catch (err) {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      } finally {
        setLoading(false);
      }
    }

    loadLimit();
  }, [userId, today]);

  const incrementUsage = async () => {
    if (!userId) return;
    const docRef = doc(db, 'aiUsage', `${userId}_${today}`);
    updateDoc(docRef, {
      count: increment(1)
    }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: { count: 'increment(1)' },
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
    setCount(prev => prev + 1);
  };

  const canUseAi = isPremium || count < 10;
  const remaining = isPremium ? Infinity : Math.max(0, 10 - count);

  return { canUseAi, count, remaining, loading, incrementUsage };
}
