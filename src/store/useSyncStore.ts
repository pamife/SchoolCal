import { create } from 'zustand';

export type SyncState = 'idle' | 'syncing' | 'success' | 'error';

interface SyncStore {
  syncStatus: SyncState;
  lastSyncTime: Date | null;
  lastSyncFormatted: string;
  lastError: string | null;
  isOnline: boolean;

  setSyncing: () => void;
  setSuccess: () => void;
  setError: (errorMessage: string) => void;
  setOnline: () => void;
  setOffline: () => void;
  getFormattedRelativeTime: () => string;
}

function formatRelativeTime(date: Date | null): string {
  if (!date) return 'Noch nicht synchronisiert';
  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffSeconds < 30) return 'Gerade eben';
  if (diffSeconds < 60) return 'Vor weniger als 1 Minute';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes === 1) return 'Vor 1 Minute';
  if (diffMinutes < 60) return `Vor ${diffMinutes} Minuten`;

  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export const useSyncStore = create<SyncStore>((set, get) => ({
  syncStatus: 'idle',
  lastSyncTime: typeof window !== 'undefined' ? new Date() : null,
  lastSyncFormatted: 'Gerade eben',
  lastError: null,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,

  setSyncing: () => {
    set({
      syncStatus: 'syncing',
      lastError: null,
    });
  },

  setSuccess: () => {
    const now = new Date();
    set({
      syncStatus: 'success',
      lastSyncTime: now,
      lastSyncFormatted: 'Gerade eben',
      lastError: null,
      isOnline: true,
    });
  },

  setError: (errorMessage: string) => {
    set({
      syncStatus: 'error',
      lastError: errorMessage,
    });
  },

  setOnline: () => {
    set({
      isOnline: true,
      lastError: null,
    });
  },

  setOffline: () => {
    set({
      isOnline: false,
      syncStatus: 'error',
      lastError: 'Keine Internetverbindung',
    });
  },

  getFormattedRelativeTime: () => {
    return formatRelativeTime(get().lastSyncTime);
  },
}));
