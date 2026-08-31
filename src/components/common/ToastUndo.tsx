import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, X, Check } from 'lucide-react';
import { haptics } from '../../utils/haptics';

export interface ToastUndoProps {
  isOpen: boolean;
  message: string;
  onUndo: () => void;
  onClose: () => void;
  duration?: number; // ms, default 4500
  icon?: React.ReactNode;
}

export const ToastUndo: React.FC<ToastUndoProps> = ({
  isOpen,
  message,
  onUndo,
  onClose,
  duration = 4500,
  icon,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, duration, onClose]);

  const handleUndo = () => {
    haptics.light();
    onUndo();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] ipad:bottom-6 left-0 right-0 z-[70] flex justify-center px-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 bg-gray-900/90 dark:bg-zinc-800/95 text-white backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 max-w-md w-full sm:w-auto"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              {icon || <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>

            <span className="text-xs sm:text-sm font-medium flex-1 truncate">
              {message}
            </span>

            <button
              type="button"
              onClick={handleUndo}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-bold text-ios-blue dark:text-blue-400 flex items-center gap-1.5 transition-all shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rückgängig</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              title="Schließen"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
