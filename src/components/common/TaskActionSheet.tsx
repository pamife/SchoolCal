import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';
import type { Homework, Subject } from '../../types';
import { haptics } from '../../utils/haptics';

export interface TaskActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  homework: Homework | null;
  subject?: Subject;
  onToggleComplete: (id: string) => void;
  onEdit: (homework: Homework) => void;
  onDelete: (id: string) => void;
  onReschedule: (id: string, newDateIso: string) => void;
}

export const TaskActionSheet: React.FC<TaskActionSheetProps> = ({
  isOpen,
  onClose,
  homework,
  subject,
  onToggleComplete,
  onEdit,
  onDelete,
  onReschedule,
}) => {
  if (!homework) return null;

  const isDone = homework.status === 'done';

  const getTomorrowIso = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  };

  const getNextWeekIso = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  };

  const getTodayIso = () => {
    return new Date().toISOString().slice(0, 10);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center p-0 sm:p-4">
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

          {/* Action Sheet Card */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full sm:max-w-md bg-white/95 dark:bg-ios-dark-card/95 backdrop-blur-2xl rounded-t-[28px] sm:rounded-[24px] shadow-2xl overflow-hidden z-10 border border-black/5 dark:border-white/10 pb-safe select-none"
          >
            {/* iOS Handle */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-10 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header / Info */}
            <div className="p-4 px-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex items-center gap-2">
                  {subject && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white shrink-0"
                      style={{ backgroundColor: subject.color }}
                    >
                      {subject.shortName}
                    </span>
                  )}
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {homework.title}
                  </h3>
                </div>
                {homework.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {homework.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons Group */}
            <div className="p-3 space-y-1.5">
              {/* Toggle Status */}
              <button
                type="button"
                onClick={() => {
                  haptics.success();
                  onToggleComplete(homework.id);
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] transition-all text-left font-semibold text-sm text-gray-900 dark:text-white"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDone ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'}`}>
                  {isDone ? <Circle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>
                <div>
                  <div>{isDone ? 'Als unerledigt markieren' : 'Als erledigt markieren'}</div>
                  <div className="text-xs text-gray-400 font-normal">
                    {isDone ? 'Status zurück auf offen setzen' : 'Aufgabe abhaken'}
                  </div>
                </div>
              </button>

              {/* Reschedule Shortcuts */}
              <button
                type="button"
                onClick={() => {
                  haptics.light();
                  onReschedule(homework.id, getTomorrowIso());
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] transition-all text-left font-semibold text-sm text-gray-900 dark:text-white"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-ios-blue flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div>Auf Morgen verschieben</div>
                  <div className="text-xs text-gray-400 font-normal">Frist auf morgen anpassen</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  haptics.light();
                  onReschedule(homework.id, getNextWeekIso());
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] transition-all text-left font-semibold text-sm text-gray-900 dark:text-white"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div>Um 1 Woche verschieben</div>
                  <div className="text-xs text-gray-400 font-normal">Frist um 7 Tage verlängern</div>
                </div>
              </button>

              {/* Edit */}
              <button
                type="button"
                onClick={() => {
                  haptics.selection();
                  onClose();
                  onEdit(homework);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] transition-all text-left font-semibold text-sm text-gray-900 dark:text-white"
              >
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-ios-dark-secondary text-gray-700 dark:text-gray-300 flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <div>Details bearbeiten</div>
                  <div className="text-xs text-gray-400 font-normal">Titel, Fach, Frist oder Priorität ändern</div>
                </div>
              </button>

              {/* Delete Destructive */}
              <button
                type="button"
                onClick={() => {
                  haptics.warning();
                  onDelete(homework.id);
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-500/10 active:scale-[0.98] transition-all text-left font-semibold text-sm text-red-600 dark:text-red-400"
              >
                <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <div>Aufgabe löschen</div>
                  <div className="text-xs text-red-500/70 font-normal">Unwiderruflich entfernen</div>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
