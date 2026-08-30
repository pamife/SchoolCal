import React, { useEffect, useState } from 'react';
import { useSchoolStore } from './store/useSchoolStore';
import { useHomeworkStore } from './store/useHomeworkStore';
import { useExamStore } from './store/useExamStore';
import { useCalendarStore } from './store/useCalendarStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useAuthStore } from './store/useAuthStore';

import { MobileNavBar } from './components/layout/MobileNavBar';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { QuickActionSheet } from './components/layout/QuickActionSheet';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { AuthScreen } from './components/auth/AuthScreen';

import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { CalendarScreen } from './components/calendar/CalendarScreen';
import { HomeworkScreen } from './components/homework/HomeworkScreen';
import { SchoolScreen } from './components/school/SchoolScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';

import { EventModal } from './components/calendar/EventModal';
import { HomeworkModal } from './components/homework/HomeworkModal';
import { ExamModal } from './components/exams/ExamModal';
import { ScheduleEntryModal } from './components/school/ScheduleEntryModal';
import { SubstitutionModal } from './components/school/SubstitutionModal';

import type { NavigationTab, QuickActionType, ScheduleEntry, Exam } from './types';
import { BookOpen } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('today');
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  // Quick action modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isSubstModalOpen, setIsSubstModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const [selectedScheduleEntry, setSelectedScheduleEntry] = useState<ScheduleEntry | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const { user, isAuthenticated, isLoading, initAuthListener } = useAuthStore();

  const {
    subjects,
    teachers,
    rooms,
    scheduleEntries,
    loadSchoolData,
    clearSchoolData,
    addScheduleEntry,
    updateScheduleEntry,
    deleteScheduleEntry,
    addSubstitution,
  } = useSchoolStore();

  const { loadHomework, clearHomework, addHomework } = useHomeworkStore();
  const { loadExams, clearExams, addExam, updateExam, deleteExam } = useExamStore();
  const { loadEvents, clearEvents, addEvent } = useCalendarStore();
  const { settings, loadSettings } = useSettingsStore();

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, [initAuthListener]);

  // When user is authenticated, load their data from Firestore
  useEffect(() => {
    if (user?.uid) {
      loadSettings(user.uid);
      loadSchoolData(user.uid);
      loadHomework(user.uid);
      loadExams(user.uid);
      loadEvents(user.uid);
    } else {
      clearSchoolData();
      clearHomework();
      clearExams();
      clearEvents();
    }
  }, [user?.uid]);

  const uid = user?.uid || '';

  const handleQuickAction = (action: QuickActionType) => {
    switch (action) {
      case 'homework':
        setIsHomeworkModalOpen(true);
        break;
      case 'event':
      case 'study':
        setIsEventModalOpen(true);
        break;
      case 'exam':
      case 'test':
        setIsExamModalOpen(true);
        break;
      case 'substitution':
        setIsSubstModalOpen(true);
        break;
    }
  };

  const handleSelectScheduleEntry = (entry: ScheduleEntry) => {
    setSelectedScheduleEntry(entry);
    setIsScheduleModalOpen(true);
  };

  const handleSelectExam = (exam: Exam) => {
    setSelectedExam(exam);
    setIsExamModalOpen(true);
  };

  // Initial App Loading Screen
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-ios-light-bg dark:bg-ios-dark-bg text-slate-900 dark:text-white">
        <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-ios-blue to-indigo-600 flex items-center justify-center text-white shadow-xl animate-pulse mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <div className="w-6 h-6 border-2 border-ios-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not signed in, show Auth Screen
  if (!isAuthenticated || !user) {
    return <AuthScreen />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ios-light-bg dark:bg-ios-dark-bg text-slate-900 dark:text-white">
      {/* iPad / Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overscroll-none">
        {/* Top Header */}
        <TopHeader
          onOpenQuickAction={() => setIsQuickActionOpen(true)}
        />

        {/* Tab View Container */}
        <main className="flex-1 p-3.5 sm:p-5 sm:px-6">
          {activeTab === 'today' && (
            <DashboardScreen
              onNavigateTab={setActiveTab}
              onOpenQuickAction={handleQuickAction}
              onSelectScheduleEntry={handleSelectScheduleEntry}
              onSelectExam={handleSelectExam}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarScreen
              onSelectScheduleEntry={handleSelectScheduleEntry}
              onSelectExam={handleSelectExam}
            />
          )}

          {activeTab === 'tasks' && (
            <HomeworkScreen />
          )}

          {activeTab === 'school' && (
            <SchoolScreen />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen />
          )}
        </main>
      </div>

      {/* iPhone Bottom Navigation Bar */}
      <MobileNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Global Quick Action Sheet */}
      <QuickActionSheet
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onSelectAction={handleQuickAction}
      />

      {/* Global Spotlight Search Modal */}
      <GlobalSearchModal
        onNavigateTab={setActiveTab}
      />

      {/* Quick Action Modals */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={(evt) => addEvent(uid, evt)}
        subjects={subjects}
      />

      <HomeworkModal
        isOpen={isHomeworkModalOpen}
        onClose={() => setIsHomeworkModalOpen(false)}
        onSave={(hw) => addHomework(uid, hw)}
        subjects={subjects}
      />

      <ExamModal
        isOpen={isExamModalOpen}
        onClose={() => {
          setIsExamModalOpen(false);
          setSelectedExam(null);
        }}
        onSave={(ex) => {
          if (selectedExam) {
            updateExam(uid, ex.id, ex);
          } else {
            addExam(uid, ex);
          }
        }}
        onDelete={(id) => deleteExam(uid, id)}
        initialExam={selectedExam}
        subjects={subjects}
        teachers={teachers}
        rooms={rooms}
      />

      <SubstitutionModal
        isOpen={isSubstModalOpen}
        onClose={() => setIsSubstModalOpen(false)}
        onSave={(sub) => addSubstitution(uid, sub)}
        scheduleEntries={scheduleEntries}
        subjects={subjects}
        teachers={teachers}
        rooms={rooms}
      />

      <ScheduleEntryModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedScheduleEntry(null);
        }}
        onSave={async (entry, isDoubleLesson) => {
          if (selectedScheduleEntry) {
            await updateScheduleEntry(uid, entry.id, entry);
          } else {
            await addScheduleEntry(uid, entry);
            if (isDoubleLesson) {
              const nextPeriodNum = entry.period + 1;
              const nextPeriodInfo = settings.periodTimes?.find(p => p.period === nextPeriodNum);
              const secondEntry: ScheduleEntry = {
                ...entry,
                id: `sch-${entry.dayOfWeek}-${nextPeriodNum}-${Date.now()}`,
                period: nextPeriodNum,
                startTime: nextPeriodInfo?.startTime || '08:50',
                endTime: nextPeriodInfo?.endTime || '09:35',
              };
              await addScheduleEntry(uid, secondEntry);
            }
          }
        }}
        onDelete={(id) => deleteScheduleEntry(uid, id)}
        initialEntry={selectedScheduleEntry}
        subjects={subjects}
        teachers={teachers}
        rooms={rooms}
        periodTimes={settings.periodTimes}
      />
    </div>
  );
}

export default App;
