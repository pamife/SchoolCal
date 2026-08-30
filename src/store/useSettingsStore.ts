import { create } from 'zustand';
import type { UserSettings } from '../types';
import { DEFAULT_USER_SETTINGS } from '../data/mockData';

interface SettingsState {
  settings: UserSettings;
  activeTab: string;

  loadSettings: () => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAccentColor: (color: string) => void;
  setState: (state: string) => void;
  setActiveTab: (tab: string) => void;
  resetSettings: () => void;
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

  loadSettings: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = { ...DEFAULT_USER_SETTINGS, ...parsed };
        set({ settings: merged });
        applyThemeAndAccent(merged);
        return;
      }
    } catch {
      // ignore
    }
    set({ settings: DEFAULT_USER_SETTINGS });
    applyThemeAndAccent(DEFAULT_USER_SETTINGS);
  },

  updateSettings: (updates) => {
    const newSettings = { ...get().settings, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    set({ settings: newSettings });
    applyThemeAndAccent(newSettings);
  },

  setTheme: (theme) => {
    get().updateSettings({ theme });
  },

  setAccentColor: (accentColor) => {
    get().updateSettings({ accentColor });
  },

  setState: (state) => {
    get().updateSettings({ state });
  },

  setActiveTab: (activeTab) => {
    set({ activeTab });
  },

  resetSettings: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USER_SETTINGS));
    set({ settings: DEFAULT_USER_SETTINGS });
    applyThemeAndAccent(DEFAULT_USER_SETTINGS);
  },
}));
