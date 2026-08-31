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

// Fallback safe config for local testing and CI/script environments
const effectiveConfig = {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey || 'AIzaSyMockKeyForDevAndTestingEnvironment0',
  projectId: firebaseConfig.projectId || 'schoolcal-dev',
};

// Initialize Firebase App safely
let appInstance: FirebaseApp;
if (getApps().length === 0) {
  appInstance = initializeApp(effectiveConfig);
} else {
  appInstance = getApp();
}

export const app = appInstance;

// Firebase Auth (safe initialization)
let authInstance: Auth;
try {
  authInstance = getAuth(app);
} catch {
  authInstance = {} as Auth;
}
export const auth: Auth = authInstance;

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
