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
  updateDoc,
  deleteDoc
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
  features: string[];
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

/**
 * Fetches active plans for admin and student displays.
 */
export async function getActivePlans(): Promise<Plan[]> {
  try {
    const q = query(collection(db, "plans"), where("active", "==", true));
    const snap = await getDocs(q);
    const plans = snap.docs.map(d => ({ id: d.id, ...d.data() } as Plan));
    return plans.sort((a, b) => a.price - b.price);
  } catch (e) {
    console.error("Failed to fetch plans:", e);
    return [];
  }
}

/**
 * MASTER ADMIN: Grant any pass to any user manually.
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
    access: plan.access,
    limits: plan.limits,
    tier: plan.tier,
    source: "admin_grant"
  };

  // 1. Log the subscription record
  const subRef = await addDoc(collection(db, "subscriptions"), subData);

  // 2. Set the active premium entitlement (Use setDoc to ensure it works even if user had no previous premium doc)
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

/**
 * MASTER ADMIN: Instantly kill any active signal.
 */
export async function revokeAccess(userId: string) {
  const ref = doc(db, "premiumAccess", userId);
  const snap = await getDoc(ref);
  
  if (!snap.exists()) {
    // If no premium doc exists, there's nothing to revoke, just ensure it's set to revoked
    return await setDoc(ref, {
      status: "revoked",
      updatedAt: Date.now(),
      tier: "free"
    });
  }

  return await updateDoc(ref, {
    status: "revoked",
    updatedAt: Date.now()
  });
}
