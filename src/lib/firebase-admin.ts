import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

/**
 * Firebase Admin SDK Initialization.
 * Used for secure server-side operations like payments and admin tasks.
 */
if (!getApps().length) {
  initializeApp();
}

export const db = getFirestore();
export const auth = getAuth();
