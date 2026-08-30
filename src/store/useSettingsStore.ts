import { create } from 'zustand';
import type { UserSettings } from '../types';
import { DEFAULT_USER_SETTINGS } from '../data/mockData';
import { fetchUserDoc, saveUserDoc } from '../services/firebase/firestoreService';

interface SettingsState {
  settings: UserSettings;
  activeTab: string;
  isLoading: boolean;

  loadSettings: (uid?: string) => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>, uid?: string) => Promise<void>;
  setTheme: (theme: 'light' | 'dark' | 'system', uid?: string) => void;
  setAccentColor: (color: string, uid?: string) => void;
  setState: (state: string, uid?: string) => void;
  setActiveTab: (tab: string) => void;
}

const STORAGE_KEY = 'schoolcal_user_settings';

function applyThemeAndAccent(settings: UserSettings) {
  const root = document.documentElement;
  
  let isDark = false;
  if (settings.theme === 'dark') {
    isDark = true;
  } else if (settings.theme === 'light') {
    isDark = false;
  } else {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  root.style.setProperty('--accent-color', settings.accentColor);
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_USER_SETTINGS,
  activeTab: 'today',
  isLoading: false,

  loadSettings: async (uid?: string) => {
    // 1. Try local cache first for instant render
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = { ...DEFAULT_USER_SETTINGS, ...parsed };
        set({ settings: merged });
        applyThemeAndAccent(merged);
      }
    } catch {
      // ignore
    }

    // 2. If authenticated, fetch from Firestore
    if (uid) {
      set({ isLoading: true });
      try {
        const remoteSettings = await fetchUserDoc<UserSettings & { id: string }>(
          uid,
          'settings',
          'current'
        );
        if (remoteSettings) {
          const merged = { ...DEFAULT_USER_SETTINGS, ...remoteSettings };
          set({ settings: merged, isLoading: false });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          applyThemeAndAccent(merged);
          return;
        }
      } catch (err) {
        console.error('Error fetching settings from Firestore:', err);
      }
      set({ isLoading: false });
    }
  },

  updateSettings: async (updates, uid?: string) => {
    const newSettings = { ...get().settings, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    set({ settings: newSettings });
    applyThemeAndAccent(newSettings);

    if (uid) {
      try {
        await saveUserDoc<UserSettings & { id: string }>(uid, 'settings', {
          id: 'current',
          ...newSettings,
        });
      } catch (err) {
        console.error('Error saving settings to Firestore:', err);
      }
    }
  },

  setTheme: (theme, uid?: string) => {
    get().updateSettings({ theme }, uid);
  },

  setAccentColor: (accentColor, uid?: string) => {
    get().updateSettings({ accentColor }, uid);
  },

  setState: (state, uid?: string) => {
    get().updateSettings({ state }, uid);
  },

  setActiveTab: (activeTab) => {
    set({ activeTab });
  },
}));
