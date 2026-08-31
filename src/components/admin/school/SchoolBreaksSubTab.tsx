import React, { useState } from 'react';
import { Coffee, Plus, Trash2, CheckCircle2, Sparkles, LayoutGrid } from 'lucide-react';
import { Button } from '../../common/Button';
import { OFFICIAL_SCHERPF_BREAKS } from '../../../config/schoolConfig';
import type { ScheduleBreak, BreakDisplayMode, SchedulePeriodTime } from '../../../types';

interface SchoolBreaksSubTabProps {
  breaks: ScheduleBreak[];
  periods: SchedulePeriodTime[];
  displayMode: BreakDisplayMode;
  adminUid: string;
  adminEmail: string;
  onSave: (breaks: ScheduleBreak[], displayMode: BreakDisplayMode) => Promise<void>;
}

export const SchoolBreaksSubTab: React.FC<SchoolBreaksSubTabProps> = ({
  breaks: initialBreaks,
  periods,
  displayMode: initialDisplayMode,
  onSave,
}) => {
  const [breaks, setBreaks] = useState<ScheduleBreak[]>(
    initialBreaks.length > 0 ? initialBreaks : OFFICIAL_SCHERPF_BREAKS
  );
  const [displayMode, setDisplayMode] = useState<BreakDisplayMode>(
    initialDisplayMode || 'banner'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleBreakChange = (
    id: string,
    field: keyof ScheduleBreak,
    value: any
  ) => {
    setBreaks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const handleAddBreak = () => {
    const newBreak: ScheduleBreak = {
      id: `break_${Date.now()}`,
      name: 'Pause',
      afterPeriod: Math.min(2, periods.length),
      startTime: '09:05',
      endTime: '09:20',
    };
    setBreaks([...breaks, newBreak]);
  };

  const handleRemoveBreak = (id: string) => {
    setBreaks(breaks.filter((b) => b.id !== id));
  };

  const handleResetToOfficial = () => {
    if (
      window.confirm(
        'Möchtest du die Pausen auf die offiziellen Pausenzeiten des Gymnasiums (1. Hofpause 09:05–09:20, 2. Hofpause 10:55–11:10, Mittagspause 12:45–13:20) zurücksetzen?'
      )
    ) {
      setBreaks(OFFICIAL_SCHERPF_BREAKS);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(breaks, displayMode);
      setSuccessMessage('Pausenzeiten und Kalendereinstellungen erfolgreich gespeichert.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving breaks:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-black/5 dark:border-white/10">
        <div>
          <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Coffee className="w-3.5 h-3.5 text-amber-500" />
            <span>Zentrale Pausenzeiten & Mittagspause</span>
          </h4>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            Konfiguriere Hofpausen, Mittagspausen und deren Darstellung im Kalender.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetToOfficial}
          className="text-xs font-semibold text-ios-blue hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Offizielle Pausenzeiten laden</span>
        </button>
      </div>

      {/* Breaks List */}
      <div className="space-y-2">
        <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar pr-1">
          {breaks.map((b) => (
            <div
              key={b.id}
              className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={b.name}
                    onChange={(e) => handleBreakChange(b.id, 'name', e.target.value)}
                    placeholder="z.B. 1. Hofpause oder Mittagspause"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-ios-dark-card border border-gray-200 dark:border-white/10 rounded-lg text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-ios-blue"
                  />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="text-[11px] font-semibold">nach</span>
                    <select
                      value={b.afterPeriod}
                      onChange={(e) =>
                        handleBreakChange(b.id, 'afterPeriod', Number(e.target.value))
                      }
                      className="px-2 py-1 bg-white dark:bg-ios-dark-card border border-gray-200 dark:border-white/10 rounded-lg text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-ios-blue"
                    >
                      {periods.map((p) => (
                        <option key={p.period} value={p.period}>
                          {p.period}. Std ({p.endTime})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <input
                      type="time"
                      required
                      value={b.startTime}
                      onChange={(e) =>
                        handleBreakChange(b.id, 'startTime', e.target.value)
                      }
                      className="w-20 px-2 py-1 bg-white dark:bg-ios-dark-card border border-gray-200 dark:border-white/10 rounded-lg text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-ios-blue"
                    />
                    <span className="text-xs text-gray-400">–</span>
                    <input
                      type="time"
                      required
                      value={b.endTime}
                      onChange={(e) => handleBreakChange(b.id, 'endTime', e.target.value)}
                      className="w-20 px-2 py-1 bg-white dark:bg-ios-dark-card border border-gray-200 dark:border-white/10 rounded-lg text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-ios-blue"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveBreak(b.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Pause löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAddBreak}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          + Pause hinzufügen
        </Button>
      </div>

      {/* Calendar Break Display Mode Setting (Requirement 20) */}
      <div className="pt-3 border-t border-black/5 dark:border-white/10 space-y-2">
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <LayoutGrid className="w-3.5 h-3.5 text-ios-blue" />
          <span>Darstellung im Kalender (Zentrale Einstellung)</span>
        </label>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Wähle, wie Pausen in den Kalender- und Stundenplanansichten für alle Schüler dargestellt werden sollen:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            {
              id: 'hidden',
              label: 'Als freie Zeit',
              desc: 'Pausen werden nicht gesondert markiert',
            },
            {
              id: 'banner',
              label: 'Pausen-Trennlinie (Empfohlen)',
              desc: 'Kompakte Trennlinie mit Name und Dauer zwischen Blöcken',
            },
            {
              id: 'block',
              label: 'Eigener Kalenderblock',
              desc: 'Voller Kalenderblock wie eine reguläre Unterrichtsstunde',
            },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setDisplayMode(mode.id as BreakDisplayMode)}
              className={`p-3 rounded-xl text-left border transition-all ${
                displayMode === mode.id
                  ? 'bg-ios-blue/10 border-ios-blue text-gray-900 dark:text-white shadow-xs ring-1 ring-ios-blue'
                  : 'bg-gray-50 dark:bg-ios-dark-secondary border-black/5 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              <div className="text-xs font-bold">{mode.label}</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                {mode.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/10">
        <div className="text-[11px] text-gray-400">
          Gesamt: {breaks.length} Pausen konfiguriert
        </div>

        <Button type="submit" variant="primary" size="md" disabled={isSaving}>
          {isSaving ? 'Speichere Pausen...' : 'Pausen speichern'}
        </Button>
      </div>
    </form>
  );
};
