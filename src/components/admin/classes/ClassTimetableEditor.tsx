import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Save,
  Layers,
  Sparkles,
  ChevronDown,
  Check,
} from 'lucide-react';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { BottomSheet } from '../../common/BottomSheet';
import { hexToRgba, SUBJECT_COLORS } from '../../../utils/colorUtils';
import type {
  TimetableEntry,
  TimetableVariant,
  Subject,
  Teacher,
  Room,
  SchedulePeriodTime,
} from '../../../types';

interface ClassTimetableEditorProps {
  baseEntries: TimetableEntry[];
  variants: TimetableVariant[];
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  periods: SchedulePeriodTime[];
  activeVersion: number;
  onSaveDraft: (entries: TimetableEntry[]) => Promise<void>;
  onOpenPublishModal: () => void;
}

const DAYS = [
  { id: 1, name: 'Montag', short: 'Mo' },
  { id: 2, name: 'Dienstag', short: 'Di' },
  { id: 3, name: 'Mittwoch', short: 'Mi' },
  { id: 4, name: 'Donnerstag', short: 'Do' },
  { id: 5, name: 'Freitag', short: 'Fr' },
];

export const ClassTimetableEditor: React.FC<ClassTimetableEditorProps> = ({
  baseEntries,
  variants,
  subjects,
  teachers,
  rooms,
  periods,
  activeVersion,
  onSaveDraft,
  onOpenPublishModal,
}) => {
  const [entries, setEntries] = useState<TimetableEntry[]>(baseEntries);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Selected cell for editing
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [isCellModalOpen, setIsCellModalOpen] = useState(false);

  // Modal editing inputs
  const [editSubjectId, setEditSubjectId] = useState<string>('');
  const [editTeacherId, setEditTeacherId] = useState<string>('');
  const [editRoomId, setEditRoomId] = useState<string>('');
  const [editCourseGroup, setEditCourseGroup] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');
  const [isDoubleLesson, setIsDoubleLesson] = useState(false);

  // Filter preview by variant
  const [previewVariantId, setPreviewVariantId] = useState<string>('base');

  // Lookup maps
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  // Handle cell click
  const handleCellClick = (dayOfWeek: number, periodNum: number) => {
    setSelectedDay(dayOfWeek);
    setSelectedPeriod(periodNum);

    const existing = entries.find((e) => e.dayOfWeek === dayOfWeek && e.period === periodNum);
    const nextExisting = entries.find(
      (e) => e.dayOfWeek === dayOfWeek && e.period === periodNum + 1
    );

    if (existing) {
      setEditSubjectId(existing.subjectId);
      setEditTeacherId(existing.teacherId || '');
      setEditRoomId(existing.roomId || '');
      setEditCourseGroup(existing.courseGroup || '');
      setEditNote(existing.note || '');
      setIsDoubleLesson(Boolean(nextExisting && nextExisting.subjectId === existing.subjectId));
    } else {
      setEditSubjectId(subjects[0]?.id || '');
      setEditTeacherId(teachers[0]?.id || '');
      setEditRoomId(rooms[0]?.id || '');
      setEditCourseGroup('');
      setEditNote('');
      setIsDoubleLesson(false);
    }

    setIsCellModalOpen(true);
  };

  // Save cell edit
  const handleSaveCell = () => {
    if (!selectedDay || !selectedPeriod || !editSubjectId) return;

    const currentPeriodInfo = periods.find((p) => p.period === selectedPeriod);
    const updatedEntries = entries.filter(
      (e) => !(e.dayOfWeek === selectedDay && e.period === selectedPeriod)
    );

    const newEntry: TimetableEntry = {
      id: `entry-${selectedDay}-${selectedPeriod}-${Date.now()}`,
      dayOfWeek: selectedDay,
      period: selectedPeriod,
      startTime: currentPeriodInfo?.startTime || '08:00',
      endTime: currentPeriodInfo?.endTime || '08:45',
      subjectId: editSubjectId,
      teacherId: editTeacherId || undefined,
      roomId: editRoomId || undefined,
      courseGroup: editCourseGroup.trim() || undefined,
      note: editNote.trim() || undefined,
    };

    updatedEntries.push(newEntry);

    // If double lesson toggle is on, also update/insert the next period
    if (isDoubleLesson && selectedPeriod < periods.length) {
      const nextPeriodNum = selectedPeriod + 1;
      const nextPeriodInfo = periods.find((p) => p.period === nextPeriodNum);

      // Remove existing in next period
      const filtered = updatedEntries.filter(
        (e) => !(e.dayOfWeek === selectedDay && e.period === nextPeriodNum)
      );

      const nextEntry: TimetableEntry = {
        id: `entry-${selectedDay}-${nextPeriodNum}-${Date.now()}`,
        dayOfWeek: selectedDay,
        period: nextPeriodNum,
        startTime: nextPeriodInfo?.startTime || '08:50',
        endTime: nextPeriodInfo?.endTime || '09:35',
        subjectId: editSubjectId,
        teacherId: editTeacherId || undefined,
        roomId: editRoomId || undefined,
        courseGroup: editCourseGroup.trim() || undefined,
        note: editNote.trim() || undefined,
      };

      filtered.push(nextEntry);
      setEntries(filtered);
    } else {
      setEntries(updatedEntries);
    }

    setIsDirty(true);
    setIsCellModalOpen(false);
  };

  // Delete cell entry
  const handleDeleteCell = () => {
    if (!selectedDay || !selectedPeriod) return;
    const updated = entries.filter(
      (e) => !(e.dayOfWeek === selectedDay && e.period === selectedPeriod)
    );
    setEntries(updated);
    setIsDirty(true);
    setIsCellModalOpen(false);
  };

  const handleSaveDraftClick = async () => {
    setIsSaving(true);
    try {
      await onSaveDraft(entries);
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  };

  // If previewVariantId is not 'base', merge that variant's entries for preview
  const displayEntries = React.useMemo(() => {
    if (previewVariantId === 'base') return entries;
    const variant = variants.find((v) => v.id === previewVariantId);
    if (!variant) return entries;

    const replaced = new Set(
      (variant.replacesPeriods || []).map((r) => `${r.dayOfWeek}-${r.period}`)
    );
    const baseRemaining = entries.filter((e) => !replaced.has(`${e.dayOfWeek}-${e.period}`));
    return [...baseRemaining, ...(variant.entries || [])];
  }, [entries, previewVariantId, variants]);

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 dark:bg-ios-dark-secondary p-3 rounded-2xl border border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">Ansicht:</span>
          <select
            value={previewVariantId}
            onChange={(e) => setPreviewVariantId(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-ios-dark-tertiary rounded-lg text-xs font-semibold"
          >
            <option value="base">Basis-Stundenplan ({entries.length} Std)</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                Variante: {v.name}
              </option>
            ))}
          </select>

          {isDirty && (
            <Badge variant="amber" size="sm">
              Nicht gespeicherte Änderungen
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSaveDraftClick}
            disabled={isSaving || !isDirty}
            icon={<Save className="w-3.5 h-3.5" />}
          >
            {isSaving ? 'Speichert...' : 'Entwurf sichern'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenPublishModal}
            icon={<Upload className="w-3.5 h-3.5" />}
          >
            Vorschau & Veröffentlichen
          </Button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="ios-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <div className="min-w-[640px]">
            {/* Header row */}
            <div className="grid grid-cols-6 border-b border-black/5 dark:border-white/10 bg-gray-50/80 dark:bg-ios-dark-secondary/80">
              <div className="p-3 text-center text-xs font-bold text-gray-400 border-r border-black/5 dark:border-white/5">
                Stunde
              </div>
              {DAYS.map((day) => (
                <div
                  key={day.id}
                  className="p-3 text-center text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 border-r last:border-r-0 border-black/5 dark:border-white/5"
                >
                  {day.name}
                </div>
              ))}
            </div>

            {/* Grid rows for 10 periods */}
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {periods.map((periodInfo) => {
                const periodNum = periodInfo.period;

                return (
                  <div key={periodNum} className="grid grid-cols-6 items-stretch min-h-[72px]">
                    {/* Time Column */}
                    <div className="p-2 flex flex-col items-center justify-center border-r border-black/5 dark:border-white/5 bg-gray-50/40 dark:bg-ios-dark-secondary/40">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {periodNum}. Std
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {periodInfo.startTime}–{periodInfo.endTime}
                      </span>
                    </div>

                    {/* 5 Day Cells */}
                    {DAYS.map((day) => {
                      const entry = displayEntries.find(
                        (e) => e.dayOfWeek === day.id && e.period === periodNum
                      );
                      const prevEntry = displayEntries.find(
                        (e) => e.dayOfWeek === day.id && e.period === periodNum - 1
                      );
                      const nextEntry = displayEntries.find(
                        (e) => e.dayOfWeek === day.id && e.period === periodNum + 1
                      );

                      const subject = entry ? subjectMap.get(entry.subjectId) : undefined;
                      const teacher = entry?.teacherId ? teacherMap.get(entry.teacherId) : undefined;
                      const room = entry?.roomId ? roomMap.get(entry.roomId) : undefined;

                      // Double lesson detection: same subject and adjacent
                      const isConnectedWithPrev = Boolean(
                        entry && prevEntry && entry.subjectId === prevEntry.subjectId
                      );
                      const isConnectedWithNext = Boolean(
                        entry && nextEntry && entry.subjectId === nextEntry.subjectId
                      );

                      return (
                        <div
                          key={day.id}
                          onClick={() => handleCellClick(day.id, periodNum)}
                          className={`p-1.5 border-r last:border-r-0 border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex flex-col justify-center ${
                            isConnectedWithPrev ? 'pt-0' : ''
                          } ${isConnectedWithNext ? 'pb-0' : ''}`}
                        >
                          {entry && subject ? (
                            <div
                              style={{
                                borderLeftColor: subject.color,
                                borderLeftWidth: '3px',
                                backgroundColor: hexToRgba(subject.color, 0.08),
                              }}
                              className={`p-2 border border-black/5 dark:border-white/5 h-full flex flex-col justify-between transition-all ${
                                isConnectedWithPrev && isConnectedWithNext
                                  ? 'rounded-none border-t-0 border-b-0 -mt-1.5 -mb-1.5'
                                  : isConnectedWithPrev
                                  ? 'rounded-t-none rounded-b-lg border-t-0 -mt-1.5'
                                  : isConnectedWithNext
                                  ? 'rounded-b-none rounded-t-lg border-b-0 -mb-1.5'
                                  : 'rounded-lg'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                                  {subject.name}
                                </span>
                                {isConnectedWithNext && (
                                  <span
                                    style={{
                                      backgroundColor: hexToRgba(subject.color, 0.2),
                                      color: subject.color,
                                    }}
                                    className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase"
                                  >
                                    Doppelstunde
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                                <span>{room?.name?.replace('Raum ', 'R') || ''}</span>
                                <span>{teacher?.shortName || ''}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full rounded-lg border border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center text-[10px] text-gray-300 dark:text-gray-600 hover:border-ios-blue hover:text-ios-blue transition-colors">
                              +
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Cell Edit BottomSheet Modal */}
      <BottomSheet
        isOpen={isCellModalOpen}
        onClose={() => setIsCellModalOpen(false)}
        title={
          selectedDay && selectedPeriod
            ? `${DAYS.find((d) => d.id === selectedDay)?.name}, ${selectedPeriod}. Stunde bearbeiten`
            : 'Stunde bearbeiten'
        }
      >
        <div className="space-y-4 pb-2">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Fach</label>
            <select
              value={editSubjectId}
              onChange={(e) => setEditSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.shortName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Lehrkraft</label>
              <select
                value={editTeacherId}
                onChange={(e) => setEditTeacherId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold"
              >
                <option value="">Keine / Nicht zugewiesen</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title ? `${t.title} ` : ''}{t.name} ({t.shortName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Raum</label>
              <select
                value={editRoomId}
                onChange={(e) => setEditRoomId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold"
              >
                <option value="">Keiner / Nicht zugewiesen</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Kurs / Gruppe</label>
              <input
                type="text"
                placeholder="z.B. GK1 oder G1"
                value={editCourseGroup}
                onChange={(e) => setEditCourseGroup(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Notiz</label>
              <input
                type="text"
                placeholder="z.B. 14-tägig"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          {/* Double Lesson Toggle */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-900 dark:text-white">
                Als Doppelstunde anlegen
              </div>
              <div className="text-[11px] text-gray-400">
                Fügt das gleiche Fach auch in die Folgestunde ein
              </div>
            </div>
            <input
              type="checkbox"
              checked={isDoubleLesson}
              onChange={(e) => setIsDoubleLesson(e.target.checked)}
              className="rounded text-ios-blue focus:ring-ios-blue w-4 h-4"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/10">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDeleteCell}
              icon={<Trash2 className="w-3.5 h-3.5" />}
              className="text-red-500 hover:text-red-600"
            >
              Stunde löschen
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsCellModalOpen(false)}>
                Abbrechen
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveCell}>
                Übernehmen
              </Button>
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
