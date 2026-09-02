import { useRef, useCallback } from 'react';
import { haptics } from '../utils/haptics';

export interface UseLongPressOptions {
  delay?: number; // ms, default 450
  moveTolerance?: number; // px, default 10
  triggerHaptic?: boolean;
  onLongPress: (e: React.TouchEvent | React.MouseEvent) => void;
  onClick?: (e: React.TouchEvent | React.MouseEvent) => void;
  disabled?: boolean;
}

export interface LongPressHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onTouchCancel: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

export function useLongPress({
  delay = 450,
  moveTolerance = 8,
  triggerHaptic = true,
  onLongPress,
  onClick,
  disabled = false,
}: UseLongPressOptions): LongPressHandlers {
  const timerRef = useRef<number | null>(null);
  const isLongPressTriggered = useRef(false);
  const hasMoved = useRef(false);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const start = useCallback(
    (e: React.TouchEvent | React.MouseEvent, clientX: number, clientY: number) => {
      if (disabled) return;
      isLongPressTriggered.current = false;
      hasMoved.current = false;
      startPos.current = { x: clientX, y: clientY };

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(() => {
        if (hasMoved.current) return;
        isLongPressTriggered.current = true;
        if (triggerHaptic) {
          haptics.medium();
        }
        onLongPress(e);
      }, delay);
    },
    [disabled, delay, triggerHaptic, onLongPress]
  );

  const move = useCallback(
    (clientX: number, clientY: number) => {
      const dx = Math.abs(clientX - startPos.current.x);
      const dy = Math.abs(clientY - startPos.current.y);

      if (dx > moveTolerance || dy > moveTolerance) {
        hasMoved.current = true;
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    },
    [moveTolerance]
  );

  const end = useCallback(
    (e: React.TouchEvent | React.MouseEvent, clientX?: number, clientY?: number) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (clientX !== undefined && clientY !== undefined) {
        const dx = Math.abs(clientX - startPos.current.x);
        const dy = Math.abs(clientY - startPos.current.y);
        if (dx > moveTolerance || dy > moveTolerance) {
          hasMoved.current = true;
        }
      }

      // Only trigger onClick if the user did NOT scroll/move and did NOT trigger long press
      if (!isLongPressTriggered.current && !hasMoved.current && onClick && !disabled) {
        onClick(e);
      }
    },
    [disabled, onClick, moveTolerance]
  );

  const cancel = useCallback(() => {
    hasMoved.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    onTouchStart: (e) => {
      if (e.touches.length === 1) {
        start(e, e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    onTouchMove: (e) => {
      if (e.touches.length === 1) {
        move(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    onTouchEnd: (e) => {
      const touch = e.changedTouches?.[0];
      end(e, touch?.clientX, touch?.clientY);
    },
    onTouchCancel: cancel,

    onMouseDown: (e) => start(e, e.clientX, e.clientY),
    onMouseMove: (e) => move(e.clientX, e.clientY),
    onMouseUp: (e) => end(e, e.clientX, e.clientY),
    onMouseLeave: cancel,
  };
}
