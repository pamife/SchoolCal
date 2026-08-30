import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
} from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from './config';

// Initialize or get existing Firebase App instance
export const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

// Firebase Auth
export const auth = getAuth(app);

// Cloud Firestore with Offline Persistence Cache (Multi-Tab support)
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch {
  // If already initialized, get standard instance
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;
export { isFirebaseConfigured };
