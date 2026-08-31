import { useState, useEffect } from 'react';

export interface KeyboardViewportState {
  isKeyboardOpen: boolean;
  keyboardHeight: number;
  viewportHeight: number;
  viewportWidth: number;
  viewportOffsetTop: number;
}

let cachedState: KeyboardViewportState = {
  isKeyboardOpen: false,
  keyboardHeight: 0,
  viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
  viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 400,
  viewportOffsetTop: 0,
};

const listeners = new Set<(state: KeyboardViewportState) => void>();

function updateViewportMetrics() {
  if (typeof window === 'undefined') return;

  const vv = window.visualViewport;
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;

  let currentVvHeight = windowHeight;
  let currentVvWidth = windowWidth;
  let offsetTop = 0;
  let keyboardH = 0;

  if (vv) {
    currentVvHeight = Math.round(vv.height);
    currentVvWidth = Math.round(vv.width);
    offsetTop = Math.round(vv.offsetTop);

    // If visualViewport height is substantially smaller than window.innerHeight, keyboard is active
    const heightDifference = windowHeight - currentVvHeight;
    // Typical virtual keyboard height is > 140px
    if (heightDifference > 140) {
      keyboardH = heightDifference;
    }
  }

  const isKeyboard = keyboardH > 0;

  cachedState = {
    isKeyboardOpen: isKeyboard,
    keyboardHeight: keyboardH,
    viewportHeight: currentVvHeight,
    viewportWidth: currentVvWidth,
    viewportOffsetTop: offsetTop,
  };

  // Sync CSS custom variables on documentElement for styling & responsive sheets
  if (document.documentElement) {
    document.documentElement.style.setProperty('--visual-viewport-height', `${currentVvHeight}px`);
    document.documentElement.style.setProperty('--keyboard-height', `${keyboardH}px`);
  }

  listeners.forEach((callback) => callback(cachedState));
}

let isGlobalListenerSetup = false;

function setupGlobalViewportListeners() {
  if (isGlobalListenerSetup || typeof window === 'undefined') return;
  isGlobalListenerSetup = true;

  const vv = window.visualViewport;
  if (vv) {
    vv.addEventListener('resize', updateViewportMetrics, { passive: true });
    vv.addEventListener('scroll', updateViewportMetrics, { passive: true });
  }
  window.addEventListener('resize', updateViewportMetrics, { passive: true });
  window.addEventListener('orientationchange', () => {
    setTimeout(updateViewportMetrics, 100);
    setTimeout(updateViewportMetrics, 300);
  });

  // Initial calculation
  updateViewportMetrics();
}

/**
 * useKeyboardViewport
 * React hook that returns real-time visual viewport dimensions and keyboard visibility state.
 */
export function useKeyboardViewport(): KeyboardViewportState {
  const [state, setState] = useState<KeyboardViewportState>(() => cachedState);

  useEffect(() => {
    setupGlobalViewportListeners();
    setState(cachedState);

    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return state;
}

export default useKeyboardViewport;
