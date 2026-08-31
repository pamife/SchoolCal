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
  Sparkles,
  KeyRound,
  Shield,
  Crown,
  HelpCircle,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useHomeworkStore } from '../../store/useHomeworkStore';
import { useExamStore } from '../../store/useExamStore';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useSubscription } from '../../hooks/useSubscription';
import { GERMAN_STATES, getHolidaysForState } from '../../data/holidays';
import { ACCENT_PALETTES } from '../../utils/colorUtils';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { PeriodTimesModal } from '../school/PeriodTimesModal';
import { PricingModal } from '../licensing/PricingModal';
import { LicenseActivationModal } from '../licensing/LicenseActivationModal';
import { AdminModal } from '../admin/AdminModal';
import { HelpAndInstallModal } from '../help/HelpAndInstallModal';
import { PremiumBadge } from '../licensing/PremiumBadge';
import { WebUntisSyncTab } from '../school/WebUntisSyncTab';
import { NotificationSettingsTab } from './NotificationSettingsTab';
import { AiSettingsCard } from './AiSettingsCard';
import { PrivacyDashboardCard } from './PrivacyDashboardCard';
import { PrivacyPolicyModal } from '../legal/PrivacyPolicyModal';
import { ImprintModal } from '../legal/ImprintModal';
import { TermsModal } from '../legal/TermsModal';
import { exportFullJsonBackup, parseJsonBackup, exportScheduleCsv } from '../../services/export/dataExportService';
import { generateIcsCalendar, downloadIcsFile } from '../../services/ical/icalService';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { DEFAULT_PERIOD_TIMES } from '../../data/mockData';
import type { SchedulePeriodTime, ScheduleBreak } from '../../types';

