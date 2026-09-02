import React, { useEffect, useState } from 'react';
import { useSchoolStore } from './store/useSchoolStore';
import { useHomeworkStore } from './store/useHomeworkStore';
import { useExamStore } from './store/useExamStore';
import { useCalendarStore } from './store/useCalendarStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useAuthStore } from './store/useAuthStore';
import { useGradeStore } from './store/useGradeStore';
import { useSchoolConfigStore } from './store/useSchoolConfigStore';

import { MobileNavBar } from './components/layout/MobileNavBar';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { QuickActionSheet } from './components/layout/QuickActionSheet';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { AuthScreen } from './components/auth/AuthScreen';

import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { CalendarScreen } from './components/calendar/CalendarScreen';
import { HomeworkScreen } from './components/homework/HomeworkScreen';
import { GradesScreen } from './components/grades/GradesScreen';
import { StatisticsScreen } from './components/statistics/StatisticsScreen';
import { SchoolScreen } from './components/school/SchoolScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';

import { EventModal } from './components/calendar/EventModal';
import { HomeworkModal } from './components/homework/HomeworkModal';
import { ExamModal } from './components/exams/ExamModal';
import { ScheduleEntryModal } from './components/school/ScheduleEntryModal';
import { SubstitutionModal } from './components/school/SubstitutionModal';
import { AiStudyPlannerModal } from './components/exams/AiStudyPlannerModal';
import { AiAssistantModal } from './components/ai/AiAssistantModal';
import { PricingModal } from './components/licensing/PricingModal';
import { LicenseActivationModal } from './components/licensing/LicenseActivationModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { updateAppBadge } from './services/pwa/badgeService';
import { evaluatePendingNotifications } from './services/notifications/notificationScheduler';
import { sendLocalNotification } from './services/notifications/notificationService';
import { useInputAutoScroll } from './hooks/useInputAutoScroll';
import { useAppSync } from './hooks/useAppSync';
import type { NavigationTab, QuickActionType, ScheduleEntry, Exam } from './types';
import { BookOpen } from 'lucide-react';

