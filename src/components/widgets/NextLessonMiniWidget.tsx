import React from 'react';
import { Clock, MapPin, CheckCircle2, Calendar, BookOpen, Sparkles } from 'lucide-react';
import type { SmartDayData } from '../../types';

interface NextLessonMiniWidgetProps {
  smartDay: SmartDayData;
  onOpenApp?: () => void;
  variant?: 'next_lesson' | 'today_summary' | 'tasks' | 'smart_glance';
}

export const NextLessonMiniWidget: React.FC<NextLessonMiniWidgetProps> = ({
  smartDay,
  onOpenApp,
  variant = 'next_lesson',
}) => {
  const activeLesson = smartDay.currentLesson || smartDay.nextLesson;

  if (variant === 'today_summary') {
    return (
      <div
        onClick={onOpenApp}
        className="w-full p-4 rounded-3xl bg-white dark:bg-ios-dark-secondary border border-black/5 dark:border-white/10 shadow-sm cursor-pointer hover:scale-[1.01] transition-transform space-y-2 select-none"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase text-ios-blue tracking-wider">
            Heute Übersicht
          </span>
          <span className="text-xs font-bold text-gray-400">SchoolCal</span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2 rounded-xl bg-blue-500/10 text-ios-blue">
            <div className="text-base font-black">{smartDay.todayLessonsCount}</div>
            <div className="text-[9px] font-bold uppercase">Stunden</div>
          </div>

          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
            <div className="text-base font-black">{smartDay.todayHomework.length}</div>
            <div className="text-[9px] font-bold uppercase">Aufgaben</div>
          </div>

          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
            <div className="text-base font-black">{smartDay.upcomingExams.length}</div>
            <div className="text-[9px] font-bold uppercase">Prüfungen</div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'tasks') {
    return (
      <div
        onClick={onOpenApp}
        className="w-full p-4 rounded-3xl bg-white dark:bg-ios-dark-secondary border border-black/5 dark:border-white/10 shadow-sm cursor-pointer hover:scale-[1.01] transition-transform space-y-2 select-none"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase text-amber-600 tracking-wider">
            Offene Aufgaben
          </span>
          <span className="text-xs font-bold text-gray-400">
            {smartDay.todayHomework.length + smartDay.overdueHomework.length} offen
          </span>
        </div>

        <div className="space-y-1.5 pt-1">
          {smartDay.todayHomework.length > 0 ? (
            smartDay.todayHomework.slice(0, 2).map((h) => (
              <div
                key={h.id}
                className="p-2 rounded-xl bg-gray-50 dark:bg-ios-dark-tertiary text-xs font-medium text-gray-900 dark:text-white truncate flex items-center gap-1.5"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span className="truncate">{h.title}</span>
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-400 text-center py-2">
              Keine fälligen Aufgaben heute ✓
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default: Next lesson widget
  return (
    <div
      onClick={onOpenApp}
      className="w-full p-4 rounded-3xl bg-white dark:bg-ios-dark-secondary border border-black/5 dark:border-white/10 shadow-sm cursor-pointer hover:scale-[1.01] transition-transform space-y-2 select-none"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase text-ios-blue tracking-wider">
          {smartDay.currentLesson ? 'Gerade jetzt' : 'Nächste Stunde'}
        </span>
        {activeLesson && (
          <span className="text-xs font-bold text-gray-400">
            {activeLesson.entry.startTime} – {activeLesson.entry.endTime}
          </span>
        )}
      </div>

      {activeLesson ? (
        <div className="flex items-center gap-3 pt-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-xs shrink-0"
            style={{ backgroundColor: activeLesson.subject?.color || '#007AFF' }}
          >
            {activeLesson.subject?.shortName || 'Std'}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-sm font-black text-gray-900 dark:text-white truncate">
              {activeLesson.subject?.name || 'Unterricht'}
            </div>
            <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
              {activeLesson.room && <span>Raum {activeLesson.room.name}</span>}
              {activeLesson.teacher && <span>{activeLesson.teacher.name}</span>}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-gray-400 text-center py-2">
          Keine weitere Stunde heute
        </div>
      )}
    </div>
  );
};
