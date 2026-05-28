
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
  limit
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
        callback(data);
      } else {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
}

export async function grantAccessManual(userId: string, plan: Plan) {
  const subData = {
    userId,
    planId: plan.id,
    planName: plan.name,
    status: "active",
    createdAt: Date.now(),
    expiresAt: Date.now() + (plan.duration * 24 * 60 * 60 * 1000),
    source: "admin_grant"
  };

  await addDoc(collection(db, "subscriptions"), subData);
  await setDoc(doc(db, "premiumAccess", userId), {
    status: "active",
    endDate: subData.expiresAt,
    planName: plan.name
  }, { merge: true });
}
