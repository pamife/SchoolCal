/**
 * Firebase Client Configuration
 * 
 * Supports both Environment Variables (VITE_FIREBASE_*) and
 * embedded project configuration for seamless Netlify deployments.
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

export const firebaseConfig: FirebaseClientConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC_2OaNw5agkKOkDs4iWvDzYD-FqTe9hsE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'schoolcal-app-124bc.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'schoolcal-app-124bc',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'schoolcal-app-124bc.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '849147109804',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:849147109804:web:5c85c3161baadf69ef9a09',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-W6JKVZ7VLE',
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'your_api_key_here'
  );
};
