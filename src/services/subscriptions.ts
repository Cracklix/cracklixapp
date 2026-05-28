
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
    orderBy("endDate", "desc"),
    limit(1)
  );

  return onSnapshot(q, (snap) => {
    if (!snap.empty) {
      const data = snap.docs[0].data();
      if (data.endDate > Date.now()) {
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
 * ADMIN: Grant access manually to a user.
 */
export async function grantAccessManual(userId: string, plan: Plan) {
  const startDate = Date.now();
  const endDate = startDate + (plan.duration * 24 * 60 * 60 * 1000);

  const subData = {
    userId,
    planId: plan.id,
    plan: plan.name,
    status: "active",
    startDate,
    endDate,
    createdAt: startDate,
    source: "admin_grant"
  };

  // 1. Create sub record
  const subRef = await addDoc(collection(db, "subscriptions"), subData);

  // 2. Set premiumAccess pivot for fast checking
  await setDoc(doc(db, "premiumAccess", userId), {
    status: "active",
    plan: plan.name,
    endDate,
    updatedAt: startDate,
    subId: subRef.id
  }, { merge: true });

  return subRef.id;
}

/**
 * ADMIN: Deactivate a subscription manually.
 */
export async function revokeAccessManual(userId: string, subId: string) {
  await updateDoc(doc(db, "subscriptions", subId), { status: "cancelled", cancelledAt: Date.now() });
  await updateDoc(doc(db, "premiumAccess", userId), { status: "expired" });
}
