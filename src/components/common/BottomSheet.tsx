import React, { useEffect } from 'react';
import { motion, AnimatePresence, PanInfo, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';
import { useKeyboardViewport } from '../../hooks/useKeyboardViewport';
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
  maxHeight = 'max-h-[90dvh]',
}) => {
  const { isKeyboardOpen, keyboardHeight, viewportHeight } = useKeyboardViewport();
  const dragControls = useDragControls();

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

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Only dismiss if deliberately dragged down past 90px or with strong downward flick
    if (info.offset.y > 90 || info.velocity.y > 300) {
      haptics.heavy();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            bottom: isKeyboardOpen && keyboardHeight > 0 ? `${keyboardHeight}px` : 0,
          }}
          className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center overflow-hidden transition-[bottom] duration-150"
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

          {/* Sheet / Modal Container with Drag-to-Dismiss restricted strictly to top handle */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragDirectionLock
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.7 }}
            onDragEnd={handleDragEnd}
            style={{
              maxHeight: isKeyboardOpen
                ? `${Math.max(320, Math.floor(viewportHeight * 0.94))}px`
                : '94dvh',
            }}
            className={`relative w-full sm:max-w-lg ${maxHeight} flex flex-col bg-white dark:bg-ios-dark-card rounded-t-[28px] sm:rounded-[24px] shadow-2xl overflow-hidden overflow-x-hidden z-10 border border-black/5 dark:border-white/10`}
          >
            {/* iOS Drag Handle on Mobile (Exclusive Grab zone) */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing touch-none select-none shrink-0"
            >
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full hover:bg-gray-400 transition-colors" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-white/10 select-none shrink-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
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

            {/* Content Body with generous bottom clearance so action buttons are always 100% visible and accessible */}
            <div
              className="flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden overscroll-contain p-4 sm:p-5 pb-[max(5.5rem,calc(env(safe-area-inset-bottom,0px)+4.5rem))] pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))]"
              style={{
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
              }}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
