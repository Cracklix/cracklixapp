import {
  collection,
  getDocs,
  orderBy,
  query
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getCurrentAffairs() {
  const affairsRef = collection(db, "currentAffairs");
  const q = query(affairsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}