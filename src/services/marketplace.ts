
'use client';

import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  doc,
  getDoc,
  setDoc,
  where,
  limit,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string;
  pdfUrl: string;
  creatorId: string;
  creatorName: string;
  downloads: number;
  rating: number;
  reviewsCount: number;
  createdAt: number;
}

export async function getProducts(category?: string): Promise<Product[]> {
  const productsRef = collection(db, 'products');
  let q = query(productsRef, orderBy('createdAt', 'desc'));
  
  if (category && category !== 'All') {
    q = query(productsRef, where('category', '==', category), orderBy('createdAt', 'desc'));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function getCreatorProducts(creatorId: string): Promise<Product[]> {
  const q = query(
    collection(db, 'products'),
    where('creatorId', '==', creatorId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function getCreatorEarnings(creatorId: string) {
  const docRef = doc(db, 'creatorEarnings', creatorId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data();
  }
  
  // Initialize if not exists
  const initial = {
    creatorId,
    totalRevenue: 0,
    withdrawn: 0,
    pendingBalance: 0,
    salesCount: 0
  };
  await setDoc(docRef, initial);
  return initial;
}

export async function createProductOrder(userId: string, product: Product) {
  const orderRef = await addDoc(collection(db, 'orders'), {
    userId,
    productId: product.id,
    productTitle: product.title,
    amount: product.price,
    status: 'paid', // Simulated instant success
    createdAt: Date.now()
  });

  // Update product downloads
  const productRef = doc(db, 'products', product.id);
  await updateDoc(productRef, {
    downloads: increment(1)
  });

  // Update creator earnings
  const earningRef = doc(db, 'creatorEarnings', product.creatorId);
  await updateDoc(earningRef, {
    totalRevenue: increment(product.price),
    pendingBalance: increment(product.price),
    salesCount: increment(1)
  });

  return orderRef.id;
}
