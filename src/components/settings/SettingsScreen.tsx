import React, { useState, useRef } from 'react';
import {
  User,
  Palette,
  Sun,
  Moon,
  Smartphone,
  MapPin,
  Download,
  Upload,
  Trash2,
  Check,
  ShieldCheck,
  Calendar,
  FileSpreadsheet,
  LogOut,
  Clock,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useHomeworkStore } from '../../store/useHomeworkStore';
import { useExamStore } from '../../store/useExamStore';
import { useCalendarStore } from '../../store/useCalendarStore';
import { GERMAN_STATES, getHolidaysForState } from '../../data/holidays';
import { ACCENT_PALETTES } from '../../utils/colorUtils';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { PeriodTimesModal } from '../school/PeriodTimesModal';
import { exportFullJsonBackup, parseJsonBackup, exportScheduleCsv } from '../../services/export/dataExportService';
import { generateIcsCalendar, downloadIcsFile } from '../../services/ical/icalService';
import { format } from 'date-fns';
import { DEFAULT_PERIOD_TIMES } from '../../data/mockData';
import type { SchedulePeriodTime, ScheduleBreak } from '../../types';

export const SettingsScreen: React.FC = () => {
  const { user, logout, updateProfile, deleteAccountAndData } = useAuthStore();
  const { settings, setTheme, setAccentColor, setState, updateSettings } = useSettingsStore();
  const { subjects, teachers, rooms, scheduleEntries, substitutions, setScheduleEntries } = useSchoolStore();
  const { homework } = useHomeworkStore();
  const { exams } = useExamStore();
  const { events } = useCalendarStore();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [schoolName, setSchoolName] = useState(settings.schoolName || '');
  const [gradeLevel, setGradeLevel] = useState(settings.gradeLevel || '');
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPeriodTimesOpen, setIsPeriodTimesOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uid = user?.uid || '';

  const periodTimes: SchedulePeriodTime[] =
    settings.periodTimes && settings.periodTimes.length > 0
      ? settings.periodTimes
      : DEFAULT_PERIOD_TIMES;

  const breaks: ScheduleBreak[] = settings.breaks || [];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ displayName });
    await updateSettings({ schoolName, gradeLevel }, uid);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  const handleSavePeriodTimes = async (
    newPeriods: SchedulePeriodTime[],
    newBreaks: ScheduleBreak[]
  ) => {
    await updateSettings({ periodTimes: newPeriods, breaks: newBreaks }, uid);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  const handleJsonBackup = () => {
    exportFullJsonBackup({
      userSettings: settings,
      subjects,
      teachers,
      rooms,
      scheduleEntries,
      substitutions,
      events,
      homework,
      exams,
    });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const backup = parseJsonBackup(text);
        
        if (backup.userSettings) await updateSettings(backup.userSettings, uid);
        if (backup.scheduleEntries) await setScheduleEntries(uid, backup.scheduleEntries);

        alert('Backup erfolgreich wiederhergestellt!');
        window.location.reload();
      } catch (err: any) {
        alert('Fehler beim Importieren der Datei: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAll = async () => {
    if (window.confirm('ACHTUNG: Möchtest du deinen Account und ALLE deine Daten unwiderruflich löschen?')) {
      if (window.confirm('Bist du wirklich sicher? Diese Aktion kann nicht rückgängig gemacht werden.')) {
        setIsDeleting(true);
        await deleteAccountAndData();
      }
    }
  };

  const stateHolidays = getHolidaysForState(settings.state);

  return (
    <div className="space-y-6 pb-28 ipad:pb-12 max-w-4xl mx-auto px-1">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Einstellungen
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Passe SchoolCal an deine Schule, deinen Zeitplan und dein Bundesland an
        </p>
      </div>

      {showSavedToast && (
        <div className="p-3 bg-green-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md">
          <Check className="w-4 h-4" />
          <span>Änderungen wurden erfolgreich gespeichert!</span>
        </div>
      )}

      {/* 1. BENUTZERPROFIL & SCHULE */}
      <div className="ios-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-ios-blue" />
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Schülerprofil
              </h3>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            icon={<LogOut className="w-4 h-4" />}
            className="text-gray-500 hover:text-red-500"
          >
            Abmelden
          </Button>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Dein Name
              </label>
              <input
                type="text"
                placeholder="Dein Vor- und Nachname"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Schulname
              </label>
              <input
                type="text"
                placeholder="z.B. Goethe-Gymnasium"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Klasse / Kurs
              </label>
              <input
                type="text"
                placeholder="z.B. Klasse 10b"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="sm">
              Profil speichern
            </Button>
          </div>
        </form>
      </div>

      {/* 2. ZEITPLAN & GLOCKENZEITEN */}
      <div className="ios-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-ios-blue" />
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Glockenzeiten & Pausen (Zeitplan)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Definiere die zentralen Stunden- und Pausenzeiten deiner Schule
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsPeriodTimesOpen(true)}
          >
            Zeitplan anpassen
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {periodTimes.slice(0, 8).map((p) => (
            <div
              key={p.period}
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary text-center"
            >
              <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {p.period}. Stunde
              </div>
              <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                {p.startTime} – {p.endTime}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. DARSTELLUNG & DESIGN */}
      <div className="ios-card p-5 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-black/5 dark:border-white/10">
          <Palette className="w-5 h-5 text-purple-500" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Darstellung & Farbschema
          </h3>
        </div>

        {/* Theme Mode Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Erscheinungsbild
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'light', label: 'Hell', icon: Sun },
              { id: 'dark', label: 'Dunkel', icon: Moon },
              { id: 'system', label: 'Automatisch', icon: Smartphone },
            ].map((th) => {
              const Icon = th.icon;
              const isSelected = settings.theme === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setTheme(th.id as any, uid)}
                  className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 font-semibold text-xs transition-all ${
                    isSelected
                      ? 'bg-ios-blue text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-ios-dark-secondary text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{th.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent Color Palette */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Apple Akzentfarbe
          </label>
          <div className="flex flex-wrap gap-2.5">
            {ACCENT_PALETTES.map((palette) => (
              <button
                key={palette.color}
                type="button"
                onClick={() => setAccentColor(palette.color, uid)}
                style={{ backgroundColor: palette.color }}
                className={`w-9 h-9 rounded-full transition-transform flex items-center justify-center text-white ${
                  settings.accentColor === palette.color
                    ? 'scale-115 ring-3 ring-offset-2 ring-ios-blue shadow-md'
                    : 'opacity-85 hover:opacity-100 hover:scale-105'
                }`}
                title={palette.name}
              >
                {settings.accentColor === palette.color && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. BUNDESLAND & FERIEN */}
      <div className="ios-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Bundesland & Ferienkalender
            </h3>
          </div>
          <Badge variant="green" size="sm">
            2026 / 2027
          </Badge>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Bundesland für automatische Schulferien & Feiertage
          </label>
          <select
            value={settings.state}
            onChange={(e) => setState(e.target.value, uid)}
            className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue"
          >
            {GERMAN_STATES.map((st) => (
              <option key={st.code} value={st.code}>
                {st.name} ({st.code})
              </option>
            ))}
          </select>
        </div>

        {/* Holidays list snippet */}
        <div className="space-y-1.5 pt-1">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Kommende Ferien & Feiertage in {GERMAN_STATES.find(s => s.code === settings.state)?.name}:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar">
            {stateHolidays.map((hol) => (
              <div
                key={hol.id}
                className="p-2.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary flex items-center justify-between text-xs"
              >
                <div className="font-semibold text-gray-900 dark:text-white truncate">
                  {hol.name}
                </div>
                <div className="text-[11px] text-gray-500 shrink-0">
                  {hol.startDate === hol.endDate ? hol.startDate : `${hol.startDate} – ${hol.endDate}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. DATEN, EXPORT & BACKUP */}
      <div className="ios-card p-5 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-black/5 dark:border-white/10">
          <Download className="w-5 h-5 text-indigo-500" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Datenexport, Backup & Apple Kalender
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Apple Calendar (.ics) */}
          <button
            type="button"
            onClick={() => {
              const ics = generateIcsCalendar({
                events,
                exams,
                homework,
                subjects,
                scheduleEntries,
                teachers,
                rooms,
              });
              downloadIcsFile(ics, `SchoolCal_Export_${format(new Date(), 'yyyy-MM-dd')}.ics`);
            }}
            className="p-3.5 rounded-xl bg-gray-100 dark:bg-ios-dark-secondary hover:bg-gray-200 dark:hover:bg-ios-dark-tertiary transition-all text-left flex flex-col justify-between gap-2"
          >
            <Calendar className="w-5 h-5 text-ios-blue" />
            <div>
              <div className="text-xs font-bold text-gray-900 dark:text-white">Apple Kalender (.ics)</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Kompatibel mit iOS Kalender</div>
            </div>
          </button>

          {/* JSON Full Backup */}
          <button
            type="button"
            onClick={handleJsonBackup}
            className="p-3.5 rounded-xl bg-gray-100 dark:bg-ios-dark-secondary hover:bg-gray-200 dark:hover:bg-ios-dark-tertiary transition-all text-left flex flex-col justify-between gap-2"
          >
            <Download className="w-5 h-5 text-indigo-500" />
            <div>
              <div className="text-xs font-bold text-gray-900 dark:text-white">JSON Komplett-Backup</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Alle Daten sichern</div>
            </div>
          </button>

          {/* CSV Timetable */}
          <button
            type="button"
            onClick={() => exportScheduleCsv(scheduleEntries, subjects, teachers, rooms)}
            className="p-3.5 rounded-xl bg-gray-100 dark:bg-ios-dark-secondary hover:bg-gray-200 dark:hover:bg-ios-dark-tertiary transition-all text-left flex flex-col justify-between gap-2"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
            <div>
              <div className="text-xs font-bold text-gray-900 dark:text-white">Stundenplan (.csv)</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Excel / Numbers Tabelle</div>
            </div>
          </button>
        </div>

        {/* JSON Import button */}
        <div className="pt-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            icon={<Upload className="w-4 h-4" />}
          >
            JSON Backup-Datei wiederherstellen (Importieren)
          </Button>
        </div>
      </div>

      {/* 6. ACCOUNT LÖSCHEN */}
      <div className="ios-card p-5 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-black/5 dark:border-white/10">
          <ShieldCheck className="w-5 h-5 text-gray-500" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Datenschutz & Account-Verwaltung
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-red-600 dark:text-red-400">
              Account & alle Cloud-Daten löschen
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Entfernt unwiderruflich dein Benutzerkonto und alle in Firestore gespeicherten Daten.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            onClick={handleDeleteAll}
            icon={<Trash2 className="w-4 h-4" />}
          >
            {isDeleting ? 'Wird gelöscht...' : 'Account & Daten löschen'}
          </Button>
        </div>
      </div>

      {/* PeriodTimesModal */}
      <PeriodTimesModal
        isOpen={isPeriodTimesOpen}
        onClose={() => setIsPeriodTimesOpen(false)}
        periodTimes={periodTimes}
        breaks={breaks}
        onSave={handleSavePeriodTimes}
      />
    </div>
  );
};
