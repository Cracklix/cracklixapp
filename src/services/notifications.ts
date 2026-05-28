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
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

export function subscribeNotifications(
  userId: string,
  callback: (notifications: any[]) => void
) {
  const collectionRef = collection(db, "notifications");
  const q = query(
    collectionRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(20)
  );

  return onSnapshot(
    q, 
    (snapshot) => {
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(notifications);
    },
    async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: collectionRef.path,
        operation: 'list',
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    }
  );
}