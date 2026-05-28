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

export interface PlanAccess {
  mocks: {
    full: boolean;
    sectional: boolean;
    chapter: boolean;
    live: boolean;
    premium: boolean;
    ai: boolean;
  };
  pyqs: {
    basic: boolean;
    premium: boolean;
    solved: boolean;
    ai_explanations: boolean;
  };
  community: {
    general: boolean;
    premium: boolean;
    exam_channels: boolean;
    voice: boolean;
    media: boolean;
  };
  content: {
    current_affairs: boolean;
    pdfs: boolean;
    typing: boolean;
    ai_doubt_solver: boolean;
  };
  features: {
    leaderboard: boolean;
    rank_prediction: boolean;
    analytics: boolean;
    reattempt: boolean;
  };
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[]; // Display labels
  exams: string[];
  active: boolean;
  tier: 'silver' | 'gold' | 'elite' | 'vip' | 'custom';
  access: PlanAccess;
  limits: {
    mockAttempts: number;
    aiUsage: number;
    downloads: number;
  };
}

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
 * Deep-checks if user has access to a specific sub-capability.
 */
export async function hasCapability(userId: string, section: keyof PlanAccess, feature: string): Promise<boolean> {
  const userSnap = await getDoc(doc(db, "users", userId));
  const userData = userSnap.data();
  if (userData?.role === 'admin' || userData?.role === 'superadmin') return true;

  const subSnap = await getDoc(doc(db, "premiumAccess", userId));
  if (!subSnap.exists()) return false;
  
  const sub = subSnap.data();
  if (sub.expiresAt < Date.now() || sub.status !== 'active') return false;
  
  // Elite tier has universal override
  if (sub.tier === 'elite' || sub.tier === 'vip') return true;

  return sub.access?.[section]?.[feature] || false;
}

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
    access: plan.access,
    limits: plan.limits,
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
    tier: plan.tier,
    access: plan.access,
    limits: plan.limits
  }, { merge: true });

  return subRef.id;
}

export async function revokeAccess(userId: string) {
  await updateDoc(doc(db, "premiumAccess", userId), {
    status: "revoked",
    updatedAt: Date.now()
  });
}
