import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Calendar,
  GraduationCap,
  Sparkles,
  BookOpen,
  RefreshCw,
  Brain,
  X,
} from 'lucide-react';
import type { QuickActionType } from '../../types';

interface QuickActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: QuickActionType) => void;
}

export const QuickActionSheet: React.FC<QuickActionSheetProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const actions: { id: QuickActionType; label: string; description: string; icon: React.ComponentType<{ className?: string }>; color: string; isPro?: boolean }[] = [
    {
      id: 'ai_chat',
      label: '🤖 KI-Schulassistent',
      description: 'Fragen zu Stundenplan, Aufgaben & Lernzeiten',
      icon: Brain,
      color: 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white',
      isPro: true,
    },
    {
      id: 'ai_plan',
      label: '✨ KI-Lernzeitplaner',
      description: 'Lernstoff optimal bis zur nächsten Klausur verteilen',
      icon: Sparkles,
      color: 'bg-purple-600 text-white',
      isPro: true,
    },
    {
      id: 'homework',
      label: 'Hausaufgabe / Aufgabe',
      description: 'Fach, Fälligkeitsdatum & Priorität festlegen',
      icon: CheckCircle2,
      color: 'bg-blue-500 text-white',
    },
    {
      id: 'event',
      label: 'Kalender-Termin',
      description: 'Schulisch, persönlich, Sport oder Freizeit',
      icon: Calendar,
      color: 'bg-indigo-500 text-white',
    },
    {
      id: 'exam',
      label: 'Klausur eintragen',
      description: 'Themenliste, Datum & Lernfortschritt erfassen',
      icon: GraduationCap,
      color: 'bg-red-500 text-white',
    },
    {
      id: 'test',
      label: 'Test / Kurzkontrolle',
      description: 'Kleiner Zwischentest oder Vokabeltest',
      icon: Sparkles,
      color: 'bg-amber-500 text-white',
    },
    {
      id: 'study',
      label: 'Lerneinheit planen',
      description: 'Gezielte Vorbereitung für ein bestimmtes Fach',
      icon: BookOpen,
      color: 'bg-purple-500 text-white',
    },
    {
      id: 'substitution',
      label: 'Vertretung / Entfall',
      description: 'Raumwechsel, Lehrerwechsel oder Stundenausfall',
      icon: RefreshCw,
      color: 'bg-teal-500 text-white',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full sm:max-w-md bg-white dark:bg-ios-dark-card rounded-t-[28px] sm:rounded-[24px] shadow-2xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pl-[max(1.25rem,env(safe-area-inset-left,0px))] pr-[max(1.25rem,env(safe-area-inset-right,0px))] z-10 border border-black/5 dark:border-white/10 max-h-[85dvh] overflow-y-auto"
          >
            {/* iOS Handle */}
            <div className="sm:hidden pt-1 pb-3 flex justify-center">
              <div className="w-10 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  Neu erstellen
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Wähle einen Eintrag für deinen Schulalltag
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {actions.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => {
                      onSelectAction(act.id);
                      onClose();
                    }}
                    className="flex items-center gap-3.5 p-3 rounded-ios bg-gray-50 dark:bg-ios-dark-secondary hover:bg-gray-100 dark:hover:bg-ios-dark-tertiary transition-all text-left ios-press-active"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${act.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {act.label}
                        </span>
                        {act.isPro && (
                          <span className="text-[9px] font-extrabold uppercase bg-purple-600 text-white px-1.5 py-0.2 rounded-full">
                            Pro
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {act.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
