import { useAuthStore } from '../../store/useAuthStore';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useHomeworkStore } from '../../store/useHomeworkStore';
import { useExamStore } from '../../store/useExamStore';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useGradeStore } from '../../store/useGradeStore';
import { useSchoolConfigStore } from '../../store/useSchoolConfigStore';
import { useSyncStore } from '../../store/useSyncStore';
import { recalculateAutoDueDates } from '../../utils/homeworkDueDateEngine';

export interface SyncOptions {
  force?: boolean;
  background?: boolean;
}

const MIN_SYNC_INTERVAL_MS = 60 * 1000; // 60 seconds debounce between requests
const STALE_DATA_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes stale threshold

let activeSyncPromise: Promise<boolean> | null = null;

/**
 * Checks if local data is considered stale based on last sync timestamp.
 */
export function isDataStale(): boolean {
  const lastSync = useSyncStore.getState().lastSyncTime;
  if (!lastSync) return true;
  return Date.now() - lastSync.getTime() > STALE_DATA_THRESHOLD_MS;
}

/**
 * Performs a synchronized, deduplicated data refresh for SchoolCal.
 * Handles online status, error states, and stores coordination seamlessly.
 */
export async function performAppSync(options: SyncOptions = {}): Promise<boolean> {
  const { force = false } = options;

  // If offline, flag error and return
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    useSyncStore.getState().setOffline();
    return false;
  }

  // Deduplication: If a sync is already in progress, reuse the existing promise
  if (activeSyncPromise) {
    return activeSyncPromise;
  }

  // Throttle: Don't hammer the backend if data was fetched recently
  const lastSync = useSyncStore.getState().lastSyncTime;
  if (!force && lastSync && Date.now() - lastSync.getTime() < MIN_SYNC_INTERVAL_MS) {
    return true;
  }

  activeSyncPromise = (async () => {
    const syncStore = useSyncStore.getState();
    syncStore.setSyncing();

    try {
      // 1. Refresh central School Profile & Timetable configuration
      await useSchoolConfigStore.getState().loadSchoolConfig();

      const user = useAuthStore.getState().user;
      if (user?.uid) {
        const uid = user.uid;

        // 2. Load all user collections in parallel from Firestore / cache
        await Promise.all([
          useSettingsStore.getState().loadSettings(uid),
          useSchoolStore.getState().loadSchoolData(uid),
          useHomeworkStore.getState().loadHomework(uid),
          useExamStore.getState().loadExams(uid),
          useCalendarStore.getState().loadEvents(uid),
          useGradeStore.getState().loadGrades(uid),
        ]);

        // 3. Recalculate auto homework due dates if timetable changed
        const { scheduleEntries, substitutions, subjects } = useSchoolStore.getState();
        const { homework, updateHomework } = useHomeworkStore.getState();
        const settings = useSettingsStore.getState().settings;

        if (homework.length > 0 && scheduleEntries.length > 0) {
          const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));
          const recalc = recalculateAutoDueDates({
            homeworkList: homework,
            scheduleEntries,
            substitutions,
            holidayState: settings.state || 'BB',
            activeTimetableVersion: settings.activeTimetableVersion,
            settings,
            subjectNames: subjectMap,
          });

          if (recalc.hasChanges) {
            for (const item of recalc.updatedHomework) {
              await updateHomework(uid, item.id, item);
            }
          }
        }
      }

      syncStore.setSuccess();
      return true;
    } catch (err: any) {
      console.warn('Background sync encountered an error:', err);
      syncStore.setError(err?.message || 'Synchronisierung fehlgeschlagen');
      return false;
    } finally {
      activeSyncPromise = null;
    }
  })();

  return activeSyncPromise;
}
