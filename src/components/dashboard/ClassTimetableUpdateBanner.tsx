import React from 'react';
import { Sparkles, Check, ArrowRight, BellRing, RefreshCw } from 'lucide-react';
import { useClassTimetableStore } from '../../store/useClassTimetableStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const ClassTimetableUpdateBanner: React.FC = () => {
  const { user } = useAuthStore();
  const {
    studentSelection,
    publishedTimetable,
    unreadUpdateDiff,
    acknowledgeTimetableUpdate,
  } = useClassTimetableStore();

  if (
    !studentSelection ||
    studentSelection.timetableSource !== 'admin' ||
    !publishedTimetable ||
    !unreadUpdateDiff ||
    !unreadUpdateDiff.hasChanges
  ) {
    return null;
  }

  const handleAcknowledge = async () => {
    if (!user?.uid) return;
    await acknowledgeTimetableUpdate(user.uid, publishedTimetable.version);
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-teal-500/10 border border-ios-blue/30 space-y-2.5 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-ios-blue text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-gray-900 dark:text-white">
                Stundenplan aktualisiert!
              </h4>
              <Badge variant="blue" size="sm">
                Version {publishedTimetable.version}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
              Dein Klassenstundenplan (Klasse {studentSelection.className}) wurde von der Schule aktualisiert.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleAcknowledge}
          icon={<Check className="w-3.5 h-3.5" />}
        >
          Verstanden
        </Button>
      </div>

      {/* Changes list */}
      <div className="p-3 rounded-xl bg-white/80 dark:bg-ios-dark-secondary/80 border border-black/5 dark:border-white/5 space-y-1">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-ios-blue block">
          Änderungen für deine Klasse:
        </span>
        <ul className="space-y-1">
          {unreadUpdateDiff.summary.slice(0, 4).map((item, idx) => (
            <li
              key={idx}
              className="text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-ios-blue shrink-0" />
              <span>{item}</span>
            </li>
          ))}
          {unreadUpdateDiff.summary.length > 4 && (
            <li className="text-[11px] text-gray-400 italic">
              +{unreadUpdateDiff.summary.length - 4} weitere Änderungen...
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
