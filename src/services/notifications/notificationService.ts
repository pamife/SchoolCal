import type { NotificationPreferences } from '../../types';

export interface NotificationPlatformInfo {
  isSupported: boolean;
  permission: NotificationPermission;
  isStandalonePWA: boolean;
  isIOS: boolean;
  canSendPush: boolean;
  recommendation?: string;
}

export function getNotificationPlatformInfo(): NotificationPlatformInfo {
  const isSupported = typeof window !== 'undefined' && 'Notification' in window;
  const permission: NotificationPermission = isSupported ? Notification.permission : 'denied';
  
  const isIOS = typeof window !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );

  const isStandalonePWA = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );

  const canSendPush = isSupported && permission === 'granted';

  let recommendation: string | undefined;
  if (isIOS && !isStandalonePWA) {
    recommendation =
      'Auf iOS/iPadOS werden Web-Benachrichtigungen nur unterstützt, wenn SchoolCal als Web-App zum Home-Bildschirm hinzugefügt wurde (Teilen → Zum Home-Bildschirm).';
  } else if (isSupported && permission === 'default') {
    recommendation = 'Klicke auf "Berechtigung anfordern", um Mitteilungen im System zu aktivieren.';
  } else if (isSupported && permission === 'denied') {
    recommendation =
      'Benachrichtigungen wurden im Browser blockiert. Bitte erlaube Benachrichtigungen in deinen Browser- bzw. Systemeinstellungen.';
  }

  return {
    isSupported,
    permission,
    isStandalonePWA,
    isIOS,
    canSendPush,
    recommendation,
  };
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

/**
 * Checks if current time is within user's Quiet Hours (Ruhezeiten)
 */
export function isWithinQuietHours(preferences?: NotificationPreferences, refDate: Date = new Date()): boolean {
  if (!preferences || !preferences.quietHoursEnabled) return false;
  if (!preferences.quietHoursStart || !preferences.quietHoursEnd) return false;

  const currentMinutes = refDate.getHours() * 60 + refDate.getMinutes();

  const [startH, startM] = preferences.quietHoursStart.split(':').map(Number);
  const [endH, endM] = preferences.quietHoursEnd.split(':').map(Number);

  const startTotal = (startH || 0) * 60 + (startM || 0);
  const endTotal = (endH || 0) * 60 + (endM || 0);

  if (startTotal <= endTotal) {
    // Same-day quiet hours e.g. 13:00 - 15:00
    return currentMinutes >= startTotal && currentMinutes < endTotal;
  } else {
    // Overnight quiet hours e.g. 22:00 - 07:00
    return currentMinutes >= startTotal || currentMinutes < endTotal;
  }
}

/**
 * Sends a local notification if permission is granted and quiet hours allow it
 */
export async function sendLocalNotification(
  title: string,
  options?: NotificationOptions & { isCritical?: boolean; preferences?: NotificationPreferences }
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  const isCritical = options?.isCritical || false;
  if (!isCritical && isWithinQuietHours(options?.preferences)) {
    console.log(`[Notification Suppressed] Quiet hours active for: ${title}`);
    return false;
  }

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification(title, {
          icon: '/icon.svg',
          badge: '/icon.svg',
          ...options,
        });
        return true;
      }
    }

    new Notification(title, {
      icon: '/icon.svg',
      ...options,
    });
    return true;
  } catch (err) {
    console.error('Error dispatching notification:', err);
    return false;
  }
}
