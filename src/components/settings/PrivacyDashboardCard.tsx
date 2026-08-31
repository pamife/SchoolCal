import React, { useState } from 'react';
import {
  ShieldCheck,
  Download,
  Trash2,
  Lock,
  FileText,
  Building2,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { exportGdprUserDataJson } from '../../services/export/dataExportService';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useHomeworkStore } from '../../store/useHomeworkStore';
import { useExamStore } from '../../store/useExamStore';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useGradeStore } from '../../store/useGradeStore';

interface PrivacyDashboardCardProps {
  onOpenPrivacyModal: () => void;
  onOpenImprintModal: () => void;
  onOpenTermsModal: () => void;
}

export const PrivacyDashboardCard: React.FC<PrivacyDashboardCardProps> = ({
  onOpenPrivacyModal,
  onOpenImprintModal,
  onOpenTermsModal,
}) => {
  const { user, deleteAccountAndData } = useAuthStore();
  const { settings } = useSettingsStore();
  const { subjects, teachers, rooms, scheduleEntries, substitutions } = useSchoolStore();
  const { homework } = useHomeworkStore();
  const { exams } = useExamStore();
  const { events } = useCalendarStore();
  const { grades } = useGradeStore();

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = () => {
    exportGdprUserDataJson({
      user,
      settings,
      subjects,
      teachers,
      rooms,
      scheduleEntries,
      substitutions,
      events,
      homework,
      exams,
      grades,
    });
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleExecuteDeletion = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccountAndData();
    } catch (err: any) {
      console.error('Deletion error:', err);
      setDeleteError(err.message || 'Fehler beim Löschen des Kontos.');
      setIsDeleting(false);
      setDeleteStep(0);
    }
  };

  return (
    <div className="ios-card p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Datenschutz & Privatsphäre
              </h3>
              <Badge variant="green" size="sm">DSGVO-konform</Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Vollständige Kontrolle über deine persönlichen Daten & Cloud-Speicher
            </p>
          </div>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>DSGVO-Datenexport (JSON) erfolgreich generiert und heruntergeladen!</span>
        </div>
      )}

      {deleteError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{deleteError}</span>
        </div>
      )}

      {/* 1. Account & Storage Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 space-y-1.5">
          <div className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-ios-blue" />
            <span>Konto-Identifikation</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            E-Mail: <span className="font-semibold text-gray-900 dark:text-white">{user?.email || '–'}</span>
          </div>
          <div className="text-[11px] text-gray-400 font-mono truncate">
            UID: {user?.uid || '–'}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 space-y-1.5">
          <div className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sicherheit & Übertragung</span>
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            ✓ Ende-zu-Ende TLS 1.3 verschlüsselt
          </div>
          <div className="text-[11px] text-gray-500">
            Keine Werbe-Tracker • Keine Cookies
          </div>
        </div>
      </div>

      {/* 2. Stored Data Inventory Breakdown */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-ios-blue" />
          <span>Gespeicherter Datenbestand ({user?.displayName || 'Dein Account'})</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary text-center">
            <div className="text-xs text-gray-500">Stundenplan</div>
            <div className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5">
              {scheduleEntries.length} Einträge
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary text-center">
            <div className="text-xs text-gray-500">Aufgaben</div>
            <div className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5">
              {homework.length} Einträge
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary text-center">
            <div className="text-xs text-gray-500">Klausuren</div>
            <div className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5">
              {exams.length} Einträge
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary text-center">
            <div className="text-xs text-gray-500">Noten & Fächer</div>
            <div className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5">
              {grades.length} Noten / {subjects.length} Fächer
            </div>
          </div>
        </div>
      </div>

      {/* 3. Export & Legal Navigation */}
      <div className="pt-1 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleExport}
          icon={<Download className="w-4 h-4" />}
        >
          Meine Daten exportieren (Art. 20 DSGVO JSON)
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onOpenPrivacyModal}
          icon={<FileText className="w-4 h-4" />}
        >
          Datenschutzerklärung
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onOpenImprintModal}
          icon={<Building2 className="w-4 h-4" />}
        >
          Impressum
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onOpenTermsModal}
          icon={<BookOpen className="w-4 h-4" />}
        >
          Nutzungsbedingungen
        </Button>
      </div>

      {/* 4. Complete Account Deletion Area (Art. 17 DSGVO) */}
      <div className="pt-4 border-t border-black/5 dark:border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
          <div>
            <h4 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4" />
              <span>Konto & alle Daten unwiderruflich löschen</span>
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-lg">
              Entfernt dein Firebase-Konto sowie alle Stundenpläne, Aufgaben, Noten, Klausuren und Einstellungen vollständig und unwiderruflich aus der Cloud (Art. 17 DSGVO).
            </p>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            onClick={() => setDeleteStep(1)}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Account löschen
          </Button>
        </div>

        {/* Step 1 Confirmation Modal / Box */}
        {deleteStep === 1 && (
          <div className="p-4 rounded-2xl bg-white dark:bg-ios-dark-secondary border-2 border-red-500 shadow-xl space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>⚠️ Möchtest du deinen Account wirklich endgültig löschen?</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Alle deine Stundenpläne, Noten, Termine und Lizenzbindungen werden dauerhaft vernichtet. Dieser Vorgang kann <strong>nicht</strong> rückgängig gemacht werden.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteStep(0)}
              >
                Abbrechen
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteStep(2)}
              >
                Ja, fortfahren
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 Final Confirmation Modal / Box */}
        {deleteStep === 2 && (
          <div className="p-4 rounded-2xl bg-red-600 text-white shadow-2xl space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 font-black text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />
              <span>LETZTE BESTÄTIGUNG: Jetzt alle Daten löschen?</span>
            </div>
            <p className="text-xs text-white/90">
              Klicke auf den roten Button, um dein Benutzerkonto und alle Subcollections jetzt sofort unwiderruflich zu bereinigen.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                disabled={isDeleting}
                onClick={() => setDeleteStep(0)}
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                Abbrechen
              </Button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleExecuteDeletion}
                className="px-4 py-2 bg-black/40 hover:bg-black/60 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 border border-white/30"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Lösche alle Cloud-Daten...</span>
                  </>
                ) : (
                  <span>Ja, ALLES endgültig löschen</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
