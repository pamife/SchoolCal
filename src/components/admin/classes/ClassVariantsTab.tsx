import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  Clock,
  BookOpen,
  User,
  MapPin,
} from 'lucide-react';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import type {
  TimetableVariant,
  TimetableEntry,
  Subject,
  Teacher,
  Room,
  SchedulePeriodTime,
} from '../../../types';

interface ClassVariantsTabProps {
  classId: string;
  variants: TimetableVariant[];
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  periods: SchedulePeriodTime[];
  onChangeVariants: (variants: TimetableVariant[]) => void;
}

const DAYS = [
  { id: 1, name: 'Montag' },
  { id: 2, name: 'Dienstag' },
  { id: 3, name: 'Mittwoch' },
  { id: 4, name: 'Donnerstag' },
  { id: 5, name: 'Freitag' },
];

export const ClassVariantsTab: React.FC<ClassVariantsTabProps> = ({
  classId,
  variants,
  subjects,
  teachers,
  rooms,
  periods,
  onChangeVariants,
}) => {
  const [editingVariant, setEditingVariant] = useState<TimetableVariant | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Buffer for adding entry to editing variant
  const [newEntryDay, setNewEntryDay] = useState(1);
  const [newEntryPeriod, setNewEntryPeriod] = useState(1);
  const [newEntrySubjectId, setNewEntrySubjectId] = useState(subjects[0]?.id || '');
  const [newEntryTeacherId, setNewEntryTeacherId] = useState(teachers[0]?.id || '');
  const [newEntryRoomId, setNewEntryRoomId] = useState(rooms[0]?.id || '');

  const handleStartAdd = () => {
    setEditingVariant({
      id: `var-${classId}-${Date.now()}`,
      name: '',
      category: 'Wahlpflichtfach',
      description: '',
      entries: [],
      replacesPeriods: [],
    });
    setIsNew(true);
    setNewEntryDay(1);
    setNewEntryPeriod(1);
    setNewEntrySubjectId(subjects[0]?.id || '');
    setNewEntryTeacherId(teachers[0]?.id || '');
    setNewEntryRoomId(rooms[0]?.id || '');
  };

  const handleSaveVariant = () => {
    if (!editingVariant || !editingVariant.name.trim()) return;

    if (isNew) {
      onChangeVariants([...variants, editingVariant]);
    } else {
      onChangeVariants(variants.map((v) => (v.id === editingVariant.id ? editingVariant : v)));
    }
    setEditingVariant(null);
    setIsNew(false);
  };

  const handleDeleteVariant = (id: string) => {
    onChangeVariants(variants.filter((v) => v.id !== id));
  };

  const handleAddEntryToVariant = () => {
    if (!editingVariant) return;

    const periodInfo = periods.find((p) => p.period === newEntryPeriod);
    const newEntry: TimetableEntry = {
      id: `ventry-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      dayOfWeek: newEntryDay,
      period: newEntryPeriod,
      startTime: periodInfo?.startTime || '08:00',
      endTime: periodInfo?.endTime || '08:45',
      subjectId: newEntrySubjectId || (subjects[0]?.id || ''),
      teacherId: newEntryTeacherId || undefined,
      roomId: newEntryRoomId || undefined,
      variantId: editingVariant.id,
    };

    // Also record replaces period slot
    const replaces = [...(editingVariant.replacesPeriods || [])];
    if (!replaces.some((r) => r.dayOfWeek === newEntryDay && r.period === newEntryPeriod)) {
      replaces.push({ dayOfWeek: newEntryDay, period: newEntryPeriod });
    }

    setEditingVariant({
      ...editingVariant,
      entries: [...editingVariant.entries, newEntry],
      replacesPeriods: replaces,
    });
  };

  const handleRemoveEntryFromVariant = (entryId: string) => {
    if (!editingVariant) return;
    const removedEntry = editingVariant.entries.find((e) => e.id === entryId);
    const updatedEntries = editingVariant.entries.filter((e) => e.id !== entryId);

    // Update replacesPeriods if no other entry covers this slot
    let updatedReplaces = editingVariant.replacesPeriods || [];
    if (
      removedEntry &&
      !updatedEntries.some(
        (e) => e.dayOfWeek === removedEntry.dayOfWeek && e.period === removedEntry.period
      )
    ) {
      updatedReplaces = updatedReplaces.filter(
        (r) => !(r.dayOfWeek === removedEntry.dayOfWeek && r.period === removedEntry.period)
      );
    }

    setEditingVariant({
      ...editingVariant,
      entries: updatedEntries,
      replacesPeriods: updatedReplaces,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Individuelle Stundenplan-Varianten
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Definiere Wahlfächer, Sprachkurse oder alternative Lehrkräfte, die Basisstunden ersetzen.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleStartAdd}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Variante anlegen
        </Button>
      </div>

      {/* Editing card */}
      {editingVariant && (
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary border border-ios-blue/30 space-y-4 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ios-blue">
            {isNew ? 'Neue Variante anlegen' : 'Variante bearbeiten'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Name der Variante
              </label>
              <input
                type="text"
                placeholder="z.B. Wahlpflicht Kunst oder Französisch (Schmidt)"
                value={editingVariant.name}
                onChange={(e) => setEditingVariant({ ...editingVariant, name: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-ios-dark-tertiary rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Kategorie
              </label>
              <input
                type="text"
                placeholder="z.B. Wahlpflichtfach, Fremdsprache, Gruppe"
                value={editingVariant.category || ''}
                onChange={(e) => setEditingVariant({ ...editingVariant, category: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-ios-dark-tertiary rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          {/* Lessons included in this variant */}
          <div className="space-y-2">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Unterrichtsstunden dieser Variante ({editingVariant.entries.length})
            </h5>

            {editingVariant.entries.length === 0 ? (
              <div className="p-3 text-center text-xs text-gray-400 bg-white dark:bg-ios-dark-tertiary rounded-xl">
                Noch keine Stunden zu dieser Variante hinzugefügt.
              </div>
            ) : (
              <div className="space-y-1.5">
                {editingVariant.entries.map((ent) => {
                  const sub = subjects.find((s) => s.id === ent.subjectId);
                  const teacher = teachers.find((t) => t.id === ent.teacherId);
                  const room = rooms.find((r) => r.id === ent.roomId);
                  const day = DAYS.find((d) => d.id === ent.dayOfWeek)?.name || `Tag ${ent.dayOfWeek}`;

                  return (
                    <div
                      key={ent.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-ios-dark-tertiary border border-black/5 dark:border-white/5 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {day}, {ent.period}. Std
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-ios-blue font-bold">{sub?.name || 'Fach'}</span>
                        <span className="text-gray-400">
                          {teacher?.shortName ? `(${teacher.shortName})` : ''}
                        </span>
                        <span className="text-gray-400">{room?.name || ''}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEntryFromVariant(ent.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add entry form */}
            <div className="p-3 rounded-xl bg-white/70 dark:bg-ios-dark-tertiary/70 border border-dashed border-gray-300 dark:border-gray-700 space-y-2">
              <span className="block text-[10px] font-bold text-gray-500 uppercase">
                Stunde zur Variante hinzufügen:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-400 mb-0.5">Wochentag</label>
                  <select
                    value={newEntryDay}
                    onChange={(e) => setNewEntryDay(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white dark:bg-ios-dark-secondary rounded-lg text-xs font-semibold"
                  >
                    {DAYS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 mb-0.5">Stunde</label>
                  <select
                    value={newEntryPeriod}
                    onChange={(e) => setNewEntryPeriod(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white dark:bg-ios-dark-secondary rounded-lg text-xs font-semibold"
                  >
                    {periods.map((p) => (
                      <option key={p.period} value={p.period}>
                        {p.period}. Std ({p.startTime})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 mb-0.5">Fach</label>
                  <select
                    value={newEntrySubjectId}
                    onChange={(e) => setNewEntrySubjectId(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white dark:bg-ios-dark-secondary rounded-lg text-xs font-semibold"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 mb-0.5">Lehrkraft</label>
                  <select
                    value={newEntryTeacherId}
                    onChange={(e) => setNewEntryTeacherId(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white dark:bg-ios-dark-secondary rounded-lg text-xs font-semibold"
                  >
                    <option value="">Keine / Unbekannt</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.shortName ? `${t.name} (${t.shortName})` : t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 mb-0.5">Raum</label>
                  <select
                    value={newEntryRoomId}
                    onChange={(e) => setNewEntryRoomId(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white dark:bg-ios-dark-secondary rounded-lg text-xs font-semibold"
                  >
                    <option value="">Keiner / Unbekannt</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddEntryToVariant}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Stunde hinzufügen
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/10">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditingVariant(null);
                setIsNew(false);
              }}
            >
              Abbrechen
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveVariant}>
              Variante speichern
            </Button>
          </div>
        </div>
      )}

      {/* List of variants */}
      {variants.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-400 bg-gray-50 dark:bg-ios-dark-secondary rounded-2xl border border-black/5 dark:border-white/5">
          <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          Noch keine Varianten für diese Klasse angelegt.
          <br />
          Erstelle Varianten für Wahlpflichtfächer, Sprachwahlen oder verschiedene Lehrer.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {variants.map((v) => (
            <div
              key={v.id}
              className="p-4 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{v.name}</h4>
                    {v.category && <Badge variant="blue" size="sm">{v.category}</Badge>}
                  </div>
                  {v.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{v.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingVariant(v);
                      setIsNew(false);
                    }}
                    className="p-1 text-gray-400 hover:text-ios-blue transition-colors"
                    title="Bearbeiten"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteVariant(v.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Löschen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Enthaltene Stunden ({v.entries.length}):
                </span>
                {v.entries.length === 0 ? (
                  <div className="text-[11px] text-gray-400 italic">Keine Stunden hinterlegt</div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {v.entries.map((e) => {
                      const s = subjects.find((sub) => sub.id === e.subjectId);
                      const day = DAYS.find((d) => d.id === e.dayOfWeek)?.name.substring(0, 2) || '';
                      return (
                        <span
                          key={e.id}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-ios-dark-tertiary text-[10px] font-semibold text-gray-700 dark:text-gray-300 border border-black/5 dark:border-white/5"
                        >
                          {day} {e.period}. Std: {s?.shortName || s?.name || 'Fach'}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
