import React, { useState } from 'react';
import { Clock, Plus, Trash2, RotateCcw, CheckCircle2, Calendar, Sparkles } from 'lucide-react';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { OFFICIAL_SCHERPF_PERIODS } from '../../../config/schoolConfig';
import type { SchedulePeriodTime, DayScheduleOverride } from '../../../types';

interface SchoolPeriodsSubTabProps {
  periods: SchedulePeriodTime[];
  dayOverrides?: DayScheduleOverride;
  adminUid: string;
  adminEmail: string;
  onSave: (
    periods: SchedulePeriodTime[],
    dayOverrides?: DayScheduleOverride
  ) => Promise<void>;
}

type WeekdayKey = 'all' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export const SchoolPeriodsSubTab: React.FC<SchoolPeriodsSubTabProps> = ({
  periods: initialPeriods,
  dayOverrides: initialDayOverrides,
  onSave,
}) => {
  const [activeDay, setActiveDay] = useState<WeekdayKey>('all');
  const [standardPeriods, setStandardPeriods] = useState<SchedulePeriodTime[]>(
    initialPeriods.length > 0 ? initialPeriods : OFFICIAL_SCHERPF_PERIODS
  );
  const [dayOverrides, setDayOverrides] = useState<DayScheduleOverride>(
    initialDayOverrides || {}
  );
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Active periods being edited based on selected day
  const currentPeriods: SchedulePeriodTime[] =
    activeDay === 'all'
      ? standardPeriods
      : dayOverrides[activeDay] || standardPeriods;

  const handleTimeChange = (
    index: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const updated = [...currentPeriods];
    updated[index] = { ...updated[index], [field]: value };

    if (activeDay === 'all') {
      setStandardPeriods(updated);
    } else {
      setDayOverrides({ ...dayOverrides, [activeDay]: updated });
    }
  };

  const handleAddPeriod = () => {
    const nextPeriodNum = currentPeriods.length + 1;
    const lastPeriod = currentPeriods[currentPeriods.length - 1];
    let newStart = '16:35';
    let newEnd = '17:20';

    if (lastPeriod) {
      const [h, m] = lastPeriod.endTime.split(':').map(Number);
      const startMinutes = h * 60 + m + 5;
      const endMinutes = startMinutes + 45;
      const sh = Math.floor(startMinutes / 60).toString().padStart(2, '0');
      const sm = (startMinutes % 60).toString().padStart(2, '0');
      const eh = Math.floor(endMinutes / 60).toString().padStart(2, '0');
      const em = (endMinutes % 60).toString().padStart(2, '0');
      newStart = `${sh}:${sm}`;
      newEnd = `${eh}:${em}`;
    }

    const newPeriod: SchedulePeriodTime = {
      period: nextPeriodNum,
      startTime: newStart,
      endTime: newEnd,
      label: `${nextPeriodNum}. Stunde`,
    };

    const updated = [...currentPeriods, newPeriod];
    if (activeDay === 'all') {
      setStandardPeriods(updated);
    } else {
      setDayOverrides({ ...dayOverrides, [activeDay]: updated });
    }
  };

  const handleRemovePeriod = (periodNum: number) => {
    if (currentPeriods.length <= 1) return;
    const filtered = currentPeriods
      .filter((p) => p.period !== periodNum)
      .map((p, idx) => ({ ...p, period: idx + 1, label: `${idx + 1}. Stunde` }));

    if (activeDay === 'all') {
      setStandardPeriods(filtered);
    } else {
      setDayOverrides({ ...dayOverrides, [activeDay]: filtered });
    }
  };

  const handleResetToOfficial = () => {
    if (
      window.confirm(
        'Möchtest du die Unterrichtszeiten auf die offiziellen Zeiten des Christa-und-Peter-Scherpf-Gymnasiums (Start 07:30 Uhr) zurücksetzen?'
      )
    ) {
      setStandardPeriods(OFFICIAL_SCHERPF_PERIODS);
      if (activeDay !== 'all') {
        const nextOverrides = { ...dayOverrides };
        delete nextOverrides[activeDay];
        setDayOverrides(nextOverrides);
      }
    }
  };

  const handleRemoveDayOverride = (dayKey: keyof DayScheduleOverride) => {
    const nextOverrides = { ...dayOverrides };
    delete nextOverrides[dayKey];
    setDayOverrides(nextOverrides);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Clean empty overrides
      const cleanOverrides: DayScheduleOverride = {};
      let hasAnyOverride = false;
      (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const).forEach((d) => {
        if (dayOverrides[d] && dayOverrides[d]!.length > 0) {
          cleanOverrides[d] = dayOverrides[d];
          hasAnyOverride = true;
        }
      });

      await onSave(standardPeriods, hasAnyOverride ? cleanOverrides : undefined);
      setSuccessMessage('Unterrichtszeiten erfolgreich gespeichert und an alle Clients übertragen.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving periods:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const weekdaysList: { id: WeekdayKey; label: string }[] = [
    { id: 'all', label: 'Standard (Mo–Fr)' },
    { id: 'monday', label: 'Montag' },
    { id: 'tuesday', label: 'Dienstag' },
    { id: 'wednesday', label: 'Mittwoch' },
    { id: 'thursday', label: 'Donnerstag' },
    { id: 'friday', label: 'Freitag' },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-black/5 dark:border-white/10">
        <div>
          <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-ios-blue" />
            <span>Zentrale Unterrichtszeiten & Glockenzeiten</span>
          </h4>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            Änderungen werden sofort in den Stundenplan, Smart Day und alle Fristen übernommen.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetToOfficial}
          className="text-xs font-semibold text-ios-blue hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Offizielle Schulzeiten laden</span>
        </button>
      </div>

      {/* Weekday Selector */}
      <div className="space-y-1">
        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Gültigkeit / Wochentags-Anpassung
        </label>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {weekdaysList.map((wd) => {
            const hasOverride = wd.id !== 'all' && Boolean(dayOverrides[wd.id as keyof DayScheduleOverride]);
            const isSelected = activeDay === wd.id;

            return (
              <button
                key={wd.id}
                type="button"
                onClick={() => setActiveDay(wd.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-ios-blue text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-ios-dark-secondary text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                <span>{wd.label}</span>
                {hasOverride && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-500'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Override Notice if individual day is active */}
      {activeDay !== 'all' && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between gap-2">
          <span>
            {dayOverrides[activeDay]
              ? `Eigene Zeiten für ${weekdaysList.find((w) => w.id === activeDay)?.label} aktiv.`
              : `Aktuell gelten die Standardzeiten für ${weekdaysList.find((w) => w.id === activeDay)?.label}. Durch Bearbeiten wird eine Ausnahme angelegt.`}
          </span>
          {dayOverrides[activeDay] && (
            <button
              type="button"
              onClick={() => handleRemoveDayOverride(activeDay as keyof DayScheduleOverride)}
              className="text-[11px] font-bold text-red-500 hover:underline shrink-0"
            >
              Ausnahme löschen
            </button>
          )}
        </div>
      )}

      {/* Lesson Periods Table / List */}
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          <span className="col-span-4">Stunde</span>
          <span className="col-span-3">Beginn</span>
          <span className="col-span-3">Ende</span>
          <span className="col-span-2 text-right">Aktion</span>
        </div>

        <div className="space-y-1.5 max-h-72 overflow-y-auto no-scrollbar pr-1">
          {currentPeriods.map((p, index) => (
            <div
              key={p.period}
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 grid grid-cols-12 gap-2 items-center"
            >
              <div className="col-span-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-ios-blue/15 text-ios-blue font-bold text-xs flex items-center justify-center shrink-0">
                  {p.period}
                </span>
                <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {p.label || `${p.period}. Stunde`}
                </span>
              </div>

              <div className="col-span-3">
                <input
                  type="time"
                  required
                  value={p.startTime}
                  onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                  className="w-full px-2 py-1.5 bg-white dark:bg-ios-dark-card border border-gray-200 dark:border-white/10 rounded-lg text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-ios-blue"
                />
              </div>

              <div className="col-span-3">
                <input
                  type="time"
                  required
                  value={p.endTime}
                  onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                  className="w-full px-2 py-1.5 bg-white dark:bg-ios-dark-card border border-gray-200 dark:border-white/10 rounded-lg text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-ios-blue"
                />
              </div>

              <div className="col-span-2 flex justify-end">
                {currentPeriods.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePeriod(p.period)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Stunde entfernen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAddPeriod}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          + Unterrichtsstunde hinzufügen
        </Button>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/10">
        <div className="text-[11px] text-gray-400">
          Gesamt: {currentPeriods.length} Unterrichtsstunden konfiguriert
        </div>

        <Button type="submit" variant="primary" size="md" disabled={isSaving}>
          {isSaving ? 'Speichere Zeiten...' : 'Änderungen speichern'}
        </Button>
      </div>
    </form>
  );
};
