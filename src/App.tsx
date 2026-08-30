import React, { useEffect, useState } from 'react';
import { useSchoolStore } from './store/useSchoolStore';
import { useHomeworkStore } from './store/useHomeworkStore';
import { useExamStore } from './store/useExamStore';
import { useCalendarStore } from './store/useCalendarStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useSearchStore } from './store/useSearchStore';

import { MobileNavBar } from './components/layout/MobileNavBar';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { QuickActionSheet } from './components/layout/QuickActionSheet';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';

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

import { NavigationTab, QuickActionType, ScheduleEntry, Exam, Homework, CalendarEvent } from './types';

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

  const { loadSchoolData, subjects, teachers, rooms, scheduleEntries, addScheduleEntry, updateScheduleEntry, deleteScheduleEntry, addSubstitution } = useSchoolStore();
  const { loadHomework, addHomework } = useHomeworkStore();
  const { loadExams, addExam, updateExam, deleteExam } = useExamStore();
  const { loadEvents, addEvent } = useCalendarStore();
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
    loadSchoolData();
    loadHomework();
    loadExams();
    loadEvents();
  }, []);

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
        onSave={(evt) => addEvent(evt)}
        subjects={subjects}
      />

      <HomeworkModal
        isOpen={isHomeworkModalOpen}
        onClose={() => setIsHomeworkModalOpen(false)}
        onSave={(hw) => addHomework(hw)}
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
            updateExam(ex.id, ex);
          } else {
            addExam(ex);
          }
        }}
        onDelete={(id) => deleteExam(id)}
        initialExam={selectedExam}
        subjects={subjects}
        teachers={teachers}
        rooms={rooms}
      />

      <SubstitutionModal
        isOpen={isSubstModalOpen}
        onClose={() => setIsSubstModalOpen(false)}
        onSave={(sub) => addSubstitution(sub)}
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
        onSave={(entry) => {
          if (selectedScheduleEntry) {
            updateScheduleEntry(entry.id, entry);
          } else {
            addScheduleEntry(entry);
          }
        }}
        onDelete={(id) => deleteScheduleEntry(id)}
        initialEntry={selectedScheduleEntry}
        subjects={subjects}
        teachers={teachers}
        rooms={rooms}
      />
    </div>
  );
}

export default App;
