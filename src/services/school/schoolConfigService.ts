import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseApp';
import type {
  SchoolProfile,
  SchedulePeriodTime,
  ScheduleBreak,
  SchoolWebUntisConfig,
  Holiday,
  SchoolAuditLogEntry,
  BreakDisplayMode,
  DayScheduleOverride,
  SchoolSchedulePeriodsDoc,
  SchoolScheduleBreaksDoc,
} from '../../types';
import {
  DEFAULT_SCHOOL_ID,
  DEFAULT_SCHOOL_PROFILE,
  OFFICIAL_SCHERPF_PERIODS,
  OFFICIAL_SCHERPF_BREAKS,
  DEFAULT_WEBUNTIS_CONFIG,
  DEFAULT_BREAK_DISPLAY_MODE,
} from '../../config/schoolConfig';

/**
 * Strips undefined properties recursively for Firestore compatibility
 */
function sanitizeForFirestore<T>(data: T): any {
  if (data === null || data === undefined) {
    return null;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item));
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned;
  }
  return data;
}

/**
 * Loads the central school profile document from Firestore
 */
export async function fetchSchoolProfile(schoolId = DEFAULT_SCHOOL_ID): Promise<SchoolProfile> {
  try {
    const schoolRef = doc(db, 'schools', schoolId);
    const snap = await getDoc(schoolRef);
    if (snap.exists()) {
      return snap.data() as SchoolProfile;
    }
  } catch (err) {
    console.warn(`Could not fetch school profile from Firestore (${schoolId}):`, err);
  }
  return DEFAULT_SCHOOL_PROFILE;
}

/**
 * Loads lesson periods and weekday overrides
 */
export async function fetchSchoolPeriods(
  schoolId = DEFAULT_SCHOOL_ID
): Promise<{ periods: SchedulePeriodTime[]; dayOverrides?: DayScheduleOverride }> {
  try {
    const periodsRef = doc(db, 'schools', schoolId, 'scheduleConfig', 'periods');
    const snap = await getDoc(periodsRef);
    if (snap.exists()) {
      const data = snap.data() as SchoolSchedulePeriodsDoc;
      if (data.periods && data.periods.length > 0) {
        return { periods: data.periods, dayOverrides: data.dayOverrides };
      }
    }
  } catch (err) {
    console.warn(`Could not fetch school periods from Firestore (${schoolId}):`, err);
  }
  return { periods: OFFICIAL_SCHERPF_PERIODS };
}

/**
 * Loads breaks and break display settings
 */
export async function fetchSchoolBreaks(
  schoolId = DEFAULT_SCHOOL_ID
): Promise<{ breaks: ScheduleBreak[]; displayMode: BreakDisplayMode }> {
  try {
    const breaksRef = doc(db, 'schools', schoolId, 'scheduleConfig', 'breaks');
    const snap = await getDoc(breaksRef);
    if (snap.exists()) {
      const data = snap.data() as SchoolScheduleBreaksDoc;
      if (data.breaks && data.breaks.length > 0) {
        return {
          breaks: data.breaks,
          displayMode: data.displayMode || DEFAULT_BREAK_DISPLAY_MODE,
        };
      }
    }
  } catch (err) {
    console.warn(`Could not fetch school breaks from Firestore (${schoolId}):`, err);
  }
  return {
    breaks: OFFICIAL_SCHERPF_BREAKS,
    displayMode: DEFAULT_BREAK_DISPLAY_MODE,
  };
}

/**
 * Loads custom school-specific holidays and movable days
 */
export async function fetchSchoolHolidays(schoolId = DEFAULT_SCHOOL_ID): Promise<Holiday[]> {
  try {
    const colRef = collection(db, 'schools', schoolId, 'holidays');
    const snap = await getDocs(colRef);
    const results: Holiday[] = [];
    snap.forEach((docSnap) => {
      results.push(docSnap.data() as Holiday);
    });
    return results;
  } catch (err) {
    console.warn(`Could not fetch school holidays from Firestore (${schoolId}):`, err);
    return [];
  }
}

/**
 * Loads audit log entries for school configuration changes
 */
