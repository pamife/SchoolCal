import React from 'react';
import {
  Clock,
  MapPin,
  User as UserIcon,
  ChevronRight,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import type { SmartDayData } from '../../types';
import { formatGermanDate, formatGermanWeekday } from '../../utils/dateUtils';

interface SmartDayHeroProps {
  smartDay: SmartDayData;
  onOpenSchedule: () => void;
  onOpenTasks?: () => void;
  onOpenAiAssistant?: () => void;
}

export const SmartDayHero: React.FC<SmartDayHeroProps> = ({
  smartDay,
  onOpenSchedule,
  onOpenTasks,
  onOpenAiAssistant,
}) => {
  const today = new Date();
  const activeLesson = smartDay.currentLesson || smartDay.nextLesson;
  const isCurrent = Boolean(smartDay.currentLesson);
  const substitution = activeLesson?.substitution;
  const isCancelled = substitution?.type === 'cancelled';

  return (
    <div className="space-y-4">
      {/* Date & Dynamic Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
        <div>
          <div className="text-xs font-bold text-ios-blue uppercase tracking-wider flex flex-wrap items-center gap-1.5">
            <span>{formatGermanWeekday(today, 'long')}, {formatGermanDate(today, 'd. MMMM')}</span>
            {smartDay.activeBreak && (
              <span className="bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                ☕ {smartDay.activeBreak.name} ({smartDay.activeBreak.startTime}–{smartDay.activeBreak.endTime})
              </span>
            )}
            {smartDay.activeHoliday && (
              <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                {smartDay.activeHoliday.name}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-0.5">
            {smartDay.headline}
          </h1>
          {smartDay.subheadline && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
              {smartDay.subheadline}
            </p>
          )}
        </div>

        {/* Quick status pills */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {smartDay.todayLessonsCount > 0 && (
            <div className="px-3 py-1.5 rounded-full bg-white dark:bg-ios-dark-secondary border border-black/5 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-ios-blue" />
              <span>{smartDay.todayLessonsCount} Stunden heute</span>
            </div>
          )}

          {smartDay.overdueHomework.length > 0 && (
            <button
              type="button"
              onClick={onOpenTasks}
              className="px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/20 text-xs font-bold text-red-700 dark:text-red-300 flex items-center gap-1.5 hover:bg-red-500/25 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
              <span>{smartDay.overdueHomework.length} überfällig</span>
            </button>
          )}

          {smartDay.todayHomework.length > 0 && (
            <button
              type="button"
              onClick={onOpenTasks}
              className="px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/20 text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 hover:bg-amber-500/25 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
              <span>{smartDay.todayHomework.length} heute fällig</span>
            </button>
          )}

          {smartDay.tomorrowHomework.length > 0 && (
            <button
              type="button"
              onClick={onOpenTasks}
              className="px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/20 text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5 hover:bg-blue-500/25 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-ios-blue" />
              <span>{smartDay.tomorrowHomework.length} für morgen</span>
            </button>
          )}
        </div>
      </div>

      {/* 🏫 Main Next / Current Lesson Hero Card */}
      {activeLesson ? (
        <div
          className={`ios-card p-4 sm:p-5 relative overflow-hidden transition-all border ${
            isCancelled
              ? 'bg-gradient-to-br from-red-500/10 via-rose-500/5 to-transparent border-red-500/30'
              : isCurrent
              ? 'bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border-blue-500/30'
              : 'bg-white dark:bg-ios-dark-secondary border-black/5 dark:border-white/10'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              {/* Subject Color Badge */}
              <div
                className="w-13 h-13 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-md shrink-0 transition-transform"
                style={{
                  backgroundColor: isCancelled ? '#EF4444' : activeLesson.subject?.color || '#007AFF',
                }}
              >
                {isCancelled ? '✕' : activeLesson.subject?.shortName || 'Std'}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                    {isCurrent ? 'Gerade jetzt' : 'Als Nächstes'} • {activeLesson.entry.period}. Stunde
                  </span>

                  {substitution && (
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs ${
                        substitution.type === 'cancelled'
                          ? 'bg-red-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {substitution.type === 'cancelled'
                        ? 'Ausfall'
                        : substitution.type === 'room_change'
                        ? 'Raumänderung'
                        : substitution.type === 'teacher_change'
                        ? 'Vertretung'
                        : 'Änderung'}
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1 leading-tight">
                  {activeLesson.subject?.name || 'Unterricht'}
                </h3>

                {/* Details line: Time, Room, Teacher */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-300 font-medium mt-1.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-ios-blue shrink-0" />
                    <span>
                      {activeLesson.entry.startTime} – {activeLesson.entry.endTime}
                    </span>
                  </span>

                  {activeLesson.room && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className={substitution?.newRoomId ? 'font-bold text-amber-600 dark:text-amber-400' : ''}>
                        Raum {activeLesson.room.name}
                      </span>
                    </span>
                  )}

                  {activeLesson.teacher && (
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span className={substitution?.newTeacherId ? 'font-bold text-amber-600 dark:text-amber-400' : ''}>
                        {activeLesson.teacher.title ? `${activeLesson.teacher.title} ` : ''}{activeLesson.teacher.name}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Countdown Pill & Action */}
            <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-white/10">
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                  {isCurrent ? 'Verbleibend' : 'Startet in'}
                </span>
                <span className="text-base sm:text-lg font-black text-ios-blue">
                  {isCurrent
                    ? `${smartDay.currentLesson?.minutesRemaining} Minuten`
                    : `${smartDay.nextLesson?.minutesUntil} Minuten`}
                </span>
              </div>

              <button
                type="button"
                onClick={onOpenSchedule}
                className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-ios-dark-card dark:hover:bg-ios-dark-tertiary text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <span>Stundenplan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State if no lesson right now */
        <div className="ios-card p-5 text-center space-y-2 bg-gradient-to-r from-gray-500/5 to-transparent border border-black/5 dark:border-white/10">
          <div className="w-10 h-10 rounded-2xl bg-ios-blue/10 text-ios-blue flex items-center justify-center mx-auto">
            <BookOpen className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
            {smartDay.timeContext === 'after_school'
              ? 'Alle Unterrichtsstunden für heute abgeschlossen'
              : smartDay.timeContext === 'weekend'
              ? 'Schönes Wochenende!'
              : smartDay.timeContext === 'holiday'
              ? 'Schöne Ferienzeit!'
              : 'Kein Unterricht für den aktuellen Zeitpunkt eingetragen'}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {smartDay.todayHomework.length > 0
              ? `Du hast noch ${smartDay.todayHomework.length} Aufgabe(n) für heute offen.`
              : 'Nutze den Kalender oder trage neue Stunden und Aufgaben ein.'}
          </p>
        </div>
      )}
    </div>
  );
};
