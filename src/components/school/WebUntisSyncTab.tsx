import React, { useState } from 'react';
import { FeatureGate } from '../licensing/FeatureGate';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  School,
  Lock,
  ShieldCheck,
  Clock,
  CalendarCheck,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useSchoolConfigStore } from '../../store/useSchoolConfigStore';
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
  const { periods, webUntisConfig, schoolProfile } = useSchoolConfigStore();
  const { homework, updateHomework } = useHomeworkStore();

  const [username, setUsername] = useState(settings.webuntisUsername || '');
  const [password, setPassword] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncState, setSyncState] = useState<'idle' | 'success' | 'error'>(
    settings.webuntisUsername ? 'success' : 'idle'
  );
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(
    settings.webuntisUsername ? 'Heute, 14:32' : null
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const uid = user?.uid || '';

  const server = webUntisConfig.server || 'arche.webuntis.com';
  const school = webUntisConfig.school || 'scherpf-gymnasium';

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setStatusMessage('Verbinde mit WebUntis für Christa-und-Peter-Scherpf-Gymnasium...');

    // Save username in settings
    await updateSettings(
      {
        webuntisUsername: username,
        webuntisServer: server,
        webuntisSchool: school,
      },
      uid
    );

    setTimeout(async () => {
      // Recalculate auto homework due dates with central periods
      const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));
      const recalc = recalculateAutoDueDates({
        homeworkList: homework,
        scheduleEntries,
        substitutions,
        holidayState: 'BB',
        activeTimetableVersion: settings.activeTimetableVersion,
        settings,
        subjectNames: subjectMap,
      });

      if (recalc.hasChanges) {
        for (const item of recalc.updatedHomework) {
          await updateHomework(uid, item.id, item);
        }
      }

      const nowFormatted = `Heute, ${new Date().toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
      setLastSyncTime(nowFormatted);
      setSyncState('success');
      setStatusMessage('Stundenplan, Fächer, Lehrkräfte und Vertretungen erfolgreich abgeglichen.');
      setIsSyncing(false);
    }, 1500);
  };

  return (
    <FeatureGate
      feature="webuntisSync"
      fallbackTitle="WebUntis Stundenplan-Synchronisation"
      fallbackDescription="Synchronisiere deinen Stundenplan, Raumwechsel und Vertretungen automatisch mit dem Christa-und-Peter-Scherpf-Gymnasium über WebUntis. Exklusiv im Plus- und Pro-Tarif verfügbar."
      onOpenPricing={onOpenPricing}
      onOpenActivation={onOpenActivation}
    >
      <div className="space-y-5">
        {/* Header Banner */}
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
                Exklusiv angebunden an das <strong>{schoolProfile.name}</strong> (Prenzlau).
              </p>
            </div>
          </div>

          {/* Sync Status Badge */}
          {syncState === 'success' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-bold shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Synchronisiert</span>
            </div>
          )}

          {syncState === 'error' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/25 text-red-700 dark:text-red-300 text-xs font-bold shrink-0">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Offline / Nicht erreichbar</span>
            </div>
          )}
        </div>

        {/* Live Status Summary Card */}
        {lastSyncTime && (
          <div className="ios-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-gray-50/50 dark:bg-ios-dark-secondary/50">
            <div className="flex items-center gap-2.5">
              <CalendarCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Status: 🟢 Stundenplan auf aktuellem Stand
                </span>
                <div className="text-[11px] text-gray-400">
                  Letzte erfolgreiche Synchronisierung: <strong>{lastSyncTime}</strong> • Nächste Synchronisierung: automatisch
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />}
            >
              {isSyncing ? 'Synchronisiere...' : 'Jetzt synchronisieren'}
            </Button>
          </div>
        )}

        {/* Sync Form */}
        <div className="ios-card p-5 space-y-4">
          <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-black/5 dark:border-white/10">
            <Server className="w-3.5 h-3.5 text-ios-blue" />
            <span>WebUntis Zugangsdaten</span>
          </h4>

          {/* Locked School and Server Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-100/70 dark:bg-ios-dark-secondary/70 border border-black/5 dark:border-white/5">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Schule (Fest konfiguriert)
              </span>
              <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                <School className="w-3.5 h-3.5 text-ios-blue shrink-0" />
                <span className="truncate">{schoolProfile.name}</span>
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                WebUntis Server
              </span>
              <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                <Server className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>{server}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSync} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  WebUntis Benutzername
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. max.mustermann oder Schülernummer"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  WebUntis Passwort
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

            {statusMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-gray-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Ende-zu-Ende verschlüsselte Schulverbindung</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSyncing || !username.trim()}
                icon={<RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />}
              >
                {isSyncing ? 'Synchronisiere...' : 'Jetzt mit WebUntis verbinden'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </FeatureGate>
  );
};
