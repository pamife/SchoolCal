import React, { useState, useEffect } from 'react';
import { Exam, ExamType, ExamTopic, Subject, Teacher, Room } from '../../types';
import { BottomSheet } from '../common/BottomSheet';
import { Button } from '../common/Button';
import { format, addDays } from 'date-fns';
import { Trash2, Plus, X, CheckSquare, Square } from 'lucide-react';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exam: Exam) => void;
  onDelete?: (id: string) => void;
  initialExam?: Exam | null;
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
}

const EXAM_TYPES: { id: ExamType; label: string }[] = [
  { id: 'exam', label: 'Schulaufgabe / Klausur' },
  { id: 'test', label: 'Kurzkontrolle / Test' },
  { id: 'oral_exam', label: 'Mündliche Prüfung' },
  { id: 'presentation', label: 'Referat / GFS' },
];

export const ExamModal: React.FC<ExamModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialExam,
  subjects,
  teachers,
  rooms,
}) => {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [type, setType] = useState<ExamType>('exam');
  const [date, setDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:35');
  const [roomId, setRoomId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [topics, setTopics] = useState<ExamTopic[]>([]);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [studyProgress, setStudyProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const [grade, setGrade] = useState('');

  useEffect(() => {
    if (initialExam) {
      setTitle(initialExam.title);
      setSubjectId(initialExam.subjectId);
      setType(initialExam.type);
      setDate(initialExam.date);
      setStartTime(initialExam.startTime || '08:00');
      setEndTime(initialExam.endTime || '09:35');
      setRoomId(initialExam.roomId || '');
      setTeacherId(initialExam.teacherId || '');
      setTopics(initialExam.topics || []);
      setStudyProgress(initialExam.studyProgress || 0);
      setNotes(initialExam.notes || '');
      setGrade(initialExam.grade || '');
    } else {
      setTitle('');
      setSubjectId(subjects[0]?.id || '');
      setType('exam');
      setDate(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
      setStartTime('08:00');
      setEndTime('09:35');
      setRoomId('');
      setTeacherId('');
      setTopics([]);
      setStudyProgress(0);
      setNotes('');
      setGrade('');
    }
  }, [initialExam, isOpen, subjects]);

  const handleAddTopic = () => {
    if (!newTopicTitle.trim()) return;
    const newTopic: ExamTopic = {
      id: `top-${Date.now()}`,
      title: newTopicTitle.trim(),
      completed: false,
    };
    const updated = [...topics, newTopic];
    setTopics(updated);
    setNewTopicTitle('');

    // Update study progress automatically
    const completedCount = updated.filter(t => t.completed).length;
    setStudyProgress(Math.round((completedCount / updated.length) * 100));
  };

  const handleRemoveTopic = (topicId: string) => {
    const updated = topics.filter(t => t.id !== topicId);
    setTopics(updated);
    if (updated.length > 0) {
      const completedCount = updated.filter(t => t.completed).length;
      setStudyProgress(Math.round((completedCount / updated.length) * 100));
    }
  };

  const handleToggleTopic = (topicId: string) => {
    const updated = topics.map(t =>
      t.id === topicId ? { ...t, completed: !t.completed } : t
    );
    setTopics(updated);
    const completedCount = updated.filter(t => t.completed).length;
    setStudyProgress(Math.round((completedCount / updated.length) * 100));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    const examToSave: Exam = {
      id: initialExam?.id || `exam-${Date.now()}`,
      title: title.trim(),
      subjectId,
      type,
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      roomId: roomId || undefined,
      teacherId: teacherId || undefined,
      topics,
      studyProgress,
      notes: notes.trim() || undefined,
      grade: grade.trim() || undefined,
    };

    onSave(examToSave);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={initialExam ? 'Klausur bearbeiten' : 'Neue Klausur / Test anlegen'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Klausurtitel / Bezeichnung
          </label>
          <input
            type="text"
            required
            placeholder="z.B. 1. Klausur Mathematik (Analysis)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue"
          />
        </div>

        {/* Subject & Exam Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Fach
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.shortName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Prüfungsart
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ExamType)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
            >
              {EXAM_TYPES.map((et) => (
                <option key={et.id} value={et.id}>
                  {et.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Times */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Datum
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-2.5 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Beginn
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-2.5 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Ende
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-2.5 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Topics Checklist Section */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            Themen & Lernstoff (Checkliste)
          </label>

          {/* List of current topics */}
          <div className="space-y-1.5 mb-2 max-h-40 overflow-y-auto no-scrollbar">
            {topics.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary"
              >
                <button
                  type="button"
                  onClick={() => handleToggleTopic(t.id)}
                  className="flex items-center gap-2 text-left flex-1 min-w-0"
                >
                  {t.completed ? (
                    <CheckSquare className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                  <span
                    className={`text-xs font-medium truncate ${
                      t.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {t.title}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRemoveTopic(t.id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add topic input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Neues Thema hinzufügen..."
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTopic();
                }
              }}
              className="flex-1 px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddTopic}
            >
              Hinzufügen
            </Button>
          </div>
        </div>

        {/* Study Progress Slider */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1 font-semibold">
            <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Lernfortschritt
            </span>
            <span className="text-ios-blue font-bold">{studyProgress}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={studyProgress}
            onChange={(e) => setStudyProgress(Number(e.target.value))}
            className="w-full accent-ios-blue cursor-pointer"
          />
        </div>

        {/* Room & Teacher */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Raum
            </label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none"
            >
              <option value="">Kein Raum</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Lehrer
            </label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none"
            >
              <option value="">Kein Lehrer</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Hilfsmittel / Notizen
          </label>
          <textarea
            rows={2}
            placeholder="z.B. Taschenrechner & Formelsammlung erlaubt..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {initialExam && onDelete && (
            <Button
              type="button"
              variant="destructive"
              size="md"
              onClick={() => {
                onDelete(initialExam.id);
                onClose();
              }}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Löschen
            </Button>
          )}

          <Button type="submit" variant="primary" size="md" fullWidth>
            {initialExam ? 'Speichern' : 'Klausur anlegen'}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
