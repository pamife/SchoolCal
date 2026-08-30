import {
  collection,
  doc,
  getDocs,
  query,
  where,
  runTransaction,
  serverTimestamp,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { firestore } from '../firebase/firebaseApp';
import { hashLicenseCode, normalizeLicenseCode } from './licenseCrypto';
import type { License, UserProfile, UserPlan, AuditLogEntry } from '../../types';
import { addDays, formatISO } from 'date-fns';

export interface ActivationResult {
  success: boolean;
  plan: UserPlan;
  expiresAt: string | null;
  message: string;
}

/**
 * Activates a license code for a user using an atomic Firestore transaction.
 * Guarantees race-condition safety and single-use enforcement.
 */
export async function activateLicenseCode(
  uid: string,
  rawCode: string,
  userEmail?: string
): Promise<ActivationResult> {
  if (!uid) {
    throw new Error('Benutzer ist nicht authentifiziert.');
  }

  const normalized = normalizeLicenseCode(rawCode);
  if (!normalized || normalized.length < 10) {
    throw new Error('Bitte gib einen vollständigen Lizenzcode ein.');
  }

  const codeHash = await hashLicenseCode(normalized);

  // 1. Find matching license document by codeHash
  const licensesRef = collection(firestore, 'licenses');
  const q = query(licensesRef, where('codeHash', '==', codeHash));
  const querySnap = await getDocs(q);

  if (querySnap.empty) {
    throw new Error('Ungültiger Lizenzcode. Bitte überprüfe deine Eingabe auf Tippfehler.');
  }

  const licenseDocSnap = querySnap.docs[0];
  const licenseId = licenseDocSnap.id;

  // 2. Perform atomic transaction to claim license & update user profile
  return await runTransaction(firestore, async (transaction) => {
    const licRef = doc(firestore, 'licenses', licenseId);
    const userRef = doc(firestore, 'users', uid);

    const currentLicSnap = await transaction.get(licRef);
    if (!currentLicSnap.exists()) {
      throw new Error('Lizenz wurde in der Datenbank nicht gefunden.');
    }

    const licenseData = currentLicSnap.data() as License;

    // Check License Status
    if (licenseData.status === 'REVOKED') {
      throw new Error('Dieser Lizenzcode wurde vom Administrator widerrufen und kann nicht mehr genutzt werden.');
    }

    if (licenseData.status === 'EXPIRED') {
      throw new Error('Dieser Lizenzcode ist bereits abgelaufen.');
    }

    if (licenseData.status === 'ACTIVE') {
      if (licenseData.activatedByUid === uid) {
        throw new Error('Du hast diesen Lizenzcode bereits für deinen Account aktiviert.');
      }
      throw new Error('Dieser Lizenzcode wurde bereits von einem anderen Benutzerkonto aktiviert.');
    }

    if (licenseData.status !== 'AVAILABLE') {
      throw new Error('Dieser Lizenzcode steht nicht mehr zur Verfügung.');
    }

    // Get current user profile to verify upgrade path
    const currentUserSnap = await transaction.get(userRef);
    let currentUserData: Partial<UserProfile> = {};
    if (currentUserSnap.exists()) {
      currentUserData = currentUserSnap.data() as UserProfile;
    }

    // Prevent downgrading a Pro user with a Plus code
    if (currentUserData.plan === 'PRO' && licenseData.plan === 'PLUS') {
      throw new Error('Du besitzt bereits den höchsten Pro-Tarif. Eine Aktivierung von Plus ist nicht erforderlich.');
    }

    // Calculate expiration date
    const now = new Date();
    let expiresAtIso: string | null = null;
    if (licenseData.durationDays && licenseData.durationDays > 0) {
      const expiryDate = addDays(now, licenseData.durationDays);
      expiresAtIso = formatISO(expiryDate);
    }

    const nowIso = formatISO(now);

    // Update License Document
    transaction.update(licRef, {
      status: 'ACTIVE',
      activatedAt: nowIso,
      activatedByUid: uid,
      activatedByEmail: userEmail || currentUserData.email || null,
      expiresAt: expiresAtIso,
    });

    // Update User Profile
    transaction.set(
      userRef,
      {
        uid,
        plan: licenseData.plan,
        planSource: 'LICENSE',
        activeLicenseId: licenseId,
        planExpiresAt: expiresAtIso,
        updatedAt: nowIso,
      },
      { merge: true }
    );

    // Append to Audit Logs
    const auditRef = doc(collection(firestore, 'auditLogs'));
    const auditEntry: AuditLogEntry = {
      id: auditRef.id,
      action: 'LICENSE_ACTIVATED',
      actorUid: uid,
      actorEmail: userEmail || currentUserData.email || 'unknown',
      targetUid: uid,
      targetEmail: userEmail || currentUserData.email || 'unknown',
      licenseId,
      details: {
        plan: licenseData.plan,
        durationDays: licenseData.durationDays,
        expiresAt: expiresAtIso,
      },
      timestamp: nowIso,
    };
    transaction.set(auditRef, auditEntry);

    return {
      success: true,
      plan: licenseData.plan,
      expiresAt: expiresAtIso,
      message: `Erfolgreich freigeschaltet! Dein Tarif wurde auf ${licenseData.plan === 'PRO' ? 'Pro' : 'Plus'} aufgewertet.`,
    };
  });
}

/**
 * Checks if a user's active subscription has passed its expiration date.
 * If expired, gracefully downgrades the user to STANDARD without deleting any user data.
 */
export async function checkAndUpdateUserPlanExpiration(user: UserProfile): Promise<UserProfile> {
  if (!user.planExpiresAt || user.plan === 'STANDARD') {
    return user;
  }

  const expiryDate = new Date(user.planExpiresAt);
  const now = new Date();

  if (expiryDate <= now) {
    const nowIso = formatISO(now);
    const userRef = doc(firestore, 'users', user.uid);

    // Update Firestore User Profile
    await updateDoc(userRef, {
      plan: 'STANDARD',
      planSource: 'FREE',
      activeLicenseId: null,
      planExpiresAt: null,
      updatedAt: nowIso,
    });

    // If there was an active license, mark it expired
    if (user.activeLicenseId) {
      try {
        const licRef = doc(firestore, 'licenses', user.activeLicenseId);
        await updateDoc(licRef, {
          status: 'EXPIRED',
        });
      } catch (e) {
        console.warn('Could not update license status to EXPIRED:', e);
      }
    }

    return {
      ...user,
      plan: 'STANDARD',
      planSource: 'FREE',
      activeLicenseId: null,
      planExpiresAt: null,
      updatedAt: nowIso,
    };
  }

  return user;
}
