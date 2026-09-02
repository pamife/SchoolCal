import React, { useState, useEffect } from 'react';
import { Substitution, SubstitutionType, ScheduleEntry, Subject, Teacher, Room } from '../../types';
import { BottomSheet } from '../common/BottomSheet';
import { Button } from '../common/Button';
import { format } from 'date-fns';
import { Trash2, AlertCircle } from 'lucide-react';

interface SubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sub: Substitution) => void;
  onDelete?: (id: string) => void;
  initialSubstitution?: Substitution | null;
  selectedScheduleEntry?: ScheduleEntry | null;
  scheduleEntries: ScheduleEntry[];
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
}

const SUBST_TYPES: { id: SubstitutionType; label: string; desc: string }[] = [
  { id: 'teacher_change', label: 'Lehrer-Vertretung', desc: 'Anderer Lehrer übernimmt die Stunde' },
  { id: 'room_change', label: 'Raumänderung', desc: 'Stunde findet in anderem Raum statt' },
  { id: 'cancelled', label: 'Stundenausfall (Entfall)', desc: 'Stunde entfällt ersatzlos' },
  { id: 'subject_change', label: 'Fachänderung', desc: 'Anderes Fach wird unterrichtet' },
  { id: 'postponed', label: 'Verschoben', desc: 'Stunde wird auf andere Zeit verlegt' },
];

export const SubstitutionModal: React.FC<SubstitutionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialSubstitution,
  selectedScheduleEntry,
  scheduleEntries,
  subjects,
  teachers,
  rooms,
}) => {
  const [scheduleEntryId, setScheduleEntryId] = useState(
    selectedScheduleEntry?.id || scheduleEntries[0]?.id || ''
  );
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [type, setType] = useState<SubstitutionType>('teacher_change');
  const [newTeacherId, setNewTeacherId] = useState('');
  const [newRoomId, setNewRoomId] = useState('');
  const [newSubjectId, setNewSubjectId] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (initialSubstitution) {
      setScheduleEntryId(initialSubstitution.scheduleEntryId);
      setDate(initialSubstitution.date);
      setType(initialSubstitution.type);
      setNewTeacherId(initialSubstitution.newTeacherId || '');
      setNewRoomId(initialSubstitution.newRoomId || '');
      setNewSubjectId(initialSubstitution.newSubjectId || '');
      setNote(initialSubstitution.note || '');
    } else {
      setScheduleEntryId(selectedScheduleEntry?.id || scheduleEntries[0]?.id || '');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setType('teacher_change');
      setNewTeacherId('');
      setNewRoomId('');
      setNewSubjectId('');
      setNote('');
    }
  }, [initialSubstitution, selectedScheduleEntry, scheduleEntries, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleEntryId) return;

    const subToSave: Substitution = {
      id: initialSubstitution?.id || `subst-${Date.now()}`,
      scheduleEntryId,
      date,
      type,
      newTeacherId: newTeacherId || undefined,
      newRoomId: newRoomId || undefined,
      newSubjectId: newSubjectId || undefined,
      note: note.trim() || undefined,
    };

    onSave(subToSave);
    onClose();
  };

  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const days = ['', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={initialSubstitution ? 'Vertretung bearbeiten' : 'Vertretung / Entfall eintragen'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Schedule Entry Picker */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Betroffene Stunde
          </label>
          <select
            value={scheduleEntryId}
            onChange={(e) => setScheduleEntryId(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none"
          >
            {scheduleEntries.map((entry) => {
              const sub = subjectMap.get(entry.subjectId);
              const day = days[entry.dayOfWeek] || `Tag ${entry.dayOfWeek}`;
              return (
                <option key={entry.id} value={entry.id}>
                  {day} {entry.period}. Std ({entry.startTime} – {entry.endTime}): {sub?.name || 'Fach'}
                </option>
              );
            })}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Datum der Änderung
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
          />
        </div>

        {/* Type selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            Art der Änderung
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {SUBST_TYPES.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setType(st.id)}
                className={`p-2.5 rounded-xl text-left transition-all flex items-center justify-between ${
                  type === st.id
                    ? 'bg-ios-blue text-white shadow-xs font-semibold'
                    : 'bg-gray-100 dark:bg-ios-dark-secondary text-gray-800 dark:text-gray-200 hover:bg-gray-200'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{st.label}</div>
                  <div className={`text-[11px] ${type === st.id ? 'text-white/80' : 'text-gray-400'}`}>
                    {st.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Fields according to substitution type */}
        {type === 'teacher_change' && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Vertretungslehrer
            </label>
            <select
              value={newTeacherId}
              onChange={(e) => setNewTeacherId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none"
            >
              <option value="">Lehrer wählen...</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.shortName})
                </option>
              ))}
            </select>
          </div>
        )}

        {type === 'room_change' && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Neuer Raum
            </label>
            <select
              value={newRoomId}
              onChange={(e) => setNewRoomId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none"
            >
              <option value="">Raum wählen...</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {type === 'subject_change' && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Neues Fach
            </label>
            <select
              value={newSubjectId}
              onChange={(e) => setNewSubjectId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none"
            >
              <option value="">Fach wählen...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.shortName})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Note */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Hinweis / Hausaufgabenanweisung
          </label>
          <input
            type="text"
            placeholder="z.B. Stillarbeit, Aufgaben im Schulportal erledigen"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-3 pb-8 sm:pb-4">
          {initialSubstitution && onDelete && (
            <Button
              type="button"
              variant="destructive"
              size="md"
              onClick={() => {
                onDelete(initialSubstitution.id);
                onClose();
              }}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Löschen
            </Button>
          )}

          <Button type="submit" variant="primary" size="md" fullWidth>
            {initialSubstitution ? 'Änderungen speichern' : 'Vertretung eintragen'}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
