import React, { useState } from 'react';
import {
  Bell,
  Moon,
  Smartphone,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import {
  getNotificationPlatformInfo,
  requestNotificationPermission,
  sendLocalNotification,
} from '../../services/notifications/notificationService';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../../data/mockData';
import { Button } from '../common/Button';
import type { NotificationPreferences } from '../../types';

export const NotificationSettingsTab: React.FC = () => {
  const { user } = useAuthStore();
  const { settings, updateSettings } = useSettingsStore();

  const [platformInfo, setPlatformInfo] = useState(() => getNotificationPlatformInfo());
  const [testSent, setTestSent] = useState(false);

  const uid = user?.uid || '';
  const prefs: NotificationPreferences = {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(settings.notifications || {}),
  };

  const handleUpdate = async (updates: Partial<NotificationPreferences>) => {
    const newPrefs = { ...prefs, ...updates };
    await updateSettings({ notifications: newPrefs }, uid);
  };

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setPlatformInfo(getNotificationPlatformInfo());
  };

  const handleSendTestNotification = async () => {
    const success = await sendLocalNotification('🔔 SchoolCal Test-Benachrichtigung', {
      body: 'Deine Benachrichtigungen sind erfolgreich eingerichtet und funktionieren!',
      preferences: prefs,
      isCritical: true,
    });
    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  return (
    <div className="ios-card p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <Bell className="w-5 h-5 text-ios-blue" />
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Benachrichtigungen & Erinnerungen
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Konfiguriere Unterrichts-, Aufgaben- und Prüfungs-Mitteilungen
            </p>
          </div>
        </div>

        {/* Master Toggle */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={prefs.enabled}
            onChange={(e) => handleUpdate({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ios-blue"></div>
        </label>
      </div>

      {/* Platform & PWA Status Card */}
      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-ios-blue shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>System-Status:</span>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    platformInfo.permission === 'granted'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {platformInfo.permission === 'granted'
                    ? 'Erlaubt'
                    : platformInfo.permission === 'denied'
                    ? 'Blockiert'
                    : 'Berechtigung erforderlich'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {platformInfo.recommendation || 'Web-Benachrichtigungen sind einsatzbereit.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {platformInfo.permission !== 'granted' ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleRequestPermission}
              >
                Berechtigung anfordern
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleSendTestNotification}
                icon={<Bell className="w-3.5 h-3.5" />}
              >
                {testSent ? 'Mitteilung gesendet ✓' : 'Test-Mitteilung'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {prefs.enabled && (
        <div className="space-y-6">
          {/* 1. Unterricht & Stundenplan */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Unterricht & Stundenplan
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Vor Unterrichtsbeginn
                  </div>
                  <div className="text-[11px] text-gray-400">Erinnert an nächste Stunde</div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={prefs.lessonReminderMinutes}
                    onChange={(e) =>
                      handleUpdate({ lessonReminderMinutes: Number(e.target.value) })
                    }
                    className="px-2 py-1 bg-white dark:bg-ios-dark-tertiary rounded-lg text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none border border-black/5"
                  >
                    <option value={5}>5 Min vorher</option>
                    <option value={10}>10 Min vorher</option>
                    <option value={15}>15 Min vorher</option>
                    <option value={30}>30 Min vorher</option>
                  </select>
                  <input
                    type="checkbox"
                    checked={prefs.lessonReminders}
                    onChange={(e) => handleUpdate({ lessonReminders: e.target.checked })}
                    className="w-4 h-4 text-ios-blue rounded"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Bei Raumänderung
                  </div>
                  <div className="text-[11px] text-gray-400">Neuer Raum für eine Stunde</div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.roomChanges}
                  onChange={(e) => handleUpdate({ roomChanges: e.target.checked })}
                  className="w-4 h-4 text-ios-blue rounded"
                />
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Bei Unterrichtsausfall
                  </div>
                  <div className="text-[11px] text-gray-400">Sofortige Ausfall-Benachrichtigung</div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.cancellations}
                  onChange={(e) => handleUpdate({ cancellations: e.target.checked })}
                  className="w-4 h-4 text-ios-blue rounded"
                />
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Bei Vertretungen & Lehrerwechsel
                  </div>
                  <div className="text-[11px] text-gray-400">Vertretungslehrer-Hinweis</div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.substitutions}
                  onChange={(e) => handleUpdate({ substitutions: e.target.checked })}
                  className="w-4 h-4 text-ios-blue rounded"
                />
              </div>
            </div>
          </div>

          {/* 2. Aufgaben & Hausaufgaben */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Hausaufgaben & Fälligkeiten
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  1 Tag vor Fälligkeit
                </span>
                <input
                  type="checkbox"
                  checked={prefs.homeworkDueDayBefore}
                  onChange={(e) => handleUpdate({ homeworkDueDayBefore: e.target.checked })}
                  className="w-4 h-4 text-ios-blue rounded"
                />
              </label>

              <label className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  2 Stunden vorher
                </span>
                <input
                  type="checkbox"
                  checked={prefs.homeworkDue2HoursBefore}
                  onChange={(e) => handleUpdate({ homeworkDue2HoursBefore: e.target.checked })}
                  className="w-4 h-4 text-ios-blue rounded"
                />
              </label>

              <label className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  30 Minuten vorher
                </span>
                <input
                  type="checkbox"
                  checked={prefs.homeworkDue30MinBefore}
                  onChange={(e) => handleUpdate({ homeworkDue30MinBefore: e.target.checked })}
                  className="w-4 h-4 text-ios-blue rounded"
                />
              </label>
            </div>
          </div>

          {/* 3. Klausuren & Prüfungen */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Klausuren- & Prüfungs-Countdowns
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { key: 'examReminder7Days', label: '7 Tage vorher' },
                { key: 'examReminder3Days', label: '3 Tage vorher' },
                { key: 'examReminder1Day', label: '1 Tag vorher' },
                { key: 'examReminderDayOf', label: 'Am Prüfungstag' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary flex items-center justify-between cursor-pointer"
                >
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {item.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={(prefs as any)[item.key]}
                    onChange={(e) => handleUpdate({ [item.key]: e.target.checked })}
                    className="w-4 h-4 text-ios-blue rounded"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* 4. Smart Notifications */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Smart Notifications
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Smart Day am Morgen
                  </div>
                  <div className="text-[11px] text-gray-400">Tägliches Morgen-Briefing</div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.smartDayMorningBrief}
                  onChange={(e) => handleUpdate({ smartDayMorningBrief: e.target.checked })}
                  className="w-4 h-4 text-ios-blue rounded"
                />
              </label>

              <label className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Schulschluss-Zusammenfassung
                  </div>
                  <div className="text-[11px] text-gray-400">Aufgaben-Status nach Unterrichtsende</div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.schoolEndSummary}
                  onChange={(e) => handleUpdate({ schoolEndSummary: e.target.checked })}
                  className="w-4 h-4 text-ios-blue rounded"
                />
              </label>
            </div>
          </div>

          {/* 5. Quiet Hours (Ruhezeiten) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent border border-purple-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-purple-600" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                    Ruhezeiten (Quiet Hours)
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Während dieser Zeit werden keine nicht-kritischen Mitteilungen zugestellt.
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={prefs.quietHoursEnabled}
                onChange={(e) => handleUpdate({ quietHoursEnabled: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded"
              />
            </div>

            {prefs.quietHoursEnabled && (
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Von:</span>
                  <input
                    type="time"
                    value={prefs.quietHoursStart}
                    onChange={(e) => handleUpdate({ quietHoursStart: e.target.value })}
                    className="px-2.5 py-1 bg-white dark:bg-ios-dark-secondary rounded-lg text-xs font-bold text-gray-900 dark:text-white focus:outline-none border border-black/10"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Bis:</span>
                  <input
                    type="time"
                    value={prefs.quietHoursEnd}
                    onChange={(e) => handleUpdate({ quietHoursEnd: e.target.value })}
                    className="px-2.5 py-1 bg-white dark:bg-ios-dark-secondary rounded-lg text-xs font-bold text-gray-900 dark:text-white focus:outline-none border border-black/10"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
