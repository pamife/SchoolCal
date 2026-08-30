import React from 'react';
import { Sparkles, Calendar, BookOpen, Clock, AlertTriangle, CheckCircle2, ChevronRight, GraduationCap } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useHomeworkStore } from '../../store/useHomeworkStore';
import { useExamStore } from '../../store/useExamStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getCurrentSchoolPeriod, formatGermanDate, formatGermanWeekday } from '../../utils/dateUtils';
import { getHolidaysForState } from '../../data/holidays';
import { NextLessonHero } from './NextLessonHero';
import { TodayTimeline } from './TodayTimeline';
import { TodayHomeworkWidget } from './TodayHomeworkWidget';
import { ExamCountdownWidget } from './ExamCountdownWidget';
import { NavigationTab, ScheduleEntry, Exam, QuickActionType } from '../../types';

interface DashboardScreenProps {
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenQuickAction: (action: QuickActionType) => void;
  onSelectScheduleEntry: (entry: ScheduleEntry) => void;
  onSelectExam: (exam: Exam) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateTab,
  onOpenQuickAction,
  onSelectScheduleEntry,
  onSelectExam,
}) => {
  const { subjects, teachers, rooms, scheduleEntries, substitutions } = useSchoolStore();
  const { homework, toggleComplete } = useHomeworkStore();
  const { exams } = useExamStore();
  const { settings } = useSettingsStore();
  const { user } = useAuthStore();

  const today = new Date();
  const jsDay = today.getDay();
  const todayDayOfWeek = jsDay === 0 ? 7 : jsDay;

  // Filter schedule for today
  const todayEntries = scheduleEntries
    .filter(e => e.dayOfWeek === todayDayOfWeek)
    .sort((a, b) => a.period - b.period);

  // Calculate live period status
  const currentStatus = getCurrentSchoolPeriod(scheduleEntries, settings.periodTimes, today);

  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const roomMap = new Map(rooms.map(r => [r.id, r]));
  const substMap = new Map(substitutions.map(s => [s.scheduleEntryId, s]));

  const activeEntry = currentStatus.currentEntry || currentStatus.nextEntry;
  const activeSubject = activeEntry ? subjectMap.get(activeEntry.subjectId) : undefined;
  const activeSubstitution = activeEntry ? substMap.get(activeEntry.id) : undefined;
  const effectiveTeacherId = activeSubstitution?.newTeacherId || activeEntry?.teacherId;
  const effectiveRoomId = activeSubstitution?.newRoomId || activeEntry?.roomId;
  const activeTeacher = effectiveTeacherId ? teacherMap.get(effectiveTeacherId) : undefined;
  const activeRoom = effectiveRoomId ? roomMap.get(effectiveRoomId) : undefined;

  // Holiday check
  const stateHolidays = getHolidaysForState(settings.state);
  const todayIso = today.toISOString().slice(0, 10);
  const activeHoliday = stateHolidays.find(h => todayIso >= h.startDate && todayIso <= h.endDate);

  // Greeting based on time of day
  const hour = today.getHours();
  const greeting = hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';
  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Schüler';

  return (
    <div className="space-y-5 pb-20 ipad:pb-10 max-w-5xl mx-auto">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
        <div>
          <div className="text-xs font-semibold text-ios-blue uppercase tracking-wider">
            {formatGermanWeekday(today, 'long')}, {formatGermanDate(today, 'd. MMMM')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {greeting}, {firstName} 👋
          </h1>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-full bg-white dark:bg-ios-dark-secondary border border-black/5 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-ios-blue" />
            <span>{todayEntries.length} Schulstunden heute</span>
          </div>
        </div>
      </div>

      {/* Holiday / Vacation Alert Banner */}
      {activeHoliday && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              🏖️
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-300">
                {activeHoliday.name} ({activeHoliday.type === 'vacation' ? 'Ferienzeit' : 'Schulfrei'})
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-400">
                Genieße deine schulfreie Zeit! Kalender und Aufgaben stehen dir weiterhin zur Verfügung.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 1. Hero Widget: Nächste Schulstunde */}
      <section aria-label="Nächste Schulstunde">
        <NextLessonHero
          currentEntry={currentStatus.currentEntry}
          nextEntry={currentStatus.nextEntry}
          subject={activeSubject}
          teacher={activeTeacher}
          room={activeRoom}
          substitution={activeSubstitution}
          statusText={currentStatus.statusText}
          minutesRemaining={currentStatus.minutesRemainingInCurrent}
          minutesUntilNext={currentStatus.minutesUntilNext}
          onOpenSchedule={() => onNavigateTab('school')}
        />
      </section>

      {/* 2. Grid: Heutiger Stundenplan (Left/Full) + Homework & Exams (Right on iPad) */}
      <div className="grid grid-cols-1 ipad:grid-cols-12 gap-5">
        {/* Left column: Heutiger Stundenplan */}
        <div className="ipad:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-ios-blue" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                Heutiger Stundenplan
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('school')}
              className="text-xs font-semibold text-ios-blue hover:underline flex items-center gap-0.5"
            >
              Vollständiger Plan
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <TodayTimeline
            entries={todayEntries}
            subjects={subjects}
            teachers={teachers}
            rooms={rooms}
            substitutions={substitutions}
            currentPeriodNumber={currentStatus.currentEntry?.period}
            onSelectEntry={onSelectScheduleEntry}
          />
        </div>

        {/* Right column: Hausaufgaben & Klausur-Countdowns */}
        <div className="ipad:col-span-5 space-y-4">
          <TodayHomeworkWidget
            homework={homework}
            subjects={subjects}
            onToggleComplete={toggleComplete}
            onOpenHomeworkTab={() => onNavigateTab('tasks')}
            onAddHomework={() => onOpenQuickAction('homework')}
          />

          <ExamCountdownWidget
            exams={exams}
            subjects={subjects}
            onOpenExamsTab={() => onNavigateTab('calendar')}
            onAddExam={() => onOpenQuickAction('exam')}
            onSelectExam={onSelectExam}
          />
        </div>
      </div>
    </div>
  );
};
