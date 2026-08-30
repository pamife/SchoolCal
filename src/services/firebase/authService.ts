import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseApp';
import type { UserProfile } from '../../types';

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
      return 'Der Anmeldevorgang wurde abgebrochen.';
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

  // Retrieve user profile from Firestore or construct from auth
  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Could not load user doc on login:', err);
  }

  const fallbackProfile: UserProfile = {
    uid: fbUser.uid,
    displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Schüler',
    email: fbUser.email || email.trim(),
    photoURL: fbUser.photoURL || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return fallbackProfile;
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
        callback(snap.data() as UserProfile);
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    callback(fallbackProfile);
  });
}
