import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseApp';
import type { UserProfile } from '../../types';
import { checkAndUpdateUserPlanExpiration } from '../licensing/licenseService';
import { DEFAULT_SCHOOL_ID } from '../../config/schoolConfig';

export function translateFirebaseAuthError(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Bitte gib eine gültige E-Mail-Adresse ein.';
    case 'auth/user-disabled':
      return 'Dieses Benutzerkonto wurde deaktiviert.';
    case 'auth/user-not-found':
      return 'Es existiert kein Benutzerkonto mit dieser E-Mail-Adresse.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Das eingegebene Passwort oder die E-Mail-Adresse ist nicht korrekt.';
    case 'auth/email-already-in-use':
      return 'Diese E-Mail-Adresse ist bereits für ein anderes Konto registriert.';
    case 'auth/weak-password':
      return 'Das Passwort ist zu schwach. Bitte wähle mindestens 6 Zeichen.';
    case 'auth/network-request-failed':
      return 'Netzwerkfehler. Bitte überprüfe deine Internetverbindung.';
    case 'auth/too-many-requests':
      return 'Zu viele fehlgeschlagene Versuche. Bitte versuche es später noch einmal.';
    case 'auth/popup-closed-by-user':
      return 'Der Google-Anmeldevorgang wurde abgebrochen.';
    case 'auth/cancelled-popup-request':
      return 'Anfrage abgebrochen.';
    case 'auth/unauthorized-domain':
      return 'Diese Domain ist in der Firebase Console noch nicht autorisiert.';
    default:
      return 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.';
  }
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<UserProfile> {
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const fbUser = userCredential.user;

  if (displayName.trim()) {
    await updateProfile(fbUser, { displayName: displayName.trim() });
  }

  const profile: UserProfile = {
    uid: fbUser.uid,
    displayName: displayName.trim() || fbUser.email?.split('@')[0] || 'Schüler',
    email: fbUser.email || email.trim(),
    photoURL: fbUser.photoURL || undefined,
    plan: 'STANDARD',
    planSource: 'FREE',
    activeLicenseId: null,
    planExpiresAt: null,
    role: 'user',
    schoolId: DEFAULT_SCHOOL_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Save profile document in Firestore: users/{uid}
  try {
    await setDoc(doc(db, 'users', fbUser.uid), profile);
  } catch (err) {
    console.warn('Firestore initial user doc creation warning:', err);
  }

  return profile;
}

export async function loginWithEmail(email: string, password: string): Promise<UserProfile> {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const fbUser = userCredential.user;

  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      const validated = await checkAndUpdateUserPlanExpiration(data);
      if (!validated.schoolId) {
        validated.schoolId = DEFAULT_SCHOOL_ID;
      }
      return validated;
    }
  } catch (err) {
    console.warn('Could not load user doc on login:', err);
  }

  const fallbackProfile: UserProfile = {
    uid: fbUser.uid,
    displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Schüler',
    email: fbUser.email || email.trim(),
    photoURL: fbUser.photoURL || undefined,
    plan: 'STANDARD',
    planSource: 'FREE',
    activeLicenseId: null,
    planExpiresAt: null,
    role: 'user',
    schoolId: DEFAULT_SCHOOL_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return fallbackProfile;
}

export async function signInWithGoogle(): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const userCredential = await signInWithPopup(auth, provider);
  const fbUser = userCredential.user;

  const userDocRef = doc(db, 'users', fbUser.uid);
  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      const validated = await checkAndUpdateUserPlanExpiration(data);
      if (!validated.schoolId) {
        validated.schoolId = DEFAULT_SCHOOL_ID;
        await setDoc(userDocRef, { schoolId: DEFAULT_SCHOOL_ID }, { merge: true });
      }
      return validated;
    }
  } catch (err) {
    console.warn('Could not read user doc on Google login:', err);
  }

  const profile: UserProfile = {
    uid: fbUser.uid,
    displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Schüler',
    email: fbUser.email || '',
    photoURL: fbUser.photoURL || undefined,
    plan: 'STANDARD',
    planSource: 'FREE',
    activeLicenseId: null,
    planExpiresAt: null,
    role: 'user',
    schoolId: DEFAULT_SCHOOL_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(userDocRef, profile, { merge: true });
  } catch (err) {
    console.warn('Firestore initial user doc creation warning:', err);
  }

  return profile;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export function subscribeToAuthState(
  callback: (userProfile: UserProfile | null) => void
): () => void {
  return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      callback(null);
      return;
    }

    try {
      const snap = await getDoc(doc(db, 'users', fbUser.uid));
      if (snap.exists()) {
        const profile = snap.data() as UserProfile;
        const validated = await checkAndUpdateUserPlanExpiration(profile);
        if (!validated.schoolId) {
          validated.schoolId = DEFAULT_SCHOOL_ID;
        }
        callback(validated);
        return;
      }
    } catch {
      // ignore
    }

    const fallbackProfile: UserProfile = {
      uid: fbUser.uid,
      displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Schüler',
      email: fbUser.email || '',
      photoURL: fbUser.photoURL || undefined,
      plan: 'STANDARD',
      planSource: 'FREE',
      activeLicenseId: null,
      planExpiresAt: null,
      role: 'user',
      schoolId: DEFAULT_SCHOOL_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    callback(fallbackProfile);
  });
}

