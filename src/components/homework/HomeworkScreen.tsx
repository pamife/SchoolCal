import React, { useState } from 'react';
import { Plus, CheckCircle2, Brain, Sparkles } from 'lucide-react';
import { useHomeworkStore } from '../../store/useHomeworkStore';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useExamStore } from '../../store/useExamStore';
import { useAuthStore } from '../../store/useAuthStore';
import { SwipeableHomeworkCard } from './SwipeableHomeworkCard';
import { HomeworkModal } from './HomeworkModal';
import { TaskActionSheet } from '../common/TaskActionSheet';
import { ToastUndo } from '../common/ToastUndo';
import { AiStudyPlannerModal } from '../exams/AiStudyPlannerModal';
import { PricingModal } from '../licensing/PricingModal';
import { LicenseActivationModal } from '../licensing/LicenseActivationModal';
import { Button } from '../common/Button';
import { SegmentedControl, type SegmentOption } from '../common/SegmentedControl';
import { EmptyState } from '../common/EmptyState';
import type { Homework } from '../../types';
import { isToday, isTomorrow, isThisWeek, parseISO } from 'date-fns';
import { haptics } from '../../utils/haptics';

type DueFilterOption = 'all' | 'today' | 'tomorrow' | 'this_week' | 'overdue' | 'done';

