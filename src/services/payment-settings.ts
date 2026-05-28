
'use client';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PaymentSettings {
  provider: 'razorpay' | 'stripe';
  keyId: string;
  secret: string;
  webhookSecret: string;
  mode: 'sandbox' | 'live';
  enabled: boolean;
}

/**
 * PRODUCTION SERVICE: Payment Configuration
 * Fetches and manages payment gateway credentials from Firestore.
 */

export async function getPaymentSettings(): Promise<PaymentSettings | null> {
  const docRef = doc(db, 'settings', 'payment');
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() as PaymentSettings : null;
}

export async function savePaymentSettings(settings: PaymentSettings) {
  const docRef = doc(db, 'settings', 'payment');
  await setDoc(docRef, {
    ...settings,
    updatedAt: Date.now()
  }, { merge: true });
}

/**
 * Returns only the public parts of the payment config for frontend use.
 */
export async function getPublicPaymentConfig() {
  const settings = await getPaymentSettings();
  if (!settings) return null;
  return {
    keyId: settings.keyId,
    mode: settings.mode,
    provider: settings.provider,
    enabled: settings.enabled
  };
}
