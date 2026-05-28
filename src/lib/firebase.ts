
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCXXoUGojTRz0iuxzispTCrasNPRJDXjJA",
  authDomain: "studio-4007402736-dd858.firebaseapp.com",
  projectId: "studio-4007402736-dd858",
  storageBucket: "studio-4007402736-dd858.firebasestorage.app",
  messagingSenderId: "130551790638",
  appId: "1:130551790638:web:c95ca3ac844dc031bdb3bf",
  measurementId: "G-XXXXXXXXXX"
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