export async function fetchSchoolAuditLogs(
  schoolId = DEFAULT_SCHOOL_ID,
  limitCount = 50
): Promise<SchoolAuditLogEntry[]> {
  try {
    const logsRef = collection(db, 'schools', schoolId, 'auditLogs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    const list: SchoolAuditLogEntry[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as SchoolAuditLogEntry);
    });
    return list;
  } catch (err) {
    console.warn(`Could not fetch school audit logs from Firestore (${schoolId}):`, err);
    return [];
  }
}

/**
 * Updates central school profile (Admin only)
 */
export async function saveSchoolProfile(
  adminUid: string,
  adminEmail: string,
  schoolId = DEFAULT_SCHOOL_ID,
  updates: Partial<SchoolProfile>
): Promise<SchoolProfile> {
  const schoolRef = doc(db, 'schools', schoolId);
  const nowIso = new Date().toISOString();
  const existing = await fetchSchoolProfile(schoolId);

  const merged: SchoolProfile = {
    ...existing,
    ...updates,
    id: schoolId,
    updatedAt: nowIso,
    updatedByUid: adminUid,
  };

  await setDoc(schoolRef, sanitizeForFirestore(merged), { merge: true });

  // Record audit log
  await recordSchoolAuditLog(schoolId, {
    action: 'SCHOOL_PROFILE_UPDATED',
    actorUid: adminUid,
    actorEmail: adminEmail,
    details: updates,
    timestamp: nowIso,
  });

  return merged;
}

/**
 * Updates central lesson periods (Admin only)
 */
export async function saveSchoolPeriods(
  adminUid: string,
  adminEmail: string,
  schoolId = DEFAULT_SCHOOL_ID,
  periods: SchedulePeriodTime[],
  dayOverrides?: DayScheduleOverride
): Promise<void> {
  const periodsRef = doc(db, 'schools', schoolId, 'scheduleConfig', 'periods');
  const nowIso = new Date().toISOString();

  const data: SchoolSchedulePeriodsDoc = {
    periods,
    dayOverrides,
    updatedAt: nowIso,
    updatedByUid: adminUid,
  };

  await setDoc(periodsRef, sanitizeForFirestore(data));

  // Record audit log
  await recordSchoolAuditLog(schoolId, {
    action: 'PERIODS_UPDATED',
    actorUid: adminUid,
    actorEmail: adminEmail,
    details: { periodCount: periods.length, hasDayOverrides: Boolean(dayOverrides) },
    timestamp: nowIso,
  });
}

/**
 * Updates central breaks and calendar display mode (Admin only)
 */
export async function saveSchoolBreaks(
  adminUid: string,
  adminEmail: string,
  schoolId = DEFAULT_SCHOOL_ID,
  breaks: ScheduleBreak[],
  displayMode: BreakDisplayMode = 'banner'
): Promise<void> {
  const breaksRef = doc(db, 'schools', schoolId, 'scheduleConfig', 'breaks');
  const nowIso = new Date().toISOString();

  const data: SchoolScheduleBreaksDoc = {
    breaks,
    displayMode,
    updatedAt: nowIso,
    updatedByUid: adminUid,
  };

  await setDoc(breaksRef, sanitizeForFirestore(data));

  // Record audit log
  await recordSchoolAuditLog(schoolId, {
    action: 'BREAKS_UPDATED',
    actorUid: adminUid,
    actorEmail: adminEmail,
    details: { breakCount: breaks.length, displayMode },
    timestamp: nowIso,
  });
}

/**
 * Updates central WebUntis configuration (Admin only)
 */
export async function saveSchoolWebUntisConfig(
  adminUid: string,
  adminEmail: string,
  schoolId = DEFAULT_SCHOOL_ID,
  webUntisConfig: SchoolWebUntisConfig
): Promise<void> {
  const schoolRef = doc(db, 'schools', schoolId);
  const nowIso = new Date().toISOString();

  await setDoc(
    schoolRef,
    sanitizeForFirestore({
      webUntisConfig,
      updatedAt: nowIso,
      updatedByUid: adminUid,
    }),
    { merge: true }
  );

  // Record audit log
  await recordSchoolAuditLog(schoolId, {
    action: 'WEBUNTIS_CONFIG_UPDATED',
    actorUid: adminUid,
    actorEmail: adminEmail,
    details: {
      server: webUntisConfig.server,
      school: webUntisConfig.school,
      enabled: webUntisConfig.enabled,
    },
    timestamp: nowIso,
  });
}

/**
 * Adds or updates a school-specific holiday or free day (Admin only)
 */
