import React, { useState, useEffect, useMemo } from 'react';
import { Homework, Subject, PriorityLevel, TaskStatus, DueDateMode, DueDateSource } from '../../types';
import { BottomSheet } from '../common/BottomSheet';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { format, addDays, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Trash2, Sparkles, Calendar, Clock, RotateCcw, Edit3, CheckCircle, Info } from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { calculateAutoDueDate } from '../../utils/homeworkDueDateEngine';

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
  const { scheduleEntries, substitutions } = useSchoolStore();
  const { settings } = useSettingsStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('08:00');
  const [dueDateMode, setDueDateMode] = useState<DueDateMode>('AUTO');
  const [dueDateSource, setDueDateSource] = useState<DueDateSource | undefined>(undefined);
  const [isManualPickerOpen, setIsManualPickerOpen] = useState(false);
  const [priority, setPriority] = useState<PriorityLevel>('normal');
  const [status, setStatus] = useState<TaskStatus>('todo');

  // Calculate automatic due date for the currently selected subject
  const autoCalcResult = useMemo(() => {
    if (!subjectId) return null;
    return calculateAutoDueDate({
      subjectId,
      referenceDate: new Date(),
      scheduleEntries,
      substitutions,
      holidayState: settings.state,
      activeTimetableVersion: settings.activeTimetableVersion,
      settings,
    });
  }, [subjectId, scheduleEntries, substitutions, settings]);

  // Initial load when modal opens or initialHomework changes
  useEffect(() => {
    if (!isOpen) return;

    if (initialHomework) {
      setTitle(initialHomework.title);
      setDescription(initialHomework.description || '');
      setSubjectId(initialHomework.subjectId);
      setDueDate(initialHomework.dueDate);
      setDueTime(initialHomework.dueTime || '08:00');
      const mode = initialHomework.dueDateMode || 'AUTO';
      setDueDateMode(mode);
      setDueDateSource(initialHomework.dueDateSource);
      setIsManualPickerOpen(mode === 'MANUAL');
      setPriority(initialHomework.priority);
      setStatus(initialHomework.status);
    } else {
      setTitle('');
      setDescription('');
      const defaultSubId = subjects[0]?.id || '';
      setSubjectId(defaultSubId);
      setPriority('normal');
      setStatus('todo');
      setDueDateMode('AUTO');
      setDueDateSource(undefined);

      // Compute initial auto due date
      const calc = defaultSubId
        ? calculateAutoDueDate({
            subjectId: defaultSubId,
            referenceDate: new Date(),
            scheduleEntries,
            substitutions,
            holidayState: settings.state,
            activeTimetableVersion: settings.activeTimetableVersion,
            settings,
          })
        : null;

      if (calc && calc.found) {
        setDueDate(calc.dueDate);
        setDueTime(calc.dueTime);
        setDueDateSource({
          scheduleEntryId: calc.scheduleEntryId,
          lessonDate: calc.dueDate,
          lessonStartTime: calc.dueTime,
          lessonPeriod: calc.lessonPeriod,
          calculatedAt: new Date().toISOString(),
          reason: calc.reason,
          isShifted: calc.isPostponedDueToCancellation,
        });
        setIsManualPickerOpen(false);
      } else {
        const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
        setDueDate(tomorrow);
        setDueTime('08:00');
        setIsManualPickerOpen(true);
      }
    }
  }, [initialHomework, isOpen, subjects, scheduleEntries, substitutions, settings]);

  // When subject changes and in AUTO mode, recalculate
  const handleSubjectChange = (newSubjectId: string) => {
    setSubjectId(newSubjectId);

    if (dueDateMode === 'AUTO') {
      const calc = calculateAutoDueDate({
        subjectId: newSubjectId,
        referenceDate: new Date(),
        scheduleEntries,
        substitutions,
        holidayState: settings.state,
        activeTimetableVersion: settings.activeTimetableVersion,
        settings,
      });

      if (calc.found) {
        setDueDate(calc.dueDate);
        setDueTime(calc.dueTime);
        setDueDateSource({
          scheduleEntryId: calc.scheduleEntryId,
          lessonDate: calc.dueDate,
          lessonStartTime: calc.dueTime,
          lessonPeriod: calc.lessonPeriod,
          calculatedAt: new Date().toISOString(),
          reason: calc.reason,
          isShifted: calc.isPostponedDueToCancellation,
        });
        setIsManualPickerOpen(false);
      } else {
        // No schedule found -> keep or fallback to tomorrow
        if (!dueDate) {
          setDueDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
        }
        setIsManualPickerOpen(true);
      }
    }
  };

  // Restore automatic calculation
  const handleRestoreAuto = () => {
    setDueDateMode('AUTO');
    setIsManualPickerOpen(false);

    if (autoCalcResult && autoCalcResult.found) {
      setDueDate(autoCalcResult.dueDate);
      setDueTime(autoCalcResult.dueTime);
      setDueDateSource({
        scheduleEntryId: autoCalcResult.scheduleEntryId,
        lessonDate: autoCalcResult.dueDate,
        lessonStartTime: autoCalcResult.dueTime,
        lessonPeriod: autoCalcResult.lessonPeriod,
        calculatedAt: new Date().toISOString(),
        reason: autoCalcResult.reason,
        isShifted: autoCalcResult.isPostponedDueToCancellation,
      });
    }
  };

  // Switch to manual mode
  const handleManualDateChange = (newDate: string) => {
    setDueDate(newDate);
    setDueDateMode('MANUAL');
    setDueDateSource((prev) => ({
      ...prev,
      calculatedAt: new Date().toISOString(),
      reason: 'manual_override',
      isShifted: false,
    }));
  };

  const handleManualTimeChange = (newTime: string) => {
    setDueTime(newTime);
    setDueDateMode('MANUAL');
    setDueDateSource((prev) => ({
      ...prev,
      calculatedAt: new Date().toISOString(),
      reason: 'manual_override',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    const finalDueDate = dueDate || format(addDays(new Date(), 1), 'yyyy-MM-dd');

    const homeworkToSave: Homework = {
      id: initialHomework?.id || `hw-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      subjectId,
      dueDate: finalDueDate,
      dueTime: dueTime || '08:00',
      dueDateMode,
      dueDateSource: dueDateMode === 'AUTO' ? dueDateSource : undefined,
      priority,
      status,
      createdAt: initialHomework?.createdAt || new Date().toISOString(),
      completedAt: status === 'done' ? (initialHomework?.completedAt || new Date().toISOString()) : undefined,
    };

    onSave(homeworkToSave);
    onClose();
  };

  const selectedSubject = subjects.find((s) => s.id === subjectId);
  const formattedDueDate = dueDate
    ? format(parseISO(dueDate), 'EEEE, d. MMMM yyyy', { locale: de })
    : '–';

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
            placeholder="z.B. Buch S. 84 Nr. 3–7 oder Vokabeln lernen"
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

        {/* 📅 Intelligent Due Date Card */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-ios-dark-secondary/70 p-3.5 space-y-2.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-ios-blue" />
              <span>Fälligkeitsdatum</span>
            </span>

            {dueDateMode === 'AUTO' ? (
              <Badge variant={autoCalcResult?.isPostponedDueToCancellation ? 'amber' : 'blue'} size="sm">
                <Sparkles className="w-3 h-3 mr-1" />
                {autoCalcResult?.isPostponedDueToCancellation ? 'Automatisch verschoben' : 'Automatisch bestimmt'}
              </Badge>
            ) : (
              <Badge variant="gray" size="sm">
                <Edit3 className="w-3 h-3 mr-1" />
                Manuell festgelegt
              </Badge>
            )}
          </div>

          {/* AUTO Mode Display */}
          {dueDateMode === 'AUTO' && autoCalcResult?.found && !isManualPickerOpen && (
            <div className="p-3 rounded-xl bg-white dark:bg-ios-dark-tertiary border border-black/5 dark:border-white/5 shadow-xs flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span>📅 {autoCalcResult.formattedDate}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>
                    {autoCalcResult.lessonPeriod ? `${autoCalcResult.lessonPeriod}. Stunde` : 'Unterricht'} • {autoCalcResult.dueTime} Uhr
                  </span>
                  {selectedSubject && (
                    <span className="text-[11px] font-medium text-gray-400">
                      ({selectedSubject.name})
                    </span>
                  )}
                </div>

                {autoCalcResult.isPostponedDueToCancellation && (
                  <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3 shrink-0" />
                    <span>Nächster regulärer Termin entfällt – Frist automatisch nach hinten verschoben.</span>
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsManualPickerOpen(true);
                  setDueDateMode('MANUAL');
                }}
                className="shrink-0 text-xs py-1.5 px-2.5"
              >
                Datum ändern
              </Button>
            </div>
          )}

          {/* AUTO Mode but NO Schedule found */}
          {dueDateMode === 'AUTO' && (!autoCalcResult || !autoCalcResult.found) && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs">
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <Info className="w-3.5 h-3.5 text-amber-500" />
                <span>Keine automatische Frist gefunden</span>
              </div>
              <p className="text-[11px] text-amber-700/90 dark:text-amber-300/90">
                Für {selectedSubject?.name || 'dieses Fach'} sind aktuell keine zukünftigen Stunden im Stundenplan eingetragen. Bitte wähle das Datum manuell:
              </p>
            </div>
          )}

          {/* MANUAL Mode / Picker Open */}
          {(isManualPickerOpen || dueDateMode === 'MANUAL' || (!autoCalcResult?.found && dueDateMode === 'AUTO')) && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Datum
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => handleManualDateChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-ios-dark-tertiary rounded-xl text-xs font-semibold text-gray-900 dark:text-white border border-black/5 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-ios-blue"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Uhrzeit (optional)
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => handleManualTimeChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-ios-dark-tertiary rounded-xl text-xs font-semibold text-gray-900 dark:text-white border border-black/5 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-ios-blue"
                  />
                </div>
              </div>

              {/* Restore Auto Button */}
              {autoCalcResult?.found && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Vorschlag: {autoCalcResult.shortFormattedDate} ({autoCalcResult.dueTime} Uhr)
                  </span>
                  <button
                    type="button"
                    onClick={handleRestoreAuto}
                    className="text-xs font-bold text-ios-blue hover:underline flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Automatische Frist verwenden</span>
                  </button>
                </div>
              )}
            </div>
          )}
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
            Beschreibung / Details (optional)
          </label>
          <textarea
            rows={2}
            placeholder="z.B. Seitenzahlen, Partnerarbeit oder Hinweise der Lehrkraft..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-3 pb-8 sm:pb-4">
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
            {initialHomework ? 'Änderungen speichern' : 'Aufgabe erstellen'}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};