export const HomeworkScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { homework, addHomework, updateHomework, deleteHomework, toggleComplete } = useHomeworkStore();
  const { exams } = useExamStore();
  const { subjects } = useSchoolStore();

  const [filterDue, setFilterDue] = useState<DueFilterOption>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isActivationOpen, setIsActivationOpen] = useState(false);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);

  // Long press / Action Sheet state
  const [actionSheetTask, setActionSheetTask] = useState<Homework | null>(null);

  // Undo Toast state
  const [undoToast, setUndoToast] = useState<{
    isOpen: boolean;
    message: string;
    onUndo: () => void;
  }>({
    isOpen: false,
    message: '',
    onUndo: () => {},
  });

  const subjectMap = new Map(subjects.map(s => [s.id, s]));

  const filterOptions: SegmentOption<DueFilterOption>[] = [
    { id: 'all', label: 'Alle' },
    { id: 'today', label: 'Heute' },
    { id: 'tomorrow', label: 'Morgen' },
    { id: 'this_week', label: 'Diese Woche' },
    { id: 'overdue', label: 'Überfällig' },
    { id: 'done', label: 'Erledigt' },
  ];

  const filteredTasks = homework.filter((item) => {
    if (filterSubject !== 'all' && item.subjectId !== filterSubject) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const itemDate = parseISO(item.dueDate);
    itemDate.setHours(0, 0, 0, 0);

    if (filterDue === 'done') {
      return item.status === 'done';
    }

    if (item.status === 'done' && filterDue !== 'all') {
      return false;
    }

    if (filterDue === 'today') {
      return isToday(itemDate);
    }
    if (filterDue === 'tomorrow') {
      return isTomorrow(itemDate);
    }
    if (filterDue === 'this_week') {
      return isThisWeek(itemDate, { weekStartsOn: 1 });
    }
    if (filterDue === 'overdue') {
      return itemDate < today && item.status !== 'done';
    }

    return true;
  });

  const openCount = homework.filter(h => h.status !== 'done').length;
  const uid = user?.uid || '';

  const handleToggleComplete = (id: string) => {
    const task = homework.find(h => h.id === id);
    if (!task) return;
    const wasDone = task.status === 'done';
    toggleComplete(uid, id);
    setUndoToast({
      isOpen: true,
      message: wasDone ? 'Aufgabe wieder als offen markiert' : 'Aufgabe als erledigt markiert ✓',
      onUndo: () => toggleComplete(uid, id),
    });
  };

  const handleDeleteTask = (id: string) => {
    const task = homework.find(h => h.id === id);
    if (!task) return;
    deleteHomework(uid, id);
    haptics.warning();
    setUndoToast({
      isOpen: true,
      message: `"${task.title}" gelöscht`,
      onUndo: () => addHomework(uid, task),
    });
  };

  const handleRescheduleTask = (id: string, newDateIso: string) => {
    const task = homework.find(h => h.id === id);
    if (!task) return;
    const oldDueDate = task.dueDate;
    const oldDueDateMode = task.dueDateMode;
    updateHomework(uid, id, { dueDate: newDateIso, dueDateMode: 'MANUAL' });
    setUndoToast({
      isOpen: true,
      message: `Frist auf ${newDateIso} geändert`,
      onUndo: () => updateHomework(uid, id, { dueDate: oldDueDate, dueDateMode: oldDueDateMode }),
    });
  };

  return (
    <div className="space-y-4 pb-4 ipad:pb-6 max-w-5xl mx-auto">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Aufgaben & Hausaufgaben</span>
            {openCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-ios-blue text-white font-bold">
                {openCount} offen
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Wische nach rechts zum Erledigen oder halte gedrückt für Schnellaktionen
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* KI-Planer Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAiPlannerOpen(true)}
            icon={<Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
            className="border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10"
          >
            <span>KI-Lernplaner</span>
            <span className="text-[9px] font-extrabold uppercase bg-purple-600 text-white px-1.5 py-0.2 rounded-full ml-1">
              Pro
            </span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingHomework(null);
              setIsModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Neue Aufgabe
          </Button>
        </div>
      </div>

      {/* Due Filter Bar */}
      <div className="overflow-x-auto no-scrollbar pb-1 px-1">
        <SegmentedControl
          options={filterOptions}
          value={filterDue}
          onChange={setFilterDue}
          size="sm"
        />
      </div>

      {/* Subject Pills Filter */}
      {subjects.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 px-1">
          <button
            type="button"
            onClick={() => setFilterSubject('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filterSubject === 'all'
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-ios-dark-secondary text-gray-600 dark:text-gray-400 hover:bg-gray-200'
            }`}
          >
            Alle Fächer
          </button>

          {subjects.map((sub) => {
            const isSelected = filterSubject === sub.id;
            const count = homework.filter(h => h.subjectId === sub.id && h.status !== 'done').length;

            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setFilterSubject(sub.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-ios-dark-secondary text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: isSelected ? sub.color : undefined,
                }}
              >
                <span>{sub.name}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-white/25 text-white' : 'bg-black/10 dark:bg-white/10'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Postponed due date banner if any task was shifted due to cancellation */}
      {(() => {
        const shiftedTasks = homework.filter(
          (h) => h.status !== 'done' && h.dueDateSource?.isShifted
        );
        if (shiftedTasks.length === 0) return null;
        return (
          <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/25 rounded-2xl flex items-start gap-3 text-xs">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-900 dark:text-amber-200">
                ℹ️ Frist automatisch angepasst ({shiftedTasks.length} {shiftedTasks.length === 1 ? 'Aufgabe' : 'Aufgaben'})
              </div>
              <p className="text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                Wegen Unterrichtsausfall wurde die Frist für betroffene Aufgaben automatisch auf den nächsten stattfindenden Unterricht verschoben.
              </p>
            </div>
          </div>
        );
      })()}

      {/* Tasks List with Swipe Support */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-8 h-8 text-emerald-500" />}
          title={filterDue === 'done' ? 'Keine erledigten Aufgaben' : 'Keine Aufgaben gefunden'}
          description={
            filterDue === 'done'
              ? 'Erledigte Aufgaben werden hier aufgeführt.'
              : 'Aktuell stehen keine Aufgaben in dieser Auswahl an.'
          }
          actionLabel="Neue Aufgabe erstellen"
          onAction={() => {
            setEditingHomework(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredTasks.map((task) => (
            <SwipeableHomeworkCard
              key={task.id}
              homework={task}
              subject={subjectMap.get(task.subjectId)}
              onToggleComplete={handleToggleComplete}
              onEdit={(hw) => {
                setEditingHomework(hw);
                setIsModalOpen(true);
              }}
              onDelete={handleDeleteTask}
              onLongPressOpen={(hw) => setActionSheetTask(hw)}
            />
          ))}
        </div>
      )}

      {/* Modals & Sheets */}
      <HomeworkModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHomework(null);
        }}
        onSave={(hw) => {
          if (editingHomework) {
            updateHomework(uid, hw.id, hw);
          } else {
            addHomework(uid, hw);
          }
        }}
        onDelete={handleDeleteTask}
        initialHomework={editingHomework}
        subjects={subjects}
      />

      <TaskActionSheet
        isOpen={Boolean(actionSheetTask)}
        onClose={() => setActionSheetTask(null)}
        homework={actionSheetTask}
        subject={actionSheetTask ? subjectMap.get(actionSheetTask.subjectId) : undefined}
        onToggleComplete={handleToggleComplete}
        onEdit={(hw) => {
          setEditingHomework(hw);
          setIsModalOpen(true);
        }}
        onDelete={handleDeleteTask}
        onReschedule={handleRescheduleTask}
      />

      <ToastUndo
        isOpen={undoToast.isOpen}
        message={undoToast.message}
        onUndo={undoToast.onUndo}
        onClose={() => setUndoToast((prev) => ({ ...prev, isOpen: false }))}
      />

      <AiStudyPlannerModal
        isOpen={isAiPlannerOpen}
        onClose={() => setIsAiPlannerOpen(false)}
        exams={exams}
        subjects={subjects}
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
    </div>
  );
};
