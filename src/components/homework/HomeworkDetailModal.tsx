import React from 'react';
import { CalendarDays, CheckCircle2, Circle, Clock3, Edit2, Flag, NotebookText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import type { Homework, Subject } from '../../types';
import { BottomSheet } from '../common/BottomSheet';
import { Button } from '../common/Button';

interface HomeworkDetailModalProps {
  isOpen: boolean;
  homework: Homework | null;
  subject?: Subject;
  onClose: () => void;
  onToggleComplete: (id: string) => void;
  onEdit: (homework: Homework) => void;
}

const priorityLabels: Record<Homework['priority'], string> = {
  low: 'Niedrig',
  normal: 'Normal',
  high: 'Hoch',
};

export const HomeworkDetailModal: React.FC<HomeworkDetailModalProps> = ({
  isOpen,
  homework,
  subject,
  onClose,
  onToggleComplete,
  onEdit,
}) => {
  if (!homework) return null;

  const isDone = homework.status === 'done';
  const dueDate = format(parseISO(homework.dueDate), 'EEEE, d. MMMM yyyy', { locale: de });

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Aufgabe">
      <div className="space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {subject && (
              <span
                className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: subject.color }}
              >
                {subject.name}
              </span>
            )}
            <span className={`text-xs font-semibold ${isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {isDone ? 'Erledigt' : 'Offen'}
            </span>
          </div>
          <h2 className={`text-xl font-bold leading-snug text-gray-950 dark:text-white ${isDone ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
            {homework.title}
          </h2>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="rounded-xl border border-black/5 bg-gray-50 p-3 dark:border-white/10 dark:bg-ios-dark-secondary">
            <dt className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              <CalendarDays className="h-4 w-4" />
              Fällig am
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{dueDate}</dd>
          </div>
          <div className="rounded-xl border border-black/5 bg-gray-50 p-3 dark:border-white/10 dark:bg-ios-dark-secondary">
            <dt className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              <Clock3 className="h-4 w-4" />
              Uhrzeit
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{homework.dueTime || 'Keine Uhrzeit'}</dd>
          </div>
          <div className="rounded-xl border border-black/5 bg-gray-50 p-3 dark:border-white/10 dark:bg-ios-dark-secondary">
            <dt className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              <Flag className="h-4 w-4" />
              Priorität
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{priorityLabels[homework.priority]}</dd>
          </div>
          <div className="rounded-xl border border-black/5 bg-gray-50 p-3 dark:border-white/10 dark:bg-ios-dark-secondary">
            <dt className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              <NotebookText className="h-4 w-4" />
              Frist
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
              {homework.dueDateMode === 'AUTO' ? 'Aus Stundenplan' : 'Manuell gesetzt'}
            </dd>
          </div>
        </dl>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Notiz</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {homework.description || 'Keine weiteren Angaben.'}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-black/5 pt-4 dark:border-white/10 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            size="md"
            fullWidth
            icon={isDone ? <Circle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            onClick={() => {
              onToggleComplete(homework.id);
              onClose();
            }}
          >
            {isDone ? 'Wieder öffnen' : 'Als erledigt markieren'}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            fullWidth
            icon={<Edit2 className="h-4 w-4" />}
            onClick={() => onEdit(homework)}
          >
            Bearbeiten
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
