
"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState, useEffect } from "react";

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

  const hasFeature = (featureName: string) => {
    if (!isPremium) return false;
    // Elite tier always has everything
    if (premiumData?.tier === 'elite') return true;
    return premiumData?.features?.includes(featureName);
  };

  return { isPremium, premiumData, loading, hasFeature };
}
