import React from 'react';
import { BookOpen, ChevronRight, Calendar, Plus } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useHomeworkStore } from '../../store/useHomeworkStore';
import { useExamStore } from '../../store/useExamStore';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { calculateSmartDayData } from '../../utils/smartDayEngine';
import { SmartDayHero } from './SmartDayHero';
import { SmartDayChangesBanner } from './SmartDayChangesBanner';
import { ClassTimetableUpdateBanner } from './ClassTimetableUpdateBanner';
import { TodayTimeline } from './TodayTimeline';
import { TodayHomeworkWidget } from './TodayHomeworkWidget';
import { ExamCountdownWidget } from './ExamCountdownWidget';
import type { NavigationTab, ScheduleEntry, Exam, QuickActionType } from '../../types';

import { useSchoolConfigStore } from '../../store/useSchoolConfigStore';

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
  const { events } = useCalendarStore();
  const { settings } = useSettingsStore();
  const { user } = useAuthStore();
  const { breaks, getPeriodsForDay } = useSchoolConfigStore();

  const today = new Date();
  const jsDay = today.getDay();
  const todayDayOfWeek = jsDay === 0 ? 7 : jsDay;

  const isNewAccount =
    scheduleEntries.length === 0 && homework.length === 0 && exams.length === 0 && events.length === 0;

  const currentDayPeriods = getPeriodsForDay(todayDayOfWeek);

  // Calculate real-time Smart Day data using central school configuration
  const smartDay = calculateSmartDayData({
    currentDate: today,
    scheduleEntries,
    periodTimes: currentDayPeriods,
    breaks,
    subjects,
    teachers,
    rooms,
    substitutions,
    homework,
    exams,
    calendarEvents: events,
    holidayState: settings.state || 'BB',
    userName: user?.displayName || 'Schüler',
  });

  const todayEntries = scheduleEntries
    .filter((e) => e.dayOfWeek === todayDayOfWeek)
    .sort((a, b) => a.period - b.period);

  return (
    <div className="space-y-5 pb-4 ipad:pb-6 w-full max-w-5xl mx-auto overflow-x-hidden">
      {/* 🌟 Welcome Card for New Empty Accounts */}
      {isNewAccount && (
        <section aria-label="Willkommen bei SchoolCal">
          <div className="ios-card p-5 sm:p-6 border border-blue-200 dark:border-blue-900/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <img src="/icon.svg" alt="" className="w-12 h-12 rounded-xl shrink-0" />
                <div>
                  <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight">
                    Willkommen bei SchoolCal
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5 font-medium">
                    Dein Kalender ist noch leer. Füge deinen Stundenplan hinzu, um loszulegen.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab('school')}
                  className="px-4 py-2 rounded-xl bg-ios-blue hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Stundenplan einrichten</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenQuickAction('event')}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-ios-dark-secondary text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-ios-dark-tertiary text-xs font-semibold flex items-center gap-1.5 border border-black/5 dark:border-white/10 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-ios-blue" />
                  <span>Ersten Termin erstellen</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 🔔 Class Timetable Update Banner */}
      <ClassTimetableUpdateBanner />

      {/* 🧠 1. Smart Day Hero & Next Lesson */}
      <section aria-label="Smart Day Übersicht">
        <SmartDayHero
          smartDay={smartDay}
          subjects={subjects}
          onOpenSchedule={() => onNavigateTab('school')}
          onOpenTasks={() => onNavigateTab('tasks')}
          onToggleComplete={(id) => toggleComplete(user?.uid || '', id)}
          onAddHomework={() => onOpenQuickAction('homework')}
        />
      </section>

      {/* ⚠️ 2. Smart Day Changes & Substitutions (Plus-Tier/WebUntis) */}
      {smartDay.activeChanges.length > 0 && (
        <section aria-label="Stundenplanänderungen">
          <SmartDayChangesBanner
            changes={smartDay.activeChanges}
            onOpenSchoolTab={() => onNavigateTab('school')}
          />
        </section>
      )}

      {/* 4. Grid: Heutiger Stundenplan + Aufgaben und Klausuren auf breiten iPads/Desktops */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left column: Heutiger Stundenplan */}
        <div className="lg:col-span-7 space-y-3">
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
            currentPeriodNumber={smartDay.currentLesson?.entry.period}
            onSelectEntry={onSelectScheduleEntry}
          />
        </div>

        {/* Right column: Hausaufgaben & Klausur-Countdowns */}
        <div className="lg:col-span-5 space-y-4">
          <TodayHomeworkWidget
            homework={homework}
            subjects={subjects}
            onToggleComplete={(id) => toggleComplete(user?.uid || '', id)}
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
