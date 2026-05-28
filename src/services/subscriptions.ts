
'use client';

import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc, 
  onSnapshot,
  setDoc,
  addDoc,
  orderBy,
  limit,
  updateDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Plan {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  exams: string[];
  active: boolean;
  tier: 'silver' | 'gold' | 'elite';
}

/**
 * PRODUCTION SERVICE: Subscriptions & Plans
 */

export async function getActivePlans(): Promise<Plan[]> {
  const q = query(collection(db, "plans"), where("active", "==", true), orderBy("price", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Plan));
}

export function subscribeUserPass(userId: string, callback: (sub: any) => void) {
  const q = query(
    collection(db, "subscriptions"), 
    where("userId", "==", userId),
    where("status", "==", "active"),
    orderBy("expiresAt", "desc"),
    limit(1)
  );

  return onSnapshot(q, (snap) => {
    if (!snap.empty) {
      const data = snap.docs[0].data();
      if (data.expiresAt > Date.now()) {
        callback({ id: snap.docs[0].id, ...data });
      } else {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
}

/**
 * FEATURE GATING ENGINE
 * Checks if a user has access to a specific capability.
 */
export async function hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
  // 1. Admins have all access
  const userSnap = await getDoc(doc(db, "users", userId));
  if (userSnap.data()?.role === 'admin' || userSnap.data()?.role === 'superadmin') return true;

  // 2. Check active subscription
  const q = query(
    collection(db, "subscriptions"), 
    where("userId", "==", userId),
    where("status", "==", "active"),
    limit(1)
  );
  
  const snap = await getDocs(q);
  if (snap.empty) return false;
  
  const sub = snap.docs[0].data();
  if (sub.expiresAt < Date.now()) return false;
  
  return sub.features?.includes(feature) || sub.tier === 'elite';
}

/**
 * ADMIN: Grant access manually to a user.
 */
export async function grantAccessManual(userId: string, plan: Plan) {
  const startDate = Date.now();
  const expiresAt = startDate + (plan.duration * 24 * 60 * 60 * 1000);

  const subData = {
    userId,
    planId: plan.id,
    planName: plan.name,
    status: "active",
    startDate,
    expiresAt,
    createdAt: startDate,
    features: plan.features,
    tier: plan.tier,
    source: "admin_grant"
  };

  const subRef = await addDoc(collection(db, "subscriptions"), subData);

  await setDoc(doc(db, "premiumAccess", userId), {
    status: "active",
    plan: plan.name,
    expiresAt,
    updatedAt: startDate,
    subId: subRef.id,
    tier: plan.tier
  }, { merge: true });

  return subRef.id;
}