export function App() {
  useInputAutoScroll();
  useAppSync();

  const [activeTab, setActiveTab] = useState<NavigationTab>('today');
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  // Quick action modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isSubstModalOpen, setIsSubstModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isActivationOpen, setIsActivationOpen] = useState(false);

  const [selectedScheduleEntry, setSelectedScheduleEntry] = useState<ScheduleEntry | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const { user, isAuthenticated, isLoading, initAuthListener } = useAuthStore();

  const {
    subjects,
    teachers,
    rooms,
    scheduleEntries,
    substitutions,
    loadSchoolData,
    clearSchoolData,
    addScheduleEntry,
    updateScheduleEntry,
    deleteScheduleEntry,
    addSubstitution,
  } = useSchoolStore();

  const { homework, loadHomework, clearHomework, addHomework } = useHomeworkStore();
  const { exams, loadExams, clearExams, addExam, updateExam, deleteExam } = useExamStore();
  const { loadEvents, clearEvents, addEvent } = useCalendarStore();
  const { settings, loadSettings, updateSettings } = useSettingsStore();
  const { loadGrades, clearGrades } = useGradeStore();

  // Listen to Firebase Auth state and central School Configuration
  useEffect(() => {
    const unsubscribeAuth = initAuthListener();
    useSchoolConfigStore.getState().loadSchoolConfig();
    const unsubscribeSchool = useSchoolConfigStore.getState().initRealtimeListener();

    return () => {
      unsubscribeAuth();
      unsubscribeSchool();
    };
  }, [initAuthListener]);

  // When user is authenticated, load their data from Firestore
  useEffect(() => {
    if (user?.uid) {
      loadSettings(user.uid);
      loadSchoolData(user.uid);
      loadHomework(user.uid);
      loadExams(user.uid);
      loadEvents(user.uid);
      loadGrades(user.uid);
    } else {
      clearSchoolData();
      clearHomework();
      clearExams();
      clearEvents();
      clearGrades();
    }
  }, [user?.uid]);

  // Sync PWA App Icon Badge on iOS 16.4+ and Desktop
  useEffect(() => {
    const openCount = homework.filter((h) => h.status !== 'done').length;
    updateAppBadge(openCount);
  }, [homework]);

  // Contextual Notification evaluation
  useEffect(() => {
    if (user?.uid && settings.notifications?.enabled) {
      const pending = evaluatePendingNotifications({
        scheduleEntries,
        substitutions,
        homework,
        exams,
        subjects,
        rooms,
        teachers,
        preferences: settings.notifications,
        userName: user.displayName || 'Schüler',
      });

      if (pending.length > 0) {
        const item = pending[0];
        sendLocalNotification(item.title, {
          body: item.body,
          preferences: settings.notifications,
          isCritical: item.isCritical,
        });
      }
    }
  }, [homework.length, scheduleEntries.length, substitutions.length, exams.length]);

  const uid = user?.uid || '';

  const handleQuickAction = (action: QuickActionType) => {
    switch (action) {
      case 'ai_chat':
        setIsAiAssistantOpen(true);
        break;
      case 'ai_plan':
        setIsAiPlannerOpen(true);
        break;
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
    <div className="flex h-full h-dvh w-full overflow-hidden bg-ios-light-bg dark:bg-ios-dark-bg text-slate-900 dark:text-white">
      {/* iPad / Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full h-full overflow-hidden overflow-x-hidden relative">
        {/* Top Header */}
        <TopHeader
          onOpenQuickAction={() => setIsQuickActionOpen(true)}
          onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        />

        {/* Tab View Scroll Container with reliable bottom and landscape safe area clearance */}
        <div
          className="flex-1 min-w-0 w-full max-w-full overflow-y-auto overflow-x-hidden overscroll-contain"
          style={{ touchAction: 'pan-y' }}
        >
          <main className="min-h-full w-full max-w-full overflow-x-hidden p-3.5 sm:p-5 sm:px-6 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] ipad:pb-8 pl-[max(0.875rem,env(safe-area-inset-left,0px))] pr-[max(0.875rem,env(safe-area-inset-right,0px))]">
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

            {activeTab === 'statistics' && (
              <StatisticsScreen />
            )}

            {activeTab === 'grades' && (
              <GradesScreen />
            )}

            {activeTab === 'school' && (
              <SchoolScreen />
            )}

            {activeTab === 'settings' && (
              <SettingsScreen />
            )}
          </main>
        </div>
      </div>

      {/* iPhone / Mobile Bottom Bar */}
      <MobileNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Global Modals & Action Sheets */}
      <GlobalSearchModal
        onNavigateTab={setActiveTab}
      />

      <QuickActionSheet
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onSelectAction={handleQuickAction}
      />

      <HomeworkModal
        isOpen={isHomeworkModalOpen}
        onClose={() => setIsHomeworkModalOpen(false)}
        onSave={(hw) => addHomework(uid, hw)}
        subjects={subjects}
      />

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={(ev) => addEvent(uid, ev)}
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

      <AiStudyPlannerModal
        isOpen={isAiPlannerOpen}
        onClose={() => setIsAiPlannerOpen(false)}
        exams={exams}
        subjects={subjects}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenActivation={() => setIsActivationOpen(true)}
      />

      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenActivation={() => setIsActivationOpen(true)}
      />

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onOpenActivation={() => {
          setIsPricingOpen(false);
          setIsActivationOpen(true);
        }}
      />

      <LicenseActivationModal
        isOpen={isActivationOpen}
        onClose={() => setIsActivationOpen(false)}
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

      <OnboardingModal
        isOpen={Boolean(isAuthenticated && user && !settings.onboardingCompleted)}
        onClose={() => updateSettings({ onboardingCompleted: true, onboardingVersion: 1 }, uid)}
        onNavigateToTab={setActiveTab}
        onOpenWebUntis={() => setActiveTab('settings')}
      />
    </div>
  );
}

export default App;
