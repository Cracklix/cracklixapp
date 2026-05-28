
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDJ39VgqQ35l7HpJHS3tKohrlsy3QiyE5E",
  authDomain: "cracklixapp.firebaseapp.com",
  projectId: "cracklixapp",
  storageBucket: "cracklixapp.firebasestorage.app",
  messagingSenderId: "714566850912",
  appId: "1:714566850912:web:8286886e73deeb5007e605",
  measurementId: "G-F6DBVRK0BK"
};

// Initialize Firebase
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics is client-side only
let analytics: Analytics | undefined;
if (typeof window !== 'undefined') {
  isSupported().then(yes => {
    if (yes) analytics = getAnalytics(app);
  });
}

export { app, analytics };