export async function saveSchoolHoliday(
  adminUid: string,
  adminEmail: string,
  schoolId = DEFAULT_SCHOOL_ID,
  holiday: Holiday
): Promise<void> {
  const holidayRef = doc(db, 'schools', schoolId, 'holidays', holiday.id);
  const nowIso = new Date().toISOString();

  await setDoc(holidayRef, sanitizeForFirestore(holiday));

  // Record audit log
  await recordSchoolAuditLog(schoolId, {
    action: 'HOLIDAY_ADDED',
    actorUid: adminUid,
    actorEmail: adminEmail,
    details: holiday,
    timestamp: nowIso,
  });
}

/**
 * Deletes a school-specific holiday (Admin only)
 */
export async function deleteSchoolHoliday(
  adminUid: string,
  adminEmail: string,
  schoolId = DEFAULT_SCHOOL_ID,
  holidayId: string
): Promise<void> {
  const holidayRef = doc(db, 'schools', schoolId, 'holidays', holidayId);
  const nowIso = new Date().toISOString();

  await deleteDoc(holidayRef);

  // Record audit log
  await recordSchoolAuditLog(schoolId, {
    action: 'HOLIDAY_DELETED',
    actorUid: adminUid,
    actorEmail: adminEmail,
    details: { holidayId },
    timestamp: nowIso,
  });
}

/**
 * Helper to append an immutable audit log entry
 */
async function recordSchoolAuditLog(
  schoolId: string,
  entry: Omit<SchoolAuditLogEntry, 'id'>
): Promise<void> {
  try {
    const logsCol = collection(db, 'schools', schoolId, 'auditLogs');
    const logDoc = doc(logsCol);
    const payload: SchoolAuditLogEntry = {
      id: logDoc.id,
      ...entry,
    };
    await setDoc(logDoc, sanitizeForFirestore(payload));
  } catch (err) {
    console.warn('Could not record school audit log:', err);
  }
}

/**
 * Sets up real-time listener for periods and breaks.
 * When the Admin modifies periods or breaks, all active clients receive instant live updates.
 */
export function subscribeSchoolConfig(
  schoolId = DEFAULT_SCHOOL_ID,
  callbacks: {
    onPeriodsUpdate?: (periods: SchedulePeriodTime[], dayOverrides?: DayScheduleOverride) => void;
    onBreaksUpdate?: (breaks: ScheduleBreak[], displayMode: BreakDisplayMode) => void;
    onProfileUpdate?: (profile: SchoolProfile) => void;
  }
): () => void {
  const unsubs: (() => void)[] = [];

  try {
    // 1. Periods listener
    const periodsRef = doc(db, 'schools', schoolId, 'scheduleConfig', 'periods');
    const unsubPeriods = onSnapshot(
      periodsRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SchoolSchedulePeriodsDoc;
          if (data.periods && data.periods.length > 0 && callbacks.onPeriodsUpdate) {
            callbacks.onPeriodsUpdate(data.periods, data.dayOverrides);
          }
        }
      },
      (err) => console.warn('Realtime periods subscription error:', err)
    );
    unsubs.push(unsubPeriods);

    // 2. Breaks listener
    const breaksRef = doc(db, 'schools', schoolId, 'scheduleConfig', 'breaks');
    const unsubBreaks = onSnapshot(
      breaksRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SchoolScheduleBreaksDoc;
          if (data.breaks && data.breaks.length > 0 && callbacks.onBreaksUpdate) {
            callbacks.onBreaksUpdate(data.breaks, data.displayMode || DEFAULT_BREAK_DISPLAY_MODE);
          }
        }
      },
      (err) => console.warn('Realtime breaks subscription error:', err)
    );
    unsubs.push(unsubBreaks);

    // 3. Profile listener
    const profileRef = doc(db, 'schools', schoolId);
    const unsubProfile = onSnapshot(
      profileRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SchoolProfile;
          if (callbacks.onProfileUpdate) {
            callbacks.onProfileUpdate(data);
          }
        }
      },
      (err) => console.warn('Realtime school profile subscription error:', err)
    );
    unsubs.push(unsubProfile);
  } catch (err) {
    console.warn('Could not establish real-time school config subscription:', err);
  }

  return () => {
    unsubs.forEach((unsub) => {
      try {
        unsub();
      } catch {
        // ignore
      }
    });
  };
}
