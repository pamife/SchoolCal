import React, { useState, useEffect } from 'react';
import { CalendarEvent, CalendarEventType, Subject } from '../../types';
import { BottomSheet } from '../common/BottomSheet';
import { Button } from '../common/Button';
import { ACCENT_PALETTES } from '../../utils/colorUtils';
import { Calendar, Clock, MapPin, Tag, FileText, Trash2, Repeat, Bell } from 'lucide-react';
import { format } from 'date-fns';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (id: string) => void;
  initialEvent?: CalendarEvent | null;
  initialDate?: Date;
  subjects: Subject[];
}

const EVENT_TYPES: { id: CalendarEventType; label: string; color: string }[] = [
  { id: 'lesson', label: 'Unterricht', color: '#007AFF' },
  { id: 'exam', label: 'Klausur', color: '#FF3B30' },
  { id: 'test', label: 'Test / LK', color: '#FF9500' },
  { id: 'homework', label: 'Hausaufgabe', color: '#FF9500' },
  { id: 'submission', label: 'Abgabe', color: '#FF2D55' },
  { id: 'study', label: 'Lernen', color: '#AF52DE' },
  { id: 'leisure', label: 'Freizeit', color: '#00C7BE' },
  { id: 'personal', label: 'Persönlich', color: '#34C759' },
  { id: 'other', label: 'Sonstiges', color: '#8E8E93' },
];

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialEvent,
  initialDate,
  subjects,
}) => {
  const defaultDateStr = format(initialDate || new Date(), 'yyyy-MM-dd');

  const [title, setTitle] = useState('');
  const [type, setType] = useState<CalendarEventType>('personal');
  const [startDate, setStartDate] = useState(defaultDateStr);
  const [startTime, setStartTime] = useState('14:00');
  const [endDate, setEndDate] = useState(defaultDateStr);
  const [endTime, setEndTime] = useState('15:00');
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [color, setColor] = useState('#007AFF');
  const [reminderMinutes, setReminderMinutes] = useState<number>(30);
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom'>('none');

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setType(initialEvent.type);
      setStartDate(initialEvent.startDate.slice(0, 10));
      setStartTime(initialEvent.startDate.slice(11, 16) || '14:00');
      setEndDate(initialEvent.endDate.slice(0, 10));
      setEndTime(initialEvent.endDate.slice(11, 16) || '15:00');
      setAllDay(Boolean(initialEvent.allDay));
      setLocation(initialEvent.location || '');
      setDescription(initialEvent.description || '');
      setSubjectId(initialEvent.subjectId || '');
      setColor(initialEvent.color || '#007AFF');
      setReminderMinutes(initialEvent.reminderMinutes || 30);
      setRecurrence(initialEvent.recurrence || 'none');
    } else {
      const todayStr = format(initialDate || new Date(), 'yyyy-MM-dd');
      setTitle('');
      setType('personal');
      setStartDate(todayStr);
      setStartTime('14:00');
      setEndDate(todayStr);
      setEndTime('15:00');
      setAllDay(false);
      setLocation('');
      setDescription('');
      setSubjectId('');
      setColor('#007AFF');
      setReminderMinutes(30);
      setRecurrence('none');
    }
  }, [initialEvent, initialDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const startIso = allDay ? `${startDate}T00:00:00` : `${startDate}T${startTime}:00`;
    const endIso = allDay ? `${endDate}T23:59:59` : `${endDate}T${endTime}:00`;

    const eventToSave: CalendarEvent = {
      id: initialEvent?.id || `evt-${Date.now()}`,
      title: title.trim(),
      type,
      startDate: startIso,
      endDate: endIso,
      allDay,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      subjectId: subjectId || undefined,
      color,
      reminderMinutes,
      recurrence,
    };

    onSave(eventToSave);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={initialEvent ? 'Termin bearbeiten' : 'Neuer Termin'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Titel
          </label>
          <input
            type="text"
            required
            placeholder="z.B. Volleyball Training oder Arzttermin"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ios-blue"
          />
        </div>

        {/* Event Type selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            Kategorie
          </label>
          <div className="flex flex-wrap gap-1.5">
            {EVENT_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setType(t.id);
                  setColor(t.color);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  type === t.id
                    ? 'bg-ios-blue text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-ios-dark-secondary text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-ios-dark-tertiary'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Subject Link */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Verknüpftes Fach (optional)
          </label>
          <select
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value);
              const sub = subjects.find(s => s.id === e.target.value);
              if (sub) setColor(sub.color);
            }}
            className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue"
          >
            <option value="">Kein Schulfach</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.shortName})
              </option>
            ))}
          </select>
        </div>

        {/* All-Day Toggle */}
        <div className="flex items-center justify-between py-1">
          <span className="text-sm font-medium text-gray-900 dark:text-white">Ganztägig</span>
          <button
            type="button"
            onClick={() => setAllDay(!allDay)}
            className={`w-12 h-7 rounded-full transition-colors relative p-0.5 ${
              allDay ? 'bg-ios-blue' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                allDay ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Beginn Datum
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          {!allDay && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Uhrzeit
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Ende Datum
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          {!allDay && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Uhrzeit
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Ort / Raum
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="z.B. Raum 204 oder Sporthalle"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Recurrence & Reminder */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Wiederholung
            </label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none"
            >
              <option value="none">Keine</option>
              <option value="daily">Täglich</option>
              <option value="weekly">Wöchentlich</option>
              <option value="biweekly">Alle 2 Wochen</option>
              <option value="monthly">Monatlich</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Erinnerung
            </label>
            <select
              value={reminderMinutes}
              onChange={(e) => setReminderMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none"
            >
              <option value="0">Keine</option>
              <option value="5">5 Min vorher</option>
              <option value="15">15 Min vorher</option>
              <option value="30">30 Min vorher</option>
              <option value="60">1 Stunde vorher</option>
              <option value="1440">1 Tag vorher</option>
            </select>
          </div>
        </div>

        {/* Description / Notes */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Beschreibung / Notizen
          </label>
          <textarea
            rows={2}
            placeholder="Zusätzliche Notizen zum Termin..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-3 pb-8 sm:pb-4">
          {initialEvent && onDelete && (
            <Button
              type="button"
              variant="destructive"
              size="md"
              onClick={() => {
                onDelete(initialEvent.id);
                onClose();
              }}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Löschen
            </Button>
          )}

          <Button type="submit" variant="primary" size="md" fullWidth>
            {initialEvent ? 'Änderungen speichern' : 'Termin anlegen'}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
