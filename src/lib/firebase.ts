
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDJ39VgqQ35l7HpJHS3tKohrlsy3QiyE5E',
  authDomain: 'cracklixapp.firebaseapp.com',
  projectId: 'cracklixapp',
  storageBucket: 'cracklixapp.firebasestorage.app',
  messagingSenderId: '714566850912',
  appId: '1:714566850912:web:8286886e73deeb5007e605',
  measurementId: 'G-F6DBVRK0BK'
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
