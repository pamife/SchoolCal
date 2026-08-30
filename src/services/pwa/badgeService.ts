/**
 * App Icon Badging Service for iOS 16.4+ and Desktop PWA
 * 
 * Safely updates the badge counter on the user's home screen icon.
 */

export async function updateAppBadge(count: number): Promise<boolean> {
  if (typeof window === 'undefined' || !('setAppBadge' in navigator)) {
    return false;
  }

  try {
    if (count > 0) {
      await (navigator as any).setAppBadge(count);
    } else {
      await (navigator as any).clearAppBadge();
    }
    return true;
  } catch (error) {
    console.debug('Badge API not available or rejected:', error);
    return false;
  }
}

export async function clearAppBadge(): Promise<boolean> {
  if (typeof window === 'undefined' || !('clearAppBadge' in navigator)) {
    return false;
  }

  try {
    await (navigator as any).clearAppBadge();
    return true;
  } catch (error) {
    console.debug('Failed to clear app badge:', error);
    return false;
  }
}
