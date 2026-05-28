
'use client';

import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export function subscribeNotifications(
  userId: string,
  callback: (notifications: any[]) => void
) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(20)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(notifications);
  });
}
