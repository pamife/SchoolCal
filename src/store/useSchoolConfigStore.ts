import { create } from 'zustand';
import type {
  SchoolProfile,
  SchedulePeriodTime,
  ScheduleBreak,
  SchoolWebUntisConfig,
  Holiday,
  BreakDisplayMode,
  DayScheduleOverride,
} from '../types';
import {
  DEFAULT_SCHOOL_ID,
  DEFAULT_SCHOOL_PROFILE,
  OFFICIAL_SCHERPF_PERIODS,
  OFFICIAL_SCHERPF_BREAKS,
  DEFAULT_WEBUNTIS_CONFIG,
  DEFAULT_BREAK_DISPLAY_MODE,
} from '../config/schoolConfig';
import {
  fetchSchoolProfile,
  fetchSchoolPeriods,
  fetchSchoolBreaks,
  fetchSchoolHolidays,
  saveSchoolProfile,
  saveSchoolPeriods,
  saveSchoolBreaks,
  saveSchoolWebUntisConfig,
  saveSchoolHoliday,
  deleteSchoolHoliday,
  subscribeSchoolConfig,
} from '../services/school/schoolConfigService';

interface SchoolConfigState {
  schoolProfile: SchoolProfile;
  periods: SchedulePeriodTime[];
  dayOverrides: DayScheduleOverride | undefined;
  breaks: ScheduleBreak[];
  breakDisplayMode: BreakDisplayMode;
  schoolHolidays: Holiday[];
  webUntisConfig: SchoolWebUntisConfig;
  isLoading: boolean;
  isOfflineFallback: boolean;
  lastSyncedAt: string | null;

  // Selectors & Helpers
  getPeriodsForDay: (dayOfWeek: number) => SchedulePeriodTime[];

  // Actions
  loadSchoolConfig: (schoolId?: string) => Promise<void>;
  initRealtimeListener: (schoolId?: string) => () => void;
  updateSchoolProfile: (
    adminUid: string,
    adminEmail: string,
    updates: Partial<SchoolProfile>
  ) => Promise<void>;
  updatePeriods: (
    adminUid: string,
    adminEmail: string,
    periods: SchedulePeriodTime[],
    dayOverrides?: DayScheduleOverride
  ) => Promise<void>;
  updateBreaks: (
    adminUid: string,
    adminEmail: string,
    breaks: ScheduleBreak[],
    displayMode?: BreakDisplayMode
  ) => Promise<void>;
  updateWebUntisConfig: (
    adminUid: string,
    adminEmail: string,
    config: SchoolWebUntisConfig
  ) => Promise<void>;
  addSchoolHoliday: (
    adminUid: string,
    adminEmail: string,
    holiday: Holiday
  ) => Promise<void>;
  removeSchoolHoliday: (
    adminUid: string,
    adminEmail: string,
    holidayId: string
  ) => Promise<void>;
}

const STORAGE_KEY_CONFIG = 'schoolcal_cached_school_config';

function loadCachedConfig(): Partial<SchoolConfigState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return null;
}

function saveCachedConfig(state: {
  schoolProfile: SchoolProfile;
  periods: SchedulePeriodTime[];
  dayOverrides?: DayScheduleOverride;
  breaks: ScheduleBreak[];
  breakDisplayMode: BreakDisplayMode;
  webUntisConfig: SchoolWebUntisConfig;
}) {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(state));
  } catch {
    // ignore
  }
}

const cached = loadCachedConfig();

