import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Sheet / Modal Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`relative w-full sm:max-w-lg ${maxHeight} flex flex-col bg-white dark:bg-ios-dark-card rounded-t-[28px] sm:rounded-[24px] shadow-2xl overflow-hidden z-10 border border-black/5 dark:border-white/10`}
          >
            {/* iOS Drag Handle on Mobile */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-white/10">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
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
