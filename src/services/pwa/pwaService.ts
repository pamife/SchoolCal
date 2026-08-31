/**
 * SchoolCal PWA & Platform Detection Service
 * 
 * Provides accurate, feature-detection-first identification of:
 * - Standalone PWA vs Browser mode
 * - Device category (iPhone, iPad, Android Phone, Android Tablet, Windows, Mac, Linux)
 * - Browser (Safari, Chrome, Edge, Samsung Internet, Firefox, Opera, etc.)
 * - Native PWA install prompt availability (`beforeinstallprompt`)
 * 
 * IMPORTANT: Strictly avoids claiming unsupported APIs on iOS/Safari or desktop browsers.
 */

export type DeviceType =
  | 'iphone'
  | 'ipad'
  | 'android_phone'
  | 'android_tablet'
  | 'windows'
  | 'mac'
  | 'linux'
  | 'other';

export type BrowserType =
  | 'safari'
  | 'chrome'
  | 'edge'
  | 'samsung'
  | 'firefox'
  | 'opera'
  | 'brave'
  | 'other';

export interface DevicePlatformInfo {
  isStandalone: boolean;
  deviceType: DeviceType;
  browserType: BrowserType;
  osName: string;
  browserName: string;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  isTablet: boolean;
  canNativePrompt: boolean;
  supportsPwaInstall: boolean;
  pushNotificationRequirement?: string;
}

// Global deferred prompt holder for Chromium beforeinstallprompt event
let deferredInstallPrompt: any = null;
const listeners = new Set<() => void>();

/**
 * Initialize beforeinstallprompt and appinstalled event listeners
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    // Prevent default mini-infobar on mobile Chrome
    e.preventDefault();
    deferredInstallPrompt = e;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    notifyListeners();
  });
}

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore
    }
  });
}

export function subscribeToPwaState(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Detects if the app is currently running in standalone PWA mode
 */
export function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;

  // iOS Safari standalone flag
  const isIosStandalone = (window.navigator as any).standalone === true;

  // Modern display-mode media query
  const isDisplayModeStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isDisplayModeFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
  const isDisplayModeMinimalUi = window.matchMedia('(display-mode: minimal-ui)').matches;

  // Android TWA referrer check
  const isAndroidTwa = typeof document !== 'undefined' && document.referrer.includes('android-app://');

  return (
    isIosStandalone ||
    isDisplayModeStandalone ||
    isDisplayModeFullscreen ||
    isDisplayModeMinimalUi ||
    isAndroidTwa
  );
}

/**
 * Detects current device, OS, browser, and PWA capabilities
 */
export function getDevicePlatformInfo(): DevicePlatformInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      isStandalone: false,
      deviceType: 'other',
      browserType: 'other',
      osName: 'Unbekannt',
      browserName: 'Browser',
      isIOS: false,
      isAndroid: false,
      isDesktop: true,
      isTablet: false,
      canNativePrompt: false,
      supportsPwaInstall: true,
    };
  }

  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  // 1. Detect Device & OS
  const isIPhone = /iPhone|iPod/.test(ua);
  const isIPad =
    /iPad/.test(ua) ||
    (platform === 'MacIntel' && maxTouchPoints > 1 && !/iPhone/.test(ua));
  const isIOS = isIPhone || isIPad;

  const isAndroid = /Android/.test(ua);
  const isAndroidTablet = isAndroid && (!/Mobile/.test(ua) || (typeof window !== 'undefined' && window.innerWidth >= 768));
  const isAndroidPhone = isAndroid && !isAndroidTablet;

  const isWindows = /Win/.test(platform) || /Windows/i.test(ua);
  const isMac = (/Mac/.test(platform) || /Macintosh/i.test(ua)) && !isIPad;
  const isLinux = (/Linux/.test(platform) || /Linux/i.test(ua)) && !isAndroid;

  let deviceType: DeviceType = 'other';
  let osName = 'Betriebssystem';

  if (isIPhone) {
    deviceType = 'iphone';
    osName = 'iOS (iPhone)';
  } else if (isIPad) {
    deviceType = 'ipad';
    osName = 'iPadOS (iPad)';
  } else if (isAndroidTablet) {
    deviceType = 'android_tablet';
    osName = 'Android Tablet';
  } else if (isAndroidPhone) {
    deviceType = 'android_phone';
    osName = 'Android Smartphone';
  } else if (isWindows) {
    deviceType = 'windows';
    osName = 'Windows';
  } else if (isMac) {
    deviceType = 'mac';
    osName = 'macOS';
  } else if (isLinux) {
    deviceType = 'linux';
    osName = 'Linux';
  }

  const isDesktop = isWindows || isMac || isLinux;
  const isTablet = isIPad || isAndroidTablet;

  // 2. Detect Browser
  let browserType: BrowserType = 'other';
  let browserName = 'Browser';

  if (/SamsungBrowser/i.test(ua)) {
    browserType = 'samsung';
    browserName = 'Samsung Internet';
  } else if (/Edg/i.test(ua)) {
    browserType = 'edge';
    browserName = 'Microsoft Edge';
  } else if (/OPR|Opera/i.test(ua)) {
    browserType = 'opera';
    browserName = 'Opera';
  } else if (/Chrome|CriOS/i.test(ua)) {
    browserType = 'chrome';
    browserName = 'Google Chrome';
  } else if (/Firefox|FxiOS/i.test(ua)) {
    browserType = 'firefox';
    browserName = 'Mozilla Firefox';
  } else if (/Safari/i.test(ua)) {
    browserType = 'safari';
    browserName = 'Apple Safari';
  }

  const isStandalone = isRunningStandalone();
  const canNativePrompt = Boolean(deferredInstallPrompt) && !isStandalone;

  // Check general PWA support
  let supportsPwaInstall = true;
  if (isIOS && browserType !== 'safari') {
    // Third-party browsers on iOS historically don't support full PWA "Add to Home Screen"
    supportsPwaInstall = false;
  }

  // Push notification explanation
  let pushNotificationRequirement: string | undefined;
  if (isIOS) {
    pushNotificationRequirement =
      'Hinweis für Apple iOS: Web-Benachrichtigungen werden von Apple (ab iOS 16.4) nur dann zugestellt, wenn SchoolCal zum Home-Bildschirm hinzugefügt wurde.';
  }

  return {
    isStandalone,
    deviceType,
    browserType,
    osName,
    browserName,
    isIOS,
    isAndroid,
    isDesktop,
    isTablet,
    canNativePrompt,
    supportsPwaInstall,
    pushNotificationRequirement,
  };
}

/**
 * Triggers the browser's native PWA installation prompt (Chromium on Android / Windows / Mac)
 */
export async function triggerNativeInstallPrompt(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredInstallPrompt) {
    return 'unavailable';
  }

  try {
    // Show prompt
    await deferredInstallPrompt.prompt();
    // Wait for user choice
    const choice = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    notifyListeners();
    return choice.outcome === 'accepted' ? 'accepted' : 'dismissed';
  } catch (err) {
    console.error('Error invoking native PWA install prompt:', err);
    deferredInstallPrompt = null;
    notifyListeners();
    return 'unavailable';
  }
}