export const useSchoolConfigStore = create<SchoolConfigState>((set, get) => ({
  schoolProfile: cached?.schoolProfile || DEFAULT_SCHOOL_PROFILE,
  periods: cached?.periods && cached.periods.length > 0 ? cached.periods : OFFICIAL_SCHERPF_PERIODS,
  dayOverrides: cached?.dayOverrides,
  breaks: cached?.breaks && cached.breaks.length > 0 ? cached.breaks : OFFICIAL_SCHERPF_BREAKS,
  breakDisplayMode: cached?.breakDisplayMode || DEFAULT_BREAK_DISPLAY_MODE,
  schoolHolidays: [],
  webUntisConfig: cached?.webUntisConfig || DEFAULT_WEBUNTIS_CONFIG,
  isLoading: false,
  isOfflineFallback: false,
  lastSyncedAt: null,

  getPeriodsForDay: (dayOfWeek: number): SchedulePeriodTime[] => {
    const { periods, dayOverrides } = get();
    if (!dayOverrides) return periods;

    const dayMap: Record<number, keyof DayScheduleOverride> = {
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
    };

    const key = dayMap[dayOfWeek];
    if (key && dayOverrides[key] && (dayOverrides[key]?.length || 0) > 0) {
      return dayOverrides[key]!;
    }

    return periods;
  },

  loadSchoolConfig: async (schoolId = DEFAULT_SCHOOL_ID) => {
    set({ isLoading: true });

    try {
      const [profile, periodsData, breaksData, holidays] = await Promise.all([
        fetchSchoolProfile(schoolId),
        fetchSchoolPeriods(schoolId),
        fetchSchoolBreaks(schoolId),
        fetchSchoolHolidays(schoolId),
      ]);

      const nowIso = new Date().toISOString();
      const updatedState = {
        schoolProfile: profile,
        periods: periodsData.periods,
        dayOverrides: periodsData.dayOverrides,
        breaks: breaksData.breaks,
        breakDisplayMode: breaksData.displayMode,
        schoolHolidays: holidays,
        webUntisConfig: profile.webUntisConfig || DEFAULT_WEBUNTIS_CONFIG,
        isLoading: false,
        isOfflineFallback: false,
        lastSyncedAt: nowIso,
      };

      set(updatedState);
      saveCachedConfig(updatedState);
    } catch (err) {
      console.warn('Using cached or default school config due to network/firestore:', err);
      set({
        isLoading: false,
        isOfflineFallback: true,
      });
    }
  },

  initRealtimeListener: (schoolId = DEFAULT_SCHOOL_ID) => {
    return subscribeSchoolConfig(schoolId, {
      onPeriodsUpdate: (periods, dayOverrides) => {
        set({ periods, dayOverrides, lastSyncedAt: new Date().toISOString() });
        const current = get();
        saveCachedConfig({
          schoolProfile: current.schoolProfile,
          periods,
          dayOverrides,
          breaks: current.breaks,
          breakDisplayMode: current.breakDisplayMode,
          webUntisConfig: current.webUntisConfig,
        });
      },
      onBreaksUpdate: (breaks, displayMode) => {
        set({ breaks, breakDisplayMode: displayMode, lastSyncedAt: new Date().toISOString() });
        const current = get();
        saveCachedConfig({
          schoolProfile: current.schoolProfile,
          periods: current.periods,
          dayOverrides: current.dayOverrides,
          breaks,
          breakDisplayMode: displayMode,
          webUntisConfig: current.webUntisConfig,
        });
      },
      onProfileUpdate: (profile) => {
        set({
          schoolProfile: profile,
          webUntisConfig: profile.webUntisConfig || DEFAULT_WEBUNTIS_CONFIG,
          lastSyncedAt: new Date().toISOString(),
        });
        const current = get();
        saveCachedConfig({
          schoolProfile: profile,
          periods: current.periods,
          dayOverrides: current.dayOverrides,
          breaks: current.breaks,
          breakDisplayMode: current.breakDisplayMode,
          webUntisConfig: profile.webUntisConfig || DEFAULT_WEBUNTIS_CONFIG,
        });
      },
    });
  },

  updateSchoolProfile: async (adminUid, adminEmail, updates) => {
    const schoolId = get().schoolProfile.id || DEFAULT_SCHOOL_ID;
    const updated = await saveSchoolProfile(adminUid, adminEmail, schoolId, updates);
    set({ schoolProfile: updated, lastSyncedAt: new Date().toISOString() });
    const current = get();
    saveCachedConfig({
      schoolProfile: updated,
      periods: current.periods,
      dayOverrides: current.dayOverrides,
      breaks: current.breaks,
      breakDisplayMode: current.breakDisplayMode,
      webUntisConfig: current.webUntisConfig,
    });
  },

  updatePeriods: async (adminUid, adminEmail, periods, dayOverrides) => {
    const schoolId = get().schoolProfile.id || DEFAULT_SCHOOL_ID;
    await saveSchoolPeriods(adminUid, adminEmail, schoolId, periods, dayOverrides);
    set({ periods, dayOverrides, lastSyncedAt: new Date().toISOString() });
    const current = get();
    saveCachedConfig({
      schoolProfile: current.schoolProfile,
      periods,
      dayOverrides,
      breaks: current.breaks,
      breakDisplayMode: current.breakDisplayMode,
      webUntisConfig: current.webUntisConfig,
    });
  },

  updateBreaks: async (adminUid, adminEmail, breaks, displayMode = 'banner') => {
    const schoolId = get().schoolProfile.id || DEFAULT_SCHOOL_ID;
    await saveSchoolBreaks(adminUid, adminEmail, schoolId, breaks, displayMode);
    set({ breaks, breakDisplayMode: displayMode, lastSyncedAt: new Date().toISOString() });
    const current = get();
    saveCachedConfig({
      schoolProfile: current.schoolProfile,
      periods: current.periods,
      dayOverrides: current.dayOverrides,
      breaks,
      breakDisplayMode: displayMode,
      webUntisConfig: current.webUntisConfig,
    });
  },

  updateWebUntisConfig: async (adminUid, adminEmail, webUntisConfig) => {
    const schoolId = get().schoolProfile.id || DEFAULT_SCHOOL_ID;
    await saveSchoolWebUntisConfig(adminUid, adminEmail, schoolId, webUntisConfig);
    set({ webUntisConfig, lastSyncedAt: new Date().toISOString() });
    const current = get();
    saveCachedConfig({
      schoolProfile: current.schoolProfile,
      periods: current.periods,
      dayOverrides: current.dayOverrides,
      breaks: current.breaks,
      breakDisplayMode: current.breakDisplayMode,
      webUntisConfig,
    });
  },

  addSchoolHoliday: async (adminUid, adminEmail, holiday) => {
    const schoolId = get().schoolProfile.id || DEFAULT_SCHOOL_ID;
    await saveSchoolHoliday(adminUid, adminEmail, schoolId, holiday);
    const holidays = await fetchSchoolHolidays(schoolId);
    set({ schoolHolidays: holidays, lastSyncedAt: new Date().toISOString() });
  },

  removeSchoolHoliday: async (adminUid, adminEmail, holidayId) => {
    const schoolId = get().schoolProfile.id || DEFAULT_SCHOOL_ID;
    await deleteSchoolHoliday(adminUid, adminEmail, schoolId, holidayId);
    const holidays = await fetchSchoolHolidays(schoolId);
    set({ schoolHolidays: holidays, lastSyncedAt: new Date().toISOString() });
  },
}));
