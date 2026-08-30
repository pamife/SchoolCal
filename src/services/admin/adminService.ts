import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { firestore, auth } from '../firebase/firebaseApp';
import { generateLicenseCode, hashLicenseCode, createMaskedPrefix } from '../licensing/licenseCrypto';
import type { License, UserProfile, UserPlan, AuditLogEntry, LicenseStatus } from '../../types';
import { formatISO, addDays } from 'date-fns';

export interface GeneratedCodeItem {
  plainCode: string;
  license: License;
}

export interface AdminStats {
  totalUsers: number;
  standardUsers: number;
  plusUsers: number;
  proUsers: number;
  totalLicenses: number;
  availableLicenses: number;
  activeLicenses: number;
  expiredLicenses: number;
  revokedLicenses: number;
}

/**
 * Generates a batch of new cryptographic license codes.
 * Returns the plaintext codes once for the admin to copy or export.
 */
export async function generateLicenseBatch(
  adminUid: string,
  adminEmail: string,
  params: {
    plan: 'PLUS' | 'PRO';
    durationDays: number | null;
    count: number;
    notes?: string;
  }
): Promise<GeneratedCodeItem[]> {
  const effectiveUid = adminUid || auth.currentUser?.uid || 'admin';
  const effectiveEmail = adminEmail || auth.currentUser?.email || 'admin';
  const { plan, durationDays, count, notes } = params;
  const results: GeneratedCodeItem[] = [];
  const nowIso = formatISO(new Date());

  for (let i = 0; i < count; i++) {
    const plainCode = generateLicenseCode(plan);
    const codeHash = await hashLicenseCode(plainCode);
    const codePrefix = createMaskedPrefix(plainCode);
    const licenseId = `lic_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newLicense: License = {
      id: licenseId,
      codeHash,
      codePrefix,
      plan,
      status: 'AVAILABLE',
      durationDays: durationDays ?? null,
      createdAt: nowIso,
      expiresAt: null,
      activatedAt: null,
      activatedByUid: null,
      activatedByEmail: null,
      revokedAt: null,
      revokedByUid: null,
      notes: notes?.trim() || null,
    };

    const licRef = doc(firestore, 'licenses', licenseId);
    await setDoc(licRef, newLicense);

    results.push({
      plainCode,
      license: newLicense,
    });
  }

  // Write audit log
  const auditRef = doc(collection(firestore, 'auditLogs'));
  const auditEntry: AuditLogEntry = {
    id: auditRef.id,
    action: 'LICENSE_CREATED',
    actorUid: adminUid,
    actorEmail: adminEmail,
    details: {
      plan,
      durationDays,
      count,
      notes: notes || null,
    },
    timestamp: nowIso,
  };
  await setDoc(auditRef, auditEntry);

  return results;
}

/**
 * Fetches all licenses for the admin panel.
 */
export async function fetchAdminLicenses(): Promise<License[]> {
  const licensesRef = collection(firestore, 'licenses');
  const snap = await getDocs(licensesRef);
  const list: License[] = [];
  snap.forEach(docSnap => {
    list.push(docSnap.data() as License);
  });
  // Sort descending by createdAt
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Revokes an active or available license and downgrades the linked user to Standard.
 */
export async function revokeLicense(
  adminUid: string,
  adminEmail: string,
  licenseId: string
): Promise<void> {
  const licRef = doc(firestore, 'licenses', licenseId);
  const snap = await getDoc(licRef);
  if (!snap.exists()) throw new Error('Lizenz nicht gefunden.');

  const lic = snap.data() as License;
  const nowIso = formatISO(new Date());

  await updateDoc(licRef, {
    status: 'REVOKED',
    revokedAt: nowIso,
    revokedByUid: adminUid,
  });

  // If active user was linked, downgrade user
  if (lic.activatedByUid) {
    const userRef = doc(firestore, 'users', lic.activatedByUid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      await updateDoc(userRef, {
        plan: 'STANDARD',
        planSource: 'FREE',
        activeLicenseId: null,
        planExpiresAt: null,
        updatedAt: nowIso,
      });
    }
  }

  // Audit log
  const auditRef = doc(collection(firestore, 'auditLogs'));
  await setDoc(auditRef, {
    id: auditRef.id,
    action: 'LICENSE_REVOKED',
    actorUid: adminUid,
    actorEmail: adminEmail,
    targetUid: lic.activatedByUid || null,
    targetEmail: lic.activatedByEmail || null,
    licenseId,
    timestamp: nowIso,
  } as AuditLogEntry);
}

/**
 * Restores a revoked license.
 */
export async function restoreLicense(
  adminUid: string,
  adminEmail: string,
  licenseId: string
): Promise<void> {
  const licRef = doc(firestore, 'licenses', licenseId);
  const snap = await getDoc(licRef);
  if (!snap.exists()) throw new Error('Lizenz nicht gefunden.');

  const lic = snap.data() as License;
  const nowIso = formatISO(new Date());

  // Determine new status: if it was activated before, check if still valid
  const newStatus: LicenseStatus = lic.activatedByUid ? 'ACTIVE' : 'AVAILABLE';

  await updateDoc(licRef, {
    status: newStatus,
    revokedAt: null,
    revokedByUid: null,
  });

  // If user was linked, re-enable user plan
  if (lic.activatedByUid) {
    const userRef = doc(firestore, 'users', lic.activatedByUid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      await updateDoc(userRef, {
        plan: lic.plan,
        planSource: 'LICENSE',
        activeLicenseId: lic.id,
        planExpiresAt: lic.expiresAt,
        updatedAt: nowIso,
      });
    }
  }

  // Audit log
  const auditRef = doc(collection(firestore, 'auditLogs'));
  await setDoc(auditRef, {
    id: auditRef.id,
    action: 'LICENSE_RESTORED',
    actorUid: adminUid,
    actorEmail: adminEmail,
    targetUid: lic.activatedByUid || null,
    targetEmail: lic.activatedByEmail || null,
    licenseId,
    timestamp: nowIso,
  } as AuditLogEntry);
}

/**
 * Fetches all registered users for admin user management.
 */
export async function fetchAdminUsers(): Promise<UserProfile[]> {
  const usersRef = collection(firestore, 'users');
  const snap = await getDocs(usersRef);
  const list: UserProfile[] = [];
  snap.forEach(docSnap => {
    list.push(docSnap.data() as UserProfile);
  });
  return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

/**
 * Manually grants or changes a user plan (planSource: 'ADMIN').
 */
export async function adminSetUserPlan(
  adminUid: string,
  adminEmail: string,
  targetUid: string,
  newPlan: UserPlan,
  durationDays?: number | null
): Promise<void> {
  const userRef = doc(firestore, 'users', targetUid);
  const now = new Date();
  const nowIso = formatISO(now);

  let planExpiresAt: string | null = null;
  if (newPlan !== 'STANDARD' && durationDays && durationDays > 0) {
    planExpiresAt = formatISO(addDays(now, durationDays));
  }

  await updateDoc(userRef, {
    plan: newPlan,
    planSource: newPlan === 'STANDARD' ? 'FREE' : 'ADMIN',
    activeLicenseId: null,
    planExpiresAt,
    updatedAt: nowIso,
  });

  // Audit log
  const auditRef = doc(collection(firestore, 'auditLogs'));
  await setDoc(auditRef, {
    id: auditRef.id,
    action: 'MANUAL_PLAN_GRANTED',
    actorUid: adminUid,
    actorEmail: adminEmail,
    targetUid,
    details: {
      newPlan,
      durationDays: durationDays ?? null,
      planExpiresAt,
    },
    timestamp: nowIso,
  } as AuditLogEntry);
}

/**
 * Fetches recent audit logs.
 */
export async function fetchAdminAuditLogs(limitCount = 100): Promise<AuditLogEntry[]> {
  const auditRef = collection(firestore, 'auditLogs');
  const q = query(auditRef, orderBy('timestamp', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  const list: AuditLogEntry[] = [];
  snap.forEach(docSnap => {
    list.push(docSnap.data() as AuditLogEntry);
  });
  return list;
}

/**
 * Aggregates statistics for the admin dashboard.
 */
export async function fetchAdminStats(): Promise<AdminStats> {
  const [users, licenses] = await Promise.all([
    fetchAdminUsers(),
    fetchAdminLicenses(),
  ]);

  const standardUsers = users.filter(u => !u.plan || u.plan === 'STANDARD').length;
  const plusUsers = users.filter(u => u.plan === 'PLUS').length;
  const proUsers = users.filter(u => u.plan === 'PRO').length;

  const availableLicenses = licenses.filter(l => l.status === 'AVAILABLE').length;
  const activeLicenses = licenses.filter(l => l.status === 'ACTIVE').length;
  const expiredLicenses = licenses.filter(l => l.status === 'EXPIRED').length;
  const revokedLicenses = licenses.filter(l => l.status === 'REVOKED').length;

  return {
    totalUsers: users.length,
    standardUsers,
    plusUsers,
    proUsers,
    totalLicenses: licenses.length,
    availableLicenses,
    activeLicenses,
    expiredLicenses,
    revokedLicenses,
  };
}
