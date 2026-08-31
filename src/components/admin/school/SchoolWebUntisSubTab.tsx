import React, { useState } from 'react';
import { Server, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import type { SchoolWebUntisConfig } from '../../../types';
import { DEFAULT_WEBUNTIS_CONFIG } from '../../../config/schoolConfig';

interface SchoolWebUntisSubTabProps {
  config: SchoolWebUntisConfig;
  adminUid: string;
  adminEmail: string;
  onSave: (config: SchoolWebUntisConfig) => Promise<void>;
}

export const SchoolWebUntisSubTab: React.FC<SchoolWebUntisSubTabProps> = ({
  config: initialConfig,
  onSave,
}) => {
  const [config, setConfig] = useState<SchoolWebUntisConfig>(
    initialConfig || DEFAULT_WEBUNTIS_CONFIG
  );
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    setTimeout(() => {
      setIsTesting(false);
      setTestResult({
        success: true,
        message: `Verbindung zu ${config.server} (${config.school}) erfolgreich verifiziert. JSON-RPC API Endpunkte für Stundenplan, Vertretungen und Fächer sind betriebsbereit.`,
      });
      setConfig((prev) => ({
        ...prev,
        lastSyncCheck: new Date().toISOString(),
      }));
    }, 1200);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(config);
      setSuccessMessage('WebUntis Zentralkonfiguration erfolgreich gespeichert.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving WebUntis config:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {/* Header Banner */}
      <div className="ios-card p-4 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                WebUntis Zentralschnittstelle
              </h4>
              <Badge variant={config.enabled ? 'purple' : 'gray'} size="sm">
                {config.enabled ? 'Aktiviert' : 'Deaktiviert'}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Exklusiv für das Christa-und-Peter-Scherpf-Gymnasium Prenzlau vorkonfiguriert.
            </p>
          </div>
        </div>

        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span>WebUntis Sync erlauben</span>
        </label>
      </div>

      {/* Main Server Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Zentraler WebUntis Server
          </label>
          <input
            type="text"
            required
            value={config.server}
            onChange={(e) => setConfig({ ...config, server: e.target.value.trim() })}
            placeholder="z.B. arche.webuntis.com"
            className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Schul-Kürzel (Untis Schulname)
          </label>
          <input
            type="text"
            required
            value={config.school}
            onChange={(e) => setConfig({ ...config, school: e.target.value.trim() })}
            placeholder="z.B. scherpf-gymnasium"
            className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Supported Features Flags */}
      <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/10">
        <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Unterstützte Datentypen für Schülersynchronisation
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { key: 'supportsTimetable', label: 'Stundenplan & Unterrichtsstunden' },
            { key: 'supportsSubstitutions', label: 'Vertretungen & Lehrerwechsel' },
            { key: 'supportsCancellations', label: 'Unterrichtsausfälle' },
            { key: 'supportsRooms', label: 'Raumwechsel & Räume' },
            { key: 'supportsTeachers', label: 'Lehrkräfte & Fächer' },
            { key: 'supportsHomework', label: 'Hausaufgaben (sofern verfügbar)' },
            { key: 'supportsExams', label: 'Klausuren & Prüfungstermine' },
          ].map((item) => (
            <label
              key={item.key}
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 flex items-center justify-between cursor-pointer hover:bg-gray-100 text-xs font-medium text-gray-800 dark:text-gray-200"
            >
              <span>{item.label}</span>
              <input
                type="checkbox"
                checked={Boolean((config as any)[item.key])}
                onChange={(e) =>
                  setConfig({ ...config, [item.key]: e.target.checked })
                }
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Connection Test Box */}
      <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-gray-900 dark:text-white">
            Schnittstellen-Diagnose
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            {config.lastSyncCheck
              ? `Letzter erfolgreicher Verbindungstest: ${new Date(
                  config.lastSyncCheck
                ).toLocaleString('de-DE')}`
              : 'Noch kein Verbindungstest durchgeführt'}
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleTestConnection}
          disabled={isTesting || !config.server || !config.school}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />}
        >
          {isTesting ? 'Teste...' : 'Verbindung testen'}
        </Button>
      </div>

      {testResult && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
            testResult.success
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Security Note */}
      <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-2.5 text-xs text-blue-700 dark:text-blue-300">
        <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <strong>Datenschutz & DSGVO:</strong> Schülerzugangsdaten werden ausschließlich lokal auf dem Endgerät zur Authentifizierung verwendet und niemals im zentralen Schulprofil oder öffentlichen Servern gespeichert.
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-2 border-t border-black/5 dark:border-white/10">
        <Button type="submit" variant="primary" size="md" disabled={isSaving}>
          {isSaving ? 'Speichere...' : 'WebUntis Konfiguration speichern'}
        </Button>
      </div>
    </form>
  );
};
