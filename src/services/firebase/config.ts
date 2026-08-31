/**
 * Firebase Client Configuration
 * 
 * Securely loaded via Vite environment variables (VITE_FIREBASE_*)
 */

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

const env = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env
  : ((typeof globalThis !== 'undefined' && (globalThis as any).process?.env) ? (globalThis as any).process.env : {}) as Record<string, string | undefined>;

export const firebaseConfig: FirebaseClientConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || '',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId
  );
};
