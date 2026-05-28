"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { PlanAccess } from "@/services/subscriptions";

export function usePremium(userId: string | undefined) {
  const [isPremium, setIsPremium] = useState(false);
  const [premiumData, setPremiumData] = useState<any>(null);
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
        const isActive = data.status === "active" && data.expiresAt > Date.now();
        setIsPremium(isActive);
        setPremiumData(data);
      } else {
        setIsPremium(false);
        setPremiumData(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [userId]);

  const hasAccess = (section: keyof PlanAccess, feature: string) => {
    if (!premiumData || premiumData.status !== 'active' || premiumData.expiresAt < Date.now()) return false;
    
    // Admin override is handled at service level, but for UI we check tier
    if (premiumData.tier === 'elite' || premiumData.tier === 'vip') return true;
    
    return premiumData.access?.[section]?.[feature] || false;
  };

  return { isPremium, premiumData, loading, hasAccess };
}
