import React, { useState, useEffect } from 'react';
import { ScheduleEntry, Subject, Teacher, Room } from '../../types';
import { BottomSheet } from '../common/BottomSheet';
import { Button } from '../common/Button';
import { Trash2, Clock, MapPin, User, BookOpen } from 'lucide-react';

interface ScheduleEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: ScheduleEntry) => void;
  onDelete?: (id: string) => void;
  initialEntry?: ScheduleEntry | null;
  initialDay?: number;
  initialPeriod?: number;
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
}

export const ScheduleEntryModal: React.FC<ScheduleEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialEntry,
  initialDay = 1,
  initialPeriod = 1,
  subjects,
  teachers,
  rooms,
}) => {
  const [dayOfWeek, setDayOfWeek] = useState(initialDay);
  const [period, setPeriod] = useState(initialPeriod);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [teacherId, setTeacherId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('08:45');

  const days = [
    { id: 1, label: 'Montag' },
    { id: 2, label: 'Dienstag' },
    { id: 3, label: 'Mittwoch' },
    { id: 4, label: 'Donnerstag' },
    { id: 5, label: 'Freitag' },
    { id: 6, label: 'Samstag' },
  ];

  useEffect(() => {
    if (initialEntry) {
      setDayOfWeek(initialEntry.dayOfWeek);
      setPeriod(initialEntry.period);
      setSubjectId(initialEntry.subjectId);
      setTeacherId(initialEntry.teacherId || '');
      setRoomId(initialEntry.roomId || '');
      setStartTime(initialEntry.startTime);
      setEndTime(initialEntry.endTime);
    } else {
      setDayOfWeek(initialDay);
      setPeriod(initialPeriod);
      const defaultSub = subjects[0];
      setSubjectId(defaultSub?.id || '');
      setTeacherId(defaultSub?.teacherId || '');
      setRoomId(defaultSub?.defaultRoomId || '');
      // Calculate start and end time based on period
      setStartTime('08:00');
      setEndTime('08:45');
    }
  }, [initialEntry, initialDay, initialPeriod, isOpen, subjects]);

  const handleSubjectChange = (subId: string) => {
    setSubjectId(subId);
    const sub = subjects.find(s => s.id === subId);
    if (sub) {
      if (sub.teacherId) setTeacherId(sub.teacherId);
      if (sub.defaultRoomId) setRoomId(sub.defaultRoomId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) return;

    const entryToSave: ScheduleEntry = {
      id: initialEntry?.id || `sch-${dayOfWeek}-${period}-${Date.now()}`,
      dayOfWeek,
      period,
      startTime,
      endTime,
      subjectId,
      teacherId: teacherId || undefined,
      roomId: roomId || undefined,
      versionId: 'default',
    };

    onSave(entryToSave);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={initialEntry ? 'Stundenplaneintrag bearbeiten' : 'Neue Schulstunde'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Day of Week & Period */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Wochentag
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none"
            >
              {days.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Stunde
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                <option key={p} value={p}>
                  {p}. Stunde
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Schulfach
          </label>
          <select
            value={subjectId}
            onChange={(e) => handleSubjectChange(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.shortName})
              </option>
            ))}
          </select>
        </div>

        {/* Teacher & Room */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Lehrkraft
            </label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none"
            >
              <option value="">Kein Lehrer</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.shortName})
                </option>
              ))}
            </select>
          </div>

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
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Beginn
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Ende
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2">
          {initialEntry && onDelete && (
            <Button
              type="button"
              variant="destructive"
              size="md"
              onClick={() => {
                onDelete(initialEntry.id);
                onClose();
              }}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Löschen
            </Button>
          )}

          <Button type="submit" variant="primary" size="md" fullWidth>
            {initialEntry ? 'Speichern' : 'Stunde anlegen'}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
