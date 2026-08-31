import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NavigationTab } from '../../types';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import { haptics } from '../../utils/haptics';

// Primary linear tab navigation sequence
export const TAB_ORDER: NavigationTab[] = [
  'today',
  'calendar',
  'tasks',
  'grades',
  'school',
  'settings',
];

interface SwipeableTabsContainerProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export const SwipeableTabsContainer: React.FC<SwipeableTabsContainerProps> = ({
  activeTab,
  onTabChange,
  children,
  disabled = false,
}) => {
  const prevTabRef = useRef<NavigationTab>(activeTab);
  const [direction, setDirection] = useState<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const currentIndex = TAB_ORDER.indexOf(activeTab);
  const prevIndex = TAB_ORDER.indexOf(prevTabRef.current);

  useEffect(() => {
    if (currentIndex !== prevIndex && prevIndex !== -1 && currentIndex !== -1) {
      setDirection(currentIndex > prevIndex ? 1 : -1);
    }
    prevTabRef.current = activeTab;
  }, [activeTab, currentIndex, prevIndex]);

  const handleSwipeLeft = () => {
    if (currentIndex !== -1 && currentIndex < TAB_ORDER.length - 1) {
      const nextTab = TAB_ORDER[currentIndex + 1];
      haptics.selection();
      onTabChange(nextTab);
    }
  };

  const handleSwipeRight = () => {
    if (currentIndex !== -1 && currentIndex > 0) {
      const prevTab = TAB_ORDER[currentIndex - 1];
      haptics.selection();
      onTabChange(prevTab);
    }
  };

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    minDistance: 50,
    velocityThreshold: 0.3,
    edgeThreshold: 25, // Leave 25px on left/right for native iOS & Android back gestures
    disabled,
  });

  const variants = {
    enter: (dir: number) => ({
      x: prefersReducedMotion ? 0 : dir > 0 ? 30 : -30,
      opacity: prefersReducedMotion ? 1 : 0.85,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: prefersReducedMotion ? 0 : dir > 0 ? -30 : 30,
      opacity: prefersReducedMotion ? 1 : 0.85,
    }),
  };

  return (
    <div
      {...swipeHandlers}
      className="flex-1 w-full min-w-0 touch-pan-y"
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={activeTab}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            type: 'spring',
            damping: 32,
            stiffness: 400,
            mass: 0.8,
          }}
          className="w-full min-w-0"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
