import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IntroSlides } from './IntroSlides';
import { SetupWizard } from './SetupWizard';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import type { NavigationTab } from '../../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: NavigationTab) => void;
  onOpenWebUntis?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenWebUntis,
}) => {
  const [mode, setMode] = useState<'intro' | 'wizard'>('intro');
  const { user } = useAuthStore();
  const { updateSettings } = useSettingsStore();

  if (!isOpen) return null;

  const uid = user?.uid || '';

  const handleSkipAll = async () => {
    await updateSettings(
      {
        onboardingCompleted: true,
        onboardingVersion: 1,
      },
      uid
    );
    onClose();
  };

  const handleCompleteSetup = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/65 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="relative w-full max-w-2xl bg-white dark:bg-ios-dark-card rounded-[28px] shadow-2xl overflow-hidden border border-black/10 dark:border-white/10 z-10 my-auto max-h-[92dvh] flex flex-col"
      >
        <div className="overflow-y-auto overscroll-contain flex-1">
          {mode === 'intro' ? (
            <IntroSlides
              onCompleteIntro={() => setMode('wizard')}
              onSkipAll={handleSkipAll}
            />
          ) : (
            <SetupWizard
              onComplete={handleCompleteSetup}
              onNavigateToTab={onNavigateToTab}
              onOpenWebUntis={onOpenWebUntis}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};
