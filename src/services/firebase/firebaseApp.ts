import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  Firestore,
} from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from './config';

// Initialize Firebase App safely
let appInstance: FirebaseApp;
if (getApps().length === 0) {
  appInstance = initializeApp(firebaseConfig);
} else {
  appInstance = getApp();
}

export const app = appInstance;

// Firebase Auth
export const auth: Auth = getAuth(app);

// Cloud Firestore with Offline Persistence Cache (graceful fallback)
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch {
  try {
    firestoreInstance = getFirestore(app);
  } catch (err) {
    console.error('Firestore init error:', err);
    firestoreInstance = getFirestore(app);
  }
}

export const db = firestoreInstance;
export const firestore = firestoreInstance;
export { isFirebaseConfigured };
