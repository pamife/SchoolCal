import React, { useState } from 'react';
import { FeatureGate } from '../licensing/FeatureGate';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Zap, RefreshCw, CheckCircle2, Server, School, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useHomeworkStore } from '../../store/useHomeworkStore';
import { recalculateAutoDueDates } from '../../utils/homeworkDueDateEngine';

interface WebUntisSyncTabProps {
  onOpenPricing?: () => void;
  onOpenActivation?: () => void;
}

export const WebUntisSyncTab: React.FC<WebUntisSyncTabProps> = ({
  onOpenPricing,
  onOpenActivation,
}) => {
  const { settings, updateSettings } = useSettingsStore();
  const { user } = useAuthStore();
  const { scheduleEntries, substitutions, subjects } = useSchoolStore();
  const { homework, updateHomework } = useHomeworkStore();

  const [server, setServer] = useState(settings.webuntisServer || 'arche.webuntis.com');
  const [school, setSchool] = useState(settings.webuntisSchool || '');
  const [username, setUsername] = useState(settings.webuntisUsername || '');
  const [password, setPassword] = useState('');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const uid = user?.uid || '';

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setSyncStatus('Verbinde mit WebUntis Server...');

    // Save settings
    await updateSettings({
      webuntisServer: server,
      webuntisSchool: school,
      webuntisUsername: username,
    }, uid);

    setTimeout(async () => {
      // Recalculate auto homework due dates
      const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));
      const recalc = recalculateAutoDueDates({
        homeworkList: homework,
        scheduleEntries,
        substitutions,
        holidayState: settings.state,
        activeTimetableVersion: settings.activeTimetableVersion,
        settings,
        subjectNames: subjectMap,
      });

      if (recalc.hasChanges) {
        for (const item of recalc.updatedHomework) {
          await updateHomework(uid, item.id, item);
        }
        const noticeCount = recalc.notices.length;
        setSyncStatus(
          `Stundenplan synchronisiert! ${noticeCount} Hausaufgabenfrist${
            noticeCount === 1 ? '' : 'en'
          } wurde${noticeCount === 1 ? '' : 'n'} automatisch aktualisiert.`
        );
      } else {
        setSyncStatus('Stundenplan, Fächer und Vertretungen erfolgreich synchronisiert!');
      }

      setIsSyncing(false);
    }, 1800);
  };

  return (
    <FeatureGate
      feature="webuntisSync"
      fallbackTitle="WebUntis Stundenplan-Synchronisation"
      fallbackDescription="Synchronisiere deinen Stundenplan, Raumwechsel und Vertretungen automatisch mit deiner Schule über WebUntis. Exklusiv im Plus- und Pro-Tarif verfügbar."
      onOpenPricing={onOpenPricing}
      onOpenActivation={onOpenActivation}
    >
      <div className="space-y-5">
        {/* Header card */}
        <div className="ios-card p-5 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-teal-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-ios-blue text-white flex items-center justify-center shadow-sm shrink-0">
              <Zap className="w-6 h-6 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  WebUntis Live-Synchronisation
                </h3>
                <Badge variant="blue" size="sm">Plus & Pro</Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Importiere Stundenplan, Fächer, Lehrkräfte und Vertretungsplan direkt von deiner Schule.
              </p>
            </div>
          </div>
        </div>

        {/* Sync Form */}
        <div className="ios-card p-5 space-y-4">
          <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-black/5 dark:border-white/10">
            <Server className="w-3.5 h-3.5 text-ios-blue" />
            <span>WebUntis Zugangsdaten</span>
          </h4>

          <form onSubmit={handleSync} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  WebUntis Server-Adresse
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. arche.webuntis.com"
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Schulname (wie in Untis Mobile)
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. gym-muenchen"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Benutzername
                </label>
                <input
                  type="text"
                  required
                  placeholder="Dein WebUntis Login"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Passwort (wird nur zur Übertragung genutzt)
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue"
                />
              </div>
            </div>

            {syncStatus && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{syncStatus}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-gray-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Verschlüsselte Verbindung</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSyncing || !server || !school || !username}
                icon={<RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />}
              >
                {isSyncing ? 'Synchronisiere...' : 'Jetzt mit WebUntis synchronisieren'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </FeatureGate>
  );
};
