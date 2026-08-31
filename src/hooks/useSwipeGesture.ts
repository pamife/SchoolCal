import { useRef, useCallback } from 'react';
import { haptics } from '../utils/haptics';

export interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  minDistance?: number;
  maxDistance?: number;
  velocityThreshold?: number;
  edgeThreshold?: number; // Distance from screen edges where gesture is ignored (for iOS Safari/Android back swipe)
  triggerHaptic?: boolean;
  disabled?: boolean;
}

export interface TouchHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onTouchCancel: () => void;
}

export function useSwipeGesture(options: SwipeGestureOptions): TouchHandlers {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    minDistance = 45,
    velocityThreshold = 0.25,
    edgeThreshold = 25,
    triggerHaptic = true,
    disabled = false,
  } = options;

  const touchState = useRef<{
    startX: number;
    startY: number;
    startTime: number;
    isLockedVertical: boolean;
    isLockedHorizontal: boolean;
    isEdgeGesture: boolean;
  }>({
    startX: 0,
    startY: 0,
    startTime: 0,
    isLockedVertical: false,
    isLockedHorizontal: false,
    isEdgeGesture: false,
  });

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const screenWidth = window.innerWidth;
      const clientX = touch.clientX;

      // Check if touch starts too close to left or right screen edge
      const isNearEdge = clientX <= edgeThreshold || clientX >= screenWidth - edgeThreshold;

      touchState.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        isLockedVertical: false,
        isLockedHorizontal: false,
        isEdgeGesture: isNearEdge,
      };
    },
    [disabled, edgeThreshold]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || e.touches.length !== 1) return;

      const state = touchState.current;
      if (state.isEdgeGesture) return; // Allow system back swipe to take precedence

      const touch = e.touches[0];
      const deltaX = touch.clientX - state.startX;
      const deltaY = touch.clientY - state.startY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Determine directional locking if not already locked
      if (!state.isLockedVertical && !state.isLockedHorizontal) {
        if (absY > 8 && absY > absX * 1.3) {
          // Dominant vertical movement -> Lock to native vertical scrolling
          state.isLockedVertical = true;
        } else if (absX > 8 && absX > absY * 1.3) {
          // Dominant horizontal movement -> Lock to horizontal swipe
          state.isLockedHorizontal = true;
        }
      }
    },
    [disabled]
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;

      const state = touchState.current;
      if (state.isEdgeGesture || state.isLockedVertical) {
        return;
      }

      const touch = e.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - state.startX;
      const deltaY = touch.clientY - state.startY;
      const deltaTime = Math.max(Date.now() - state.startTime, 1);

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      const velocityX = absX / deltaTime;
      const velocityY = absY / deltaTime;

      // Check Horizontal Swipes
      if (absX >= minDistance || (absX >= 25 && velocityX >= velocityThreshold)) {
        if (absX > absY * 1.2) {
          if (deltaX < 0 && onSwipeLeft) {
            if (triggerHaptic) haptics.selection();
            onSwipeLeft();
            return;
          }
          if (deltaX > 0 && onSwipeRight) {
            if (triggerHaptic) haptics.selection();
            onSwipeRight();
            return;
          }
        }
      }

      // Check Vertical Swipes (if configured)
      if (absY >= minDistance || (absY >= 25 && velocityY >= velocityThreshold)) {
        if (absY > absX * 1.2) {
          if (deltaY < 0 && onSwipeDown) {
            if (triggerHaptic) haptics.selection();
            onSwipeDown();
            return;
          }
          if (deltaY > 0 && onSwipeUp) {
            if (triggerHaptic) haptics.selection();
            onSwipeUp();
            return;
          }
        }
      }
    },
    [disabled, minDistance, velocityThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, triggerHaptic]
  );

  const onTouchCancel = useCallback(() => {
    touchState.current = {
      startX: 0,
      startY: 0,
      startTime: 0,
      isLockedVertical: false,
      isLockedHorizontal: false,
      isEdgeGesture: false,
    };
  }, []);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
  };
}