export const SettingsScreen: React.FC = () => {
  const { user, logout, updateProfile, deleteAccountAndData } = useAuthStore();
  const { settings, setTheme, setAccentColor, setState, updateSettings } = useSettingsStore();
  const { subjects, teachers, rooms, scheduleEntries, substitutions, setScheduleEntries } = useSchoolStore();
  const { homework } = useHomeworkStore();
  const { exams } = useExamStore();
  const { events } = useCalendarStore();
  const { plan, isPlus, isPro, isAdmin, expiresAt, isLifetime, planSource, planInfo } = useSubscription();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [schoolName, setSchoolName] = useState(settings.schoolName || '');
  const [gradeLevel, setGradeLevel] = useState(settings.gradeLevel || '');
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modals
  const [isPeriodTimesOpen, setIsPeriodTimesOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isActivationOpen, setIsActivationOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isImprintModalOpen, setIsImprintModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [helpInitialTab, setHelpInitialTab] = useState<'install' | 'notifications' | 'schedule' | 'webuntis' | 'account' | 'privacy' | 'faq'>('install');

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
          Passe SchoolCal an deine Schule, deinen Zeitplan und deine Lizenz an
        </p>
      </div>

      {showSavedToast && (
        <div className="p-3 bg-green-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md">
          <Check className="w-4 h-4" />
          <span>Änderungen wurden erfolgreich gespeichert!</span>
        </div>
      )}

      {/* 1. ABONNEMENT & LIZENZ */}
      <div className="ios-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-ios-blue" />
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Tarif & Lizenz
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Dein aktueller Plan und Freischaltungen
              </p>
            </div>
          </div>

          <PremiumBadge plan={plan} size="md" />
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-black/5 dark:border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                SchoolCal {planInfo.name}
              </h4>
              {planSource === 'ADMIN' && (
                <Badge variant="purple" size="sm">Admin-Freischaltung</Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {planInfo.description}
            </p>

            <div className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-2">
              {isLifetime ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ Dauerhaft aktiv (Unbegrenzte Laufzeit)
                </span>
              ) : expiresAt ? (
                <span>
                  Gültig bis:{' '}
                  <strong>
                    {format(new Date(expiresAt), 'dd. MMMM yyyy', { locale: de })}
                  </strong>
                </span>
              ) : (
                <span>Kostenloser Standard-Account</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsPricingOpen(true)}
            >
              Tarife vergleichen
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsActivationOpen(true)}
              icon={<KeyRound className="w-3.5 h-3.5" />}
            >
              Code einlösen
            </Button>
          </div>
        </div>
      </div>

      {/* 2. ADMIN PANEL ACCESS (IF ADMIN) */}
      {isAdmin && (
        <div className="ios-card p-5 space-y-3 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Administrator-Bereich
                </h3>
                <p className="text-xs text-purple-600/80 dark:text-purple-400/80 font-medium">
                  Du bist als Administrator autorisiert
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsAdminModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
              icon={<Shield className="w-3.5 h-3.5" />}
            >
              Admin Panel öffnen
            </Button>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Verwalte Benutzer, erstelle neue Plus- und Pro-Lizenzcodes im Generator, prüfe Audit-Logs oder widerrufe Lizenzen.
          </p>
        </div>
      )}

      {/* 3. BENUTZERPROFIL & SCHULE */}
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

      {/* 4. ZEITPLAN & GLOCKENZEITEN */}
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

      {/* 5. BENACHRICHTIGUNGEN & NOTIFICATIONS */}
      <NotificationSettingsTab />

      {/* 6. 🤖 KI-SCHULASSISTENT & GEMINI API-KEY */}
      <AiSettingsCard />

      {/* 7. AUTOMATISCHE HAUSAUFGABEN-FRISTEN */}
      <div className="ios-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-ios-blue" />
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Automatische Hausaufgaben-Fristen
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Standardlogik für vorgeschlagene Fälligkeitsdaten beim Erstellen von Aufgaben
              </p>
            </div>
          </div>
          <Badge variant="blue" size="sm">Standard</Badge>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Standardregel für automatische Fristen
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'next_lesson', label: 'Nächster Unterricht', desc: 'Frist ist die direkt nächste Stunde dieses Fachs' },
              { id: 'second_next_lesson', label: 'Übernächster Unterricht', desc: 'Frist ist die übernächste Stunde dieses Fachs' },
              { id: 'custom', label: 'Benutzerdefiniert', desc: 'Frist wird bei jeder Aufgabe manuell bestimmt' },
            ].map((rule) => {
              const isSelected = (settings.autoDueDateRule || 'next_lesson') === rule.id;
              return (
                <button
                  key={rule.id}
                  type="button"
                  onClick={() => updateSettings({ autoDueDateRule: rule.id as any }, uid)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-blue-500/10 border-ios-blue text-ios-blue dark:bg-blue-500/20'
                      : 'bg-gray-50 dark:bg-ios-dark-secondary border-black/5 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-ios-dark-tertiary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{rule.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-ios-blue" />}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                    {rule.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Fachabhängige Regeln (optional) */}
          {subjects.length > 0 && (
            <div className="pt-2">
              <details className="text-xs group">
                <summary className="font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:text-ios-blue flex items-center gap-1.5 list-none">
                  <span className="group-open:rotate-90 transition-transform">▸</span>
                  <span>Fachspezifische Regeln anpassen ({subjects.length} Fächer)</span>
                </summary>
                <div className="mt-2.5 space-y-2 pl-3 border-l-2 border-ios-blue/30">
                  {subjects.map((sub) => {
                    const currentSubRule = settings.subjectDueDateRules?.[sub.id] || settings.autoDueDateRule || 'next_lesson';
                    return (
                      <div key={sub.id} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }} />
                          <span className="font-semibold text-gray-900 dark:text-white">{sub.name}</span>
                        </div>
                        <select
                          value={currentSubRule}
                          onChange={(e) => {
                            const newMap = { ...(settings.subjectDueDateRules || {}), [sub.id]: e.target.value as any };
                            updateSettings({ subjectDueDateRules: newMap }, uid);
                          }}
                          className="px-2 py-1 bg-white dark:bg-ios-dark-tertiary rounded-lg text-xs font-semibold text-gray-900 dark:text-white border border-black/5 focus:outline-none"
                        >
                          <option value="next_lesson">Nächste Stunde</option>
                          <option value="second_next_lesson">Übernächste Stunde</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>

      {/* 8. WEBUNTIS SYNCHRONISATION (PLUS) */}
      <WebUntisSyncTab
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenActivation={() => setIsActivationOpen(true)}
      />

      {/* 7. DARSTELLUNG & DESIGN */}
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

      {/* 6. BUNDESLAND & FERIEN */}
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

      {/* 7. DATEN, EXPORT & BACKUP */}
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

      {/* 8. HILFE & INSTALLATION */}
      <div className="ios-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-ios-blue" />
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Hilfe & Installation
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Installationsanleitungen für alle Geräte, Benachrichtigungen, WebUntis & FAQ
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              setHelpInitialTab('install');
              setIsHelpModalOpen(true);
            }}
          >
            Hilfezentrum öffnen
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => {
              setHelpInitialTab('install');
              setIsHelpModalOpen(true);
            }}
            className="p-3.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary hover:bg-gray-100 dark:hover:bg-ios-dark-tertiary transition-all text-left flex flex-col justify-between gap-1.5"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-ios-blue" />
              <span className="text-xs font-bold text-gray-900 dark:text-white">App installieren</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              iPhone, iPad, Android, Windows & Mac Anleitungen
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setHelpInitialTab('faq');
              setIsHelpModalOpen(true);
            }}
            className="p-3.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary hover:bg-gray-100 dark:hover:bg-ios-dark-tertiary transition-all text-left flex flex-col justify-between gap-1.5"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-gray-900 dark:text-white">Häufige Fragen (FAQ)</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Antworten zu Sync, Offline-Modus & App-Start
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setHelpInitialTab('privacy');
              setIsHelpModalOpen(true);
            }}
            className="p-3.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary hover:bg-gray-100 dark:hover:bg-ios-dark-tertiary transition-all text-left flex flex-col justify-between gap-1.5"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-gray-900 dark:text-white">Datenschutz</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Transparenz & Null Werbetracking
            </p>
          </button>
        </div>
      </div>

      {/* 9. DATENSCHUTZ & PRIVATSPHÄRE DASHBOARD */}
      <PrivacyDashboardCard
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onOpenImprintModal={() => setIsImprintModalOpen(true)}
        onOpenTermsModal={() => setIsTermsModalOpen(true)}
      />

      {/* Modals */}
      <HelpAndInstallModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        initialTab={helpInitialTab}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      <ImprintModal
        isOpen={isImprintModalOpen}
        onClose={() => setIsImprintModalOpen(false)}
      />

      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />

      <PeriodTimesModal
        isOpen={isPeriodTimesOpen}
        onClose={() => setIsPeriodTimesOpen(false)}
        periodTimes={periodTimes}
        breaks={breaks}
        onSave={handleSavePeriodTimes}
      />

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onOpenActivation={() => {
          setIsPricingOpen(false);
          setIsActivationOpen(true);
        }}
      />

      <LicenseActivationModal
        isOpen={isActivationOpen}
        onClose={() => setIsActivationOpen(false)}
      />

      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </div>
  );
};
