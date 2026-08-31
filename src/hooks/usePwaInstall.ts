import { useState, useEffect, useCallback } from 'react';
import {
  getDevicePlatformInfo,
  subscribeToPwaState,
  triggerNativeInstallPrompt,
  type DevicePlatformInfo,
} from '../services/pwa/pwaService';

export interface UsePwaInstallResult {
  platform: DevicePlatformInfo;
  installOutcome: 'idle' | 'installing' | 'accepted' | 'dismissed';
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
  refresh: () => void;
}

export function usePwaInstall(): UsePwaInstallResult {
  const [platform, setPlatform] = useState<DevicePlatformInfo>(() => getDevicePlatformInfo());
  const [installOutcome, setInstallOutcome] = useState<'idle' | 'installing' | 'accepted' | 'dismissed'>('idle');

  const refresh = useCallback(() => {
    setPlatform(getDevicePlatformInfo());
  }, []);

  useEffect(() => {
    // Subscribe to PWA deferred prompt & installation changes
    const unsubscribe = subscribeToPwaState(() => {
      refresh();
    });

    // Also update if display mode or window state changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = () => refresh();
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }

    return () => {
      unsubscribe();
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
    };
  }, [refresh]);

  const promptInstall = useCallback(async () => {
    setInstallOutcome('installing');
    const outcome = await triggerNativeInstallPrompt();
    if (outcome === 'accepted') {
      setInstallOutcome('accepted');
    } else if (outcome === 'dismissed') {
      setInstallOutcome('dismissed');
    } else {
      setInstallOutcome('idle');
    }
    refresh();
    return outcome;
  }, [refresh]);

  return {
    platform,
    installOutcome,
    promptInstall,
    refresh,
  };
}
