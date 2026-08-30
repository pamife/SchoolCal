import React, { useState, useEffect } from 'react';
import { Homework, Subject, PriorityLevel, TaskStatus } from '../../types';
import { BottomSheet } from '../common/BottomSheet';
import { Button } from '../common/Button';
import { format, addDays } from 'date-fns';
import { Trash2, AlertCircle } from 'lucide-react';

interface HomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (homework: Homework) => void;
  onDelete?: (id: string) => void;
  initialHomework?: Homework | null;
  subjects: Subject[];
}

export const HomeworkModal: React.FC<HomeworkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialHomework,
  subjects,
}) => {
  const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [dueDate, setDueDate] = useState(tomorrowStr);
  const [dueTime, setDueTime] = useState('08:00');
  const [priority, setPriority] = useState<PriorityLevel>('normal');
  const [status, setStatus] = useState<TaskStatus>('todo');

  useEffect(() => {
    if (initialHomework) {
      setTitle(initialHomework.title);
      setDescription(initialHomework.description || '');
      setSubjectId(initialHomework.subjectId);
      setDueDate(initialHomework.dueDate);
      setDueTime(initialHomework.dueTime || '08:00');
      setPriority(initialHomework.priority);
      setStatus(initialHomework.status);
    } else {
      setTitle('');
      setDescription('');
      setSubjectId(subjects[0]?.id || '');
      setDueDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
      setDueTime('08:00');
      setPriority('normal');
      setStatus('todo');
    }
  }, [initialHomework, isOpen, subjects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    const homeworkToSave: Homework = {
      id: initialHomework?.id || `hw-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      subjectId,
      dueDate,
      dueTime,
      priority,
      status,
      createdAt: initialHomework?.createdAt || new Date().toISOString(),
      completedAt: status === 'done' ? (initialHomework?.completedAt || new Date().toISOString()) : undefined,
    };

    onSave(homeworkToSave);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={initialHomework ? 'Aufgabe bearbeiten' : 'Neue Hausaufgabe'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Aufgabe / Titel
          </label>
          <input
            type="text"
            required
            placeholder="z.B. Buch S. 42 Nr. 3-6 oder Essay fertigstellen"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Fach
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.shortName})
              </option>
            ))}
          </select>
        </div>

        {/* Due Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Fälligkeitsdatum
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Uhrzeit (optional)
            </label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            Priorität
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'low', label: 'Niedrig', color: 'text-gray-600 bg-gray-100 dark:bg-ios-dark-secondary' },
              { id: 'normal', label: 'Normal', color: 'text-blue-600 bg-blue-500/10' },
              { id: 'high', label: 'Hoch ⚡', color: 'text-red-600 bg-red-500/10' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriority(p.id as PriorityLevel)}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  priority === p.id
                    ? 'bg-ios-blue text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-ios-dark-secondary text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Beschreibung / Details
          </label>
          <textarea
            rows={3}
            placeholder="z.B. Seitenzahlen, Partnerarbeit oder Hinweise der Lehrkraft..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {initialHomework && onDelete && (
            <Button
              type="button"
              variant="destructive"
              size="md"
              onClick={() => {
                onDelete(initialHomework.id);
                onClose();
              }}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Löschen
            </Button>
          )}

          <Button type="submit" variant="primary" size="md" fullWidth>
            {initialHomework ? 'Speichern' : 'Aufgabe erstellen'}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
