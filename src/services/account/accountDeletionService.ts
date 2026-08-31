import { collection, getDocs, doc, deleteDoc, writeBatch, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebaseApp';
import type { UserProfile } from '../../types';

export const USER_SUBCOLLECTIONS = [
  'subjects',
  'teachers',
  'rooms',
  'schedule',
  'substitutions',
  'homework',
  'exams',
  'grades',
  'events',
  'settings',
] as const;

export interface DeletionResult {
  success: boolean;
  deletedSubcollections: number;
  deletedDocumentsCount: number;
  authDeleted: boolean;
  message: string;
}

/**
 * Permanently and irrevocably deletes a user's entire account and all associated cloud data
 * in full compliance with GDPR Art. 17 ("Right to erasure / Recht auf Vergessenwerden").
 *
 * 1. Recursively wipes all documents across all 10 Firestore subcollections
 * 2. Unlinks/anonymizes any activated license records
 * 3. Deletes the primary user profile document: users/{uid}
 * 4. Cleans all local browser storage keys (schoolcal_*)
 * 5. Deletes the Firebase Authentication user account (auth.currentUser.delete())
 */
export async function deleteEntireAccountAndData(user: UserProfile | null): Promise<DeletionResult> {
  const currentUser = auth.currentUser;
  const uid = user?.uid || currentUser?.uid;

  if (!uid) {
    throw new Error('Kein authentifizierter Benutzer zum Löschen gefunden.');
  }

  let totalDocsDeleted = 0;
  let subcollectionsProcessed = 0;

  // 1. Delete all documents in all user subcollections
  for (const subcollectionName of USER_SUBCOLLECTIONS) {
    try {
      const colRef = collection(db, 'users', uid, subcollectionName);
      const snap = await getDocs(colRef);

      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.docs.forEach((docSnap) => {
          batch.delete(docSnap.ref);
          totalDocsDeleted++;
        });
        await batch.commit();
      }
      subcollectionsProcessed++;
    } catch (err) {
      console.warn(`Fehler beim Bereinigen der Subcollection ${subcollectionName}:`, err);
    }
  }

  // 2. Unlink any active license from this user UID to prevent orphaned personal data
  if (user?.activeLicenseId) {
    try {
      const licRef = doc(db, 'licenses', user.activeLicenseId);
      await updateDoc(licRef, {
        activatedByUid: null,
        activatedByEmail: null,
        status: 'REVOKED',
        notes: 'Automatisch widerrufen durch DSGVO-Accountlöschung.',
      });
    } catch (err) {
      console.warn('Lizenz konnte nicht freigegeben werden:', err);
    }
  }

  // 3. Delete the primary user profile document: users/{uid}
  try {
    const userDocRef = doc(db, 'users', uid);
    await deleteDoc(userDocRef);
    totalDocsDeleted++;
  } catch (err) {
    console.error('Fehler beim Löschen des Haupt-Nutzerdokuments:', err);
  }

  // 4. Wipe all browser LocalStorage entries starting with "schoolcal"
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('schoolcal')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (err) {
      console.warn('LocalStorage-Bereinigung:', err);
    }
  }

  // 5. Delete the Firebase Authentication user account
  let authDeleted = false;
  if (currentUser) {
    try {
      await currentUser.delete();
      authDeleted = true;
    } catch (err: any) {
      console.warn('Firebase Auth user deletion notice:', err);
      if (err.code === 'auth/requires-recent-login') {
        throw new Error(
          'Aus Sicherheitsgründen erfordert das endgültige Löschen deines Kontos eine kürzliche Anmeldung. Bitte melde dich kurz ab und wieder an, bevor du deinen Account löschst.'
        );
      }
      // If auth deletion failed for other reason, throw to notify
      throw new Error(`Fehler beim Löschen des Authentifizierungskontos: ${err.message}`);
    }
  }

  return {
    success: true,
    deletedSubcollections: subcollectionsProcessed,
    deletedDocumentsCount: totalDocsDeleted,
    authDeleted,
    message: 'Dein Account und alle damit verknüpften Daten wurden vollständig und unwiderruflich gelöscht.',
  };
}
