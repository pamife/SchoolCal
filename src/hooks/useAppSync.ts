import { useEffect } from 'react';
import { performAppSync } from '../services/sync/syncManager';
import { useSyncStore } from '../store/useSyncStore';
import { useAuthStore } from '../store/useAuthStore';

const PERIODIC_SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes periodic foreground sync

/**
 * useAppSync
 * Lifecycle-aware hook for PWA and mobile app data synchronization.
 * Triggers refresh on app reopen, window focus, visibility change, and network reconnect.
 */
export function useAppSync() {
  const { user } = useAuthStore();
  const { syncStatus, lastSyncTime, isOnline } = useSyncStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Initial sync on authentication / mount
    if (user?.uid) {
      performAppSync({ force: false });
    }

    // 2. Handle app returning from background (visibilitychange)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        performAppSync({ force: false });
      }
    };

    // 3. Handle window focus
    const handleFocus = () => {
      performAppSync({ force: false });
    };

    // 4. Handle pageshow (including Safari BFCache restoration)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted || document.visibilityState === 'visible') {
        performAppSync({ force: false });
      }
    };

    // 5. Handle network status changes
    const handleOnline = () => {
      useSyncStore.getState().setOnline();
      performAppSync({ force: true });
    };

    const handleOffline = () => {
      useSyncStore.getState().setOffline();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });
    window.addEventListener('focus', handleFocus, { passive: true });
    window.addEventListener('pageshow', handlePageShow, { passive: true });
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 6. Periodic interval while foregrounded
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        performAppSync({ force: false });
      }
    }, PERIODIC_SYNC_INTERVAL_MS);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.clearInterval(intervalId);
    };
  }, [user?.uid]);

  return {
    syncStatus,
    lastSyncTime,
    isOnline,
    triggerSync: performAppSync,
  };
}

export default useAppSync;
