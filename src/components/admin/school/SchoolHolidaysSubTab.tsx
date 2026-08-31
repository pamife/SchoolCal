import React, { useState } from 'react';
import { Calendar, Plus, Trash2, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { getHolidaysForState } from '../../../data/holidays';
import type { Holiday } from '../../../types';

interface SchoolHolidaysSubTabProps {
  schoolHolidays: Holiday[];
  adminUid: string;
  adminEmail: string;
  onAddHoliday: (holiday: Holiday) => Promise<void>;
  onDeleteHoliday: (holidayId: string) => Promise<void>;
}

export const SchoolHolidaysSubTab: React.FC<SchoolHolidaysSubTabProps> = ({
  schoolHolidays,
  onAddHoliday,
  onDeleteHoliday,
}) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState<'vacation' | 'public_holiday' | 'school_free'>('school_free');
  const [isAdding, setIsAdding] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const bbHolidays = getHolidaysForState('BB');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate) return;

    setIsAdding(true);
    try {
      const newHoliday: Holiday = {
        id: `hol_custom_${Date.now()}`,
        name: name.trim(),
        startDate,
        endDate: endDate || startDate,
        type,
        state: 'BB',
      };
      await onAddHoliday(newHoliday);
      setName('');
      setStartDate('');
      setEndDate('');
      setActionMessage('Schulfreier Tag erfolgreich hinzugefügt.');
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error('Error adding school holiday:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Möchtest du diesen schulfreien Tag wirklich entfernen?')) {
      try {
        await onDeleteHoliday(id);
        setActionMessage('Eintrag entfernt.');
        setTimeout(() => setActionMessage(null), 3000);
      } catch (err) {
        console.error('Error deleting holiday:', err);
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="pb-2 border-b border-black/5 dark:border-white/10">
        <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-ios-blue" />
          <span>Ferien, Feiertage & Bewegliche Ferientage</span>
        </h4>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
          Landesweite Schulferien in Brandenburg sowie schulinterne Termine des Scherpf-Gymnasiums.
        </p>
      </div>

      {/* Add Custom Holiday Form */}
      <form
        onSubmit={handleAdd}
        className="p-3.5 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 space-y-3"
      >
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-ios-blue" />
          <h5 className="text-xs font-bold text-gray-900 dark:text-white">
            Schulinternen Ferientag / Sondertermin anlegen
          </h5>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Bezeichnung
            </label>
            <input
              type="text"
              required
              placeholder="z.B. Beweglicher Ferientag / Ausgleichstag"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-ios-dark-card border border-gray-200 dark:border-white/10 rounded-lg text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-ios-blue"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Typ
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-ios-dark-card border border-gray-200 dark:border-white/10 rounded-lg text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-ios-blue"
            >
              <option value="school_free">Schulfreier Tag</option>
              <option value="vacation">Ferien / Brückentag</option>
              <option value="public_holiday">Feiertag</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Startdatum
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2 py-1.5 bg-white dark:bg-ios-dark-card border border-gray-200 dark:border-white/10 rounded-lg text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-ios-blue"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400">Enddatum (optional falls mehrtägig):</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 bg-white dark:bg-ios-dark-card border border-gray-200 dark:border-white/10 rounded-lg text-xs font-semibold text-gray-900 dark:text-white"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isAdding || !name.trim() || !startDate}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            {isAdding ? 'Füge hinzu...' : 'Termin speichern'}
          </Button>
        </div>
      </form>

      {actionMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Custom School Holidays List */}
      {schoolHolidays.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Schuleigene freie Tage ({schoolHolidays.length})
          </h5>
          <div className="space-y-1.5">
            {schoolHolidays.map((sh) => (
              <div
                key={sh.id}
                className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{sh.name}</span>
                    <Badge variant="purple" size="sm">
                      {sh.type === 'school_free'
                        ? 'Schulfrei'
                        : sh.type === 'vacation'
                        ? 'Ferien'
                        : 'Feiertag'}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {sh.startDate} {sh.endDate && sh.endDate !== sh.startDate ? `bis ${sh.endDate}` : ''}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(sh.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Eintrag löschen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official Brandenburg Holidays Database */}
      <div className="space-y-2">
        <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <span>Offizielle Schulferien Brandenburg 2026/2027</span>
          <Badge variant="blue" size="sm">BB</Badge>
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto no-scrollbar pr-1">
          {bbHolidays.map((h) => (
            <div
              key={h.id}
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-bold text-gray-900 dark:text-white">
                  {h.name}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {h.startDate} {h.endDate && h.endDate !== h.startDate ? `– ${h.endDate}` : ''}
                </div>
              </div>
              <Badge variant={h.type === 'vacation' ? 'blue' : 'amber'} size="sm">
                {h.type === 'vacation' ? 'Ferien' : 'Feiertag'}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
