import React, { useState } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { Button } from '../common/Button';
import { Clock, Plus, Trash2, Coffee, Sparkles } from 'lucide-react';
import type { SchedulePeriodTime, ScheduleBreak } from '../../types';
import { DEFAULT_PERIOD_TIMES, DEFAULT_BREAKS } from '../../data/mockData';

interface PeriodTimesModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodTimes: SchedulePeriodTime[];
  breaks?: ScheduleBreak[];
  onSave: (periodTimes: SchedulePeriodTime[], breaks: ScheduleBreak[]) => void;
}

export const PeriodTimesModal: React.FC<PeriodTimesModalProps> = ({
  isOpen,
  onClose,
  periodTimes,
  breaks = [],
  onSave,
}) => {
  const [periods, setPeriods] = useState<SchedulePeriodTime[]>(
    periodTimes.length > 0 ? periodTimes : DEFAULT_PERIOD_TIMES
  );
  const [breakList, setBreakList] = useState<ScheduleBreak[]>(
    breaks.length > 0 ? breaks : DEFAULT_BREAKS
  );

  React.useEffect(() => {
    if (isOpen) {
      setPeriods(periodTimes.length > 0 ? periodTimes : DEFAULT_PERIOD_TIMES);
      setBreakList(breaks && breaks.length > 0 ? breaks : DEFAULT_BREAKS);
    }
  }, [isOpen, periodTimes, breaks]);

  const handlePeriodTimeChange = (
    index: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const updated = [...periods];
    updated[index] = { ...updated[index], [field]: value };
    setPeriods(updated);
  };

  const handleAddPeriod = () => {
    const nextPeriodNum = periods.length + 1;
    const lastPeriod = periods[periods.length - 1];
    let newStart = '15:45';
    let newEnd = '16:30';

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

    setPeriods([
      ...periods,
      { period: nextPeriodNum, startTime: newStart, endTime: newEnd, label: `${nextPeriodNum}. Stunde` },
    ]);
  };

  const handleRemovePeriod = (periodNum: number) => {
    if (periods.length <= 1) return;
    const filtered = periods
      .filter(p => p.period !== periodNum)
      .map((p, idx) => ({ ...p, period: idx + 1, label: `${idx + 1}. Stunde` }));
    setPeriods(filtered);
    // Also remove breaks referencing deleted period
    setBreakList(breakList.filter(b => b.afterPeriod < filtered.length));
  };

  // Breaks handling
  const handleBreakChange = (
    id: string,
    field: keyof ScheduleBreak,
    value: any
  ) => {
    setBreakList(prev =>
      prev.map(b => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const handleAddBreak = () => {
    const newBreak: ScheduleBreak = {
      id: `break-${Date.now()}`,
      name: 'Pause',
      afterPeriod: Math.min(2, periods.length),
      startTime: '09:35',
      endTime: '09:55',
    };
    setBreakList([...breakList, newBreak]);
  };

  const handleRemoveBreak = (id: string) => {
    setBreakList(breakList.filter(b => b.id !== id));
  };

  const handleResetDefault = () => {
    setPeriods(DEFAULT_PERIOD_TIMES);
    setBreakList(DEFAULT_BREAKS);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(periods, breakList);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Glockenzeiten & Pausen (Zeitplan)"
    >
      <form onSubmit={handleSave} className="space-y-5">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Lege hier die zentralen Uhrzeiten für deine Schulstunden und Pausen fest. Im Stundenplan werden alle Zeiten automatisch übernommen.
        </p>

        {/* 1. Schulstunden Zeiten */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-ios-blue" />
              <span>Schulstunden ({periods.length} Stunden)</span>
            </h4>

            <button
              type="button"
              onClick={handleResetDefault}
              className="text-[11px] font-semibold text-ios-blue hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Standardzeiten
            </button>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar pr-1">
            {periods.map((p, index) => {
              const matchingBreaks = breakList.filter(b => b.afterPeriod === p.period);

              return (
                <React.Fragment key={p.period}>
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary flex items-center justify-between gap-2 border border-black/5 dark:border-white/5">
                    <span className="w-20 text-xs font-bold text-gray-800 dark:text-gray-200 shrink-0">
                      {p.period}. Stunde
                    </span>

                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <input
                        type="time"
                        value={p.startTime}
                        onChange={(e) => handlePeriodTimeChange(index, 'startTime', e.target.value)}
                        className="px-2 py-1 bg-white dark:bg-ios-dark-card rounded-lg text-xs font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-white/10"
                      />
                      <span className="text-xs text-gray-400">–</span>
                      <input
                        type="time"
                        value={p.endTime}
                        onChange={(e) => handlePeriodTimeChange(index, 'endTime', e.target.value)}
                        className="px-2 py-1 bg-white dark:bg-ios-dark-card rounded-lg text-xs font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-white/10"
                      />
                    </div>

                    {periods.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePeriod(p.period)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-lg"
                        title="Stunde entfernen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Render break banner right after its period */}
                  {matchingBreaks.map((b) => (
                    <div
                      key={b.id}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-medium ml-4"
                    >
                      <div className="flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5" />
                        <span>{b.name} ({b.startTime} – {b.endTime})</span>
                      </div>
                      <span className="text-[10px] text-amber-600/70">nach {p.period}. Std</span>
                    </div>
                  ))}
                </React.Fragment>
              );
            })}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddPeriod}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Weitere Stunde hinzufügen
          </Button>
        </div>

        {/* 2. Pausen Konfiguration */}
        <div className="space-y-2.5 pt-2 border-t border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-amber-500" />
              <span>Pausen ({breakList.length})</span>
            </h4>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddBreak}
              icon={<Plus className="w-3.5 h-3.5" />}
              className="text-ios-blue text-xs p-1"
            >
              Pause hinzufügen
            </Button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
            {breakList.map((b) => (
              <div
                key={b.id}
                className="p-2.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary flex items-center justify-between gap-2 border border-black/5 dark:border-white/5"
              >
                <input
                  type="text"
                  value={b.name}
                  onChange={(e) => handleBreakChange(b.id, 'name', e.target.value)}
                  placeholder="Pausenname"
                  className="w-24 sm:w-32 px-2 py-1 bg-white dark:bg-ios-dark-card rounded-lg text-xs font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-white/10"
                />

                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>nach</span>
                  <select
                    value={b.afterPeriod}
                    onChange={(e) => handleBreakChange(b.id, 'afterPeriod', Number(e.target.value))}
                    className="px-2 py-1 bg-white dark:bg-ios-dark-card rounded-lg text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-white/10"
                  >
                    {periods.map(p => (
                      <option key={p.period} value={p.period}>
                        {p.period}. Std
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <input
                    type="time"
                    value={b.startTime}
                    onChange={(e) => handleBreakChange(b.id, 'startTime', e.target.value)}
                    className="px-1.5 py-1 bg-white dark:bg-ios-dark-card rounded-lg text-xs font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-white/10"
                  />
                  <span className="text-gray-400">–</span>
                  <input
                    type="time"
                    value={b.endTime}
                    onChange={(e) => handleBreakChange(b.id, 'endTime', e.target.value)}
                    className="px-1.5 py-1 bg-white dark:bg-ios-dark-card rounded-lg text-xs font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-white/10"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveBreak(b.id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="pt-3 pb-8 sm:pb-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" variant="primary" size="md">
            Zeitplan speichern
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
