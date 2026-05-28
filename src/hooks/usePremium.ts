
"use client";

import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState, useEffect } from "react";

export function usePremium(userId: string | undefined) {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsPremium(false);
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(doc(db, "premiumAccess", userId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const isActive = data.status === "active" && data.endDate > Date.now();
        setIsPremium(isActive);
      } else {
        setIsPremium(false);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [userId]);

  return { isPremium, loading };
}

export async function checkPremiumStatus(userId: string) {
  const snap = await getDoc(doc(db, "premiumAccess", userId));
  if (!snap.exists()) return false;
  const data = snap.data();
  return data.status === "active" && data.endDate > Date.now();
}
