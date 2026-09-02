import React, { useState, useEffect } from 'react';
import type { ScheduleEntry, Subject, Teacher, Room, SchedulePeriodTime } from '../../types';
import { BottomSheet } from '../common/BottomSheet';
import { Button } from '../common/Button';
import { Trash2, Clock, Layers } from 'lucide-react';
import { DEFAULT_PERIOD_TIMES } from '../../data/mockData';

interface ScheduleEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: ScheduleEntry, isDoubleLesson?: boolean) => void;
  onDelete?: (id: string) => void;
  initialEntry?: ScheduleEntry | null;
  initialDay?: number;
  initialPeriod?: number;
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  periodTimes?: SchedulePeriodTime[];
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
  periodTimes = DEFAULT_PERIOD_TIMES,
}) => {
  const [dayOfWeek, setDayOfWeek] = useState(initialDay);
  const [period, setPeriod] = useState(initialPeriod);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [teacherId, setTeacherId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isDoubleLesson, setIsDoubleLesson] = useState(false);

  const days = [
    { id: 1, label: 'Montag' },
    { id: 2, label: 'Dienstag' },
    { id: 3, label: 'Mittwoch' },
    { id: 4, label: 'Donnerstag' },
    { id: 5, label: 'Freitag' },
    { id: 6, label: 'Samstag' },
  ];

  // Helper to get time for a specific period
  const getTimeForPeriod = (pNum: number) => {
    const found = periodTimes.find(p => p.period === pNum);
    if (found) return { start: found.startTime, end: found.endTime };
    return { start: '08:00', end: '08:45' };
  };

  useEffect(() => {
    if (initialEntry) {
      setDayOfWeek(initialEntry.dayOfWeek);
      setPeriod(initialEntry.period);
      setSubjectId(initialEntry.subjectId);
      setTeacherId(initialEntry.teacherId || '');
      setRoomId(initialEntry.roomId || '');
      setIsDoubleLesson(false);
    } else {
      setDayOfWeek(initialDay);
      setPeriod(initialPeriod);
      const defaultSub = subjects[0];
      setSubjectId(defaultSub?.id || '');
      setTeacherId(defaultSub?.teacherId || '');
      setRoomId(defaultSub?.defaultRoomId || '');
      setIsDoubleLesson(false);
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

  const currentTime = getTimeForPeriod(period);
  const nextTime = getTimeForPeriod(period + 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) return;

    const entryToSave: ScheduleEntry = {
      id: initialEntry?.id || `sch-${dayOfWeek}-${period}-${Date.now()}`,
      dayOfWeek,
      period,
      startTime: currentTime.start,
      endTime: currentTime.end,
      subjectId,
      teacherId: teacherId || undefined,
      roomId: roomId || undefined,
      versionId: 'default',
    };

    onSave(entryToSave, !initialEntry && isDoubleLesson);
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
              {(periodTimes.length > 0 ? periodTimes : DEFAULT_PERIOD_TIMES).map((p) => (
                <option key={p.period} value={p.period}>
                  {p.period}. Stunde ({p.startTime} – {p.endTime})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Automatic Time Info Badge */}
        <div className="px-3.5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-ios-blue flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {isDoubleLesson
                ? `${period}. & ${period + 1}. Stunde (${currentTime.start} – ${nextTime.end})`
                : `${period}. Stunde (${currentTime.start} – ${currentTime.end})`}
            </span>
          </div>
          <span className="text-[10px] text-gray-400">Automatisch laut Zeitplan</span>
        </div>

        {/* Double Lesson Toggle (for new entries) */}
        {!initialEntry && (
          <label className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-ios-blue" />
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                  Als Doppelstunde anlegen
                </div>
                <div className="text-[11px] text-gray-500">
                  Erstellt automatisch Stunde {period} und {period + 1}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isDoubleLesson}
              onChange={(e) => setIsDoubleLesson(e.target.checked)}
              className="w-4 h-4 text-ios-blue rounded focus:ring-ios-blue"
            />
          </label>
        )}

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

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-3 pb-8 sm:pb-4">
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
            {initialEntry
              ? 'Speichern'
              : isDoubleLesson
              ? 'Doppelstunde anlegen'
              : 'Stunde anlegen'}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
