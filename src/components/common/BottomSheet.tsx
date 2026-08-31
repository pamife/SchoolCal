import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { haptics } from '../../utils/haptics';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = 'max-h-[90vh]',
}) => {
  const [viewportBottomOffset, setViewportBottomOffset] = useState(0);
  const [viewportMaxHeight, setViewportMaxHeight] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // iOS Safari / Android Keyboard Awareness via VisualViewport
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    const updateViewport = () => {
      if (window.visualViewport) {
        const offsetBottom = Math.max(
          0,
          window.innerHeight - (window.visualViewport.height + window.visualViewport.offsetTop)
        );
        setViewportBottomOffset(offsetBottom);
        // Ensure max height never exceeds 88% of visible viewport height above keyboard
        setViewportMaxHeight(`${Math.floor(window.visualViewport.height * 0.88)}px`);
      }
    };

    updateViewport();

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', updateViewport);
      vv.addEventListener('scroll', updateViewport);
    }

    return () => {
      if (vv) {
        vv.removeEventListener('resize', updateViewport);
        vv.removeEventListener('scroll', updateViewport);
      }
    };
  }, [isOpen]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // If dragged down past 80px or with downward velocity > 250, dismiss modal
    if (info.offset.y > 80 || info.velocity.y > 250) {
      haptics.heavy();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            paddingBottom: viewportBottomOffset > 0 ? `${viewportBottomOffset}px` : undefined,
          }}
          className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center transition-[padding] duration-150 ease-out"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              haptics.selection();
              onClose();
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Sheet / Modal Container with Drag-to-Dismiss and Keyboard Lift */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            drag="y"
            dragDirectionLock
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.7 }}
            onDragEnd={handleDragEnd}
            style={{
              maxHeight: viewportMaxHeight || undefined,
            }}
            className={`relative w-full sm:max-w-lg ${maxHeight} flex flex-col bg-white dark:bg-ios-dark-card rounded-t-[28px] sm:rounded-[24px] shadow-2xl overflow-hidden z-10 border border-black/5 dark:border-white/10`}
          >
            {/* iOS Drag Handle on Mobile (Grab zone) */}
            <div className="pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing touch-none select-none">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full hover:bg-gray-400 transition-colors" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-white/10 select-none">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    haptics.selection();
                    onClose();
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Content Body */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain p-5 pb-safe"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
