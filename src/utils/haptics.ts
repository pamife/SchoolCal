/**
 * SchoolCal Haptics Utility
 * Provides subtle tactile feedback for native-feeling mobile touch interactions.
 * Safely falls back on devices/browsers where Vibration API is unavailable.
 */

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

class HapticsService {
  private isSupported: boolean = false;
  private isEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      this.isSupported = typeof navigator.vibrate === 'function';
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public trigger(type: HapticType = 'light') {
    if (!this.isSupported || !this.isEnabled) {
      return;
    }

    try {
      switch (type) {
        case 'selection':
          // Subtle micro-tap for tab switching, segmented control, date picker
          navigator.vibrate(6);
          break;
        case 'light':
          // Standard soft touch feedback (button press, card click)
          navigator.vibrate(12);
          break;
        case 'medium':
          // Drag threshold reached, item picked up
          navigator.vibrate(22);
          break;
        case 'heavy':
          // Modal snap, bottom sheet dismiss
          navigator.vibrate(35);
          break;
        case 'success':
          // Task completed, saved changes (double pulse)
          navigator.vibrate([15, 45, 18]);
          break;
        case 'warning':
          // Destructive swipe reveal, warning
          navigator.vibrate([25, 40, 25]);
          break;
        case 'error':
          // Action denied, error state
          navigator.vibrate([40, 50, 40, 50, 40]);
          break;
      }
    } catch {
      // Ignore vibration errors on restricted platforms
    }
  }

  public light() {
    this.trigger('light');
  }

  public medium() {
    this.trigger('medium');
  }

  public heavy() {
    this.trigger('heavy');
  }

  public selection() {
    this.trigger('selection');
  }

  public success() {
    this.trigger('success');
  }

  public warning() {
    this.trigger('warning');
  }

  public error() {
    this.trigger('error');
  }
}

export const haptics = new HapticsService();
