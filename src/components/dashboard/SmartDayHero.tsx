import React from 'react';
import {
  Clock,
  MapPin,
  User as UserIcon,
  ChevronRight,
  CheckCircle2,
  Circle,
  Plus,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import type { SmartDayData, Subject } from '../../types';
import { formatGermanDate, formatGermanWeekday, getHomeworkDueDateStatus } from '../../utils/dateUtils';
import { Badge } from '../common/Badge';
import { haptics } from '../../utils/haptics';

interface SmartDayHeroProps {
  smartDay: SmartDayData;
  subjects?: Subject[];
  onOpenSchedule: () => void;
  onOpenTasks?: () => void;
  onOpenAiAssistant?: () => void;
  onToggleComplete?: (id: string) => void;
  onAddHomework?: () => void;
}

export const SmartDayHero: React.FC<SmartDayHeroProps> = ({
  smartDay,
  subjects = [],
  onOpenSchedule,
  onOpenTasks,
  onOpenAiAssistant,
  onToggleComplete,
  onAddHomework,
}) => {
  const today = new Date();
  const activeLesson = smartDay.currentLesson || smartDay.nextLesson;
  const isCurrent = Boolean(smartDay.currentLesson);
  const substitution = activeLesson?.substitution;
  const isCancelled = substitution?.type === 'cancelled';

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  // Prioritize pending tasks: overdue -> today -> tomorrow -> upcoming
  const pendingTasks = [
    ...smartDay.overdueHomework,
    ...smartDay.todayHomework,
    ...smartDay.tomorrowHomework,
    ...smartDay.upcomingHomework,
  ].filter(
    (task, index, self) => task.status !== 'done' && self.findIndex((t) => t.id === task.id) === index
  );

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
      ) : pendingTasks.length > 0 ? (
        /* 📚 After School / Free Time Hero Card with Pending Homework */
        <div className="ios-card p-4 sm:p-5 relative overflow-hidden transition-all bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20">
          <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-black/5 dark:border-white/10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-ios-blue text-white flex items-center justify-center shadow-sm shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight">
                    Anstehende Aufgaben
                  </h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-ios-blue text-white shadow-xs">
                    {pendingTasks.length} offen
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {smartDay.timeContext === 'after_school'
                    ? 'Schulschluss für heute! Deine nächsten Aufgaben:'
                    : smartDay.timeContext === 'weekend'
                    ? 'Wochenende! Bereite dich entspannt vor:'
                    : 'Deine anstehenden Aufgaben:'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {onAddHomework && (
                <button
                  type="button"
                  onClick={onAddHomework}
                  className="p-1.5 rounded-xl bg-white dark:bg-ios-dark-secondary text-gray-700 dark:text-gray-300 hover:text-ios-blue border border-black/5 dark:border-white/10 transition-all active:scale-95"
                  title="Aufgabe hinzufügen"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              {onOpenTasks && (
                <button
                  type="button"
                  onClick={onOpenTasks}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-ios-dark-secondary hover:bg-gray-100 dark:hover:bg-ios-dark-tertiary text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center gap-1 border border-black/5 dark:border-white/10 transition-colors"
                >
                  <span>Alle</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List of pending tasks */}
          <div className="space-y-2">
            {pendingTasks.slice(0, 3).map((task) => {
              const subject = subjectMap.get(task.subjectId);
              const dueStatus = getHomeworkDueDateStatus(task.dueDate, task.status === 'done');

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/80 dark:bg-ios-dark-card/80 border border-black/5 dark:border-white/5 hover:border-ios-blue/30 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        haptics.success();
                        if (onToggleComplete) onToggleComplete(task.id);
                      }}
                      className="text-gray-400 hover:text-ios-blue dark:hover:text-ios-blue transition-colors shrink-0 p-1 -m-1 active:scale-90"
                      title="Als erledigt markieren"
                    >
                      <Circle className="w-4 h-4" />
                    </button>

                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {subject && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded leading-none text-white shadow-xs"
                        style={{ backgroundColor: subject.color }}
                      >
                        {subject.shortName}
                      </span>
                    )}
                    <Badge variant={dueStatus.badgeVariant} size="sm" className="text-[10px] py-0 px-1.5 font-bold">
                      {dueStatus.badgeLabel}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          {pendingTasks.length > 3 && onOpenTasks && (
            <div className="mt-2.5 text-center">
              <button
                type="button"
                onClick={onOpenTasks}
                className="text-xs font-semibold text-ios-blue hover:underline inline-flex items-center gap-1"
              >
                <span>+ Noch {pendingTasks.length - 3} weitere Aufgabe(n) anzeigen</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* 🎉 Celebratory Card if no lessons and no pending homework */
        <div className="ios-card p-5 text-center space-y-2.5 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white">
              {smartDay.timeContext === 'after_school'
                ? 'Schulschluss – Alles erledigt! 🎉'
                : smartDay.timeContext === 'weekend'
                ? 'Schönes Wochenende – Keine offenen Aufgaben! ☀️'
                : smartDay.timeContext === 'holiday'
                ? 'Schöne Ferienzeit – Keine Aufgaben! 🏖️'
                : 'Alles erledigt! Keine offenen Aufgaben.'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-0.5">
              Du hast alle anstehenden Hausaufgaben abgeschlossen. Ruh dich aus und genieß deine freie Zeit!
            </p>
          </div>
          {onAddHomework && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onAddHomework}
                className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-ios-dark-secondary hover:bg-gray-100 dark:hover:bg-ios-dark-tertiary text-xs font-semibold text-gray-700 dark:text-gray-300 border border-black/5 dark:border-white/10 inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-500" />
                <span>Neue Aufgabe eintragen</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
