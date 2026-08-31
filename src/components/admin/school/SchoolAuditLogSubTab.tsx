import React, { useEffect, useState } from 'react';
import { History, RefreshCw, Clock } from 'lucide-react';
import { fetchSchoolAuditLogs } from '../../../services/school/schoolConfigService';
import type { SchoolAuditLogEntry } from '../../../types';
import { DEFAULT_SCHOOL_ID } from '../../../config/schoolConfig';
import { Badge } from '../../common/Badge';

export const SchoolAuditLogSubTab: React.FC = () => {
  const [logs, setLogs] = useState<SchoolAuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchSchoolAuditLogs(DEFAULT_SCHOOL_ID, 50);
      setLogs(data);
    } catch (err) {
      console.error('Error fetching school audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const formatActionName = (action: SchoolAuditLogEntry['action']) => {
    switch (action) {
      case 'SCHOOL_PROFILE_UPDATED':
        return { label: 'Schulprofil geändert', variant: 'blue' as const };
      case 'PERIODS_UPDATED':
        return { label: 'Unterrichtszeiten geändert', variant: 'purple' as const };
      case 'BREAKS_UPDATED':
        return { label: 'Pausenzeiten geändert', variant: 'amber' as const };
      case 'HOLIDAY_ADDED':
        return { label: 'Ferientag hinzugefügt', variant: 'emerald' as const };
      case 'HOLIDAY_DELETED':
        return { label: 'Ferientag gelöscht', variant: 'red' as const };
      case 'WEBUNTIS_CONFIG_UPDATED':
        return { label: 'WebUntis Konfiguration geändert', variant: 'indigo' as const };
      default:
        return { label: action, variant: 'gray' as const };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
        <div>
          <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-ios-blue" />
            <span>Änderungsverlauf der Schulkonfiguration</span>
          </h4>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            Protokollierte Anpassungen an Glockenzeiten, Pausen und Schnittstellen.
          </p>
        </div>

        <button
          type="button"
          onClick={loadLogs}
          disabled={loading}
          className="p-1.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
          title="Verlauf aktualisieren"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="ios-card p-6 text-center text-gray-500 dark:text-gray-400">
          <Clock className="w-8 h-8 mx-auto text-gray-300 mb-2" />
          <p className="text-xs font-semibold">Noch keine Konfigurationsänderungen protokolliert.</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Sobald ein Administrator Zeiten oder Einstellungen anpasst, erscheinen diese hier.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar pr-1">
          {logs.map((log) => {
            const meta = formatActionName(log.action);

            return (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={meta.variant} size="sm">
                      {meta.label}
                    </Badge>
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                      durch {log.actorEmail || log.actorUid}
                    </span>
                  </div>

                  <span className="text-[10px] text-gray-400">
                    {new Date(log.timestamp).toLocaleString('de-DE')}
                  </span>
                </div>

                {log.details && (
                  <div className="text-[11px] text-gray-600 dark:text-gray-300 font-mono bg-black/5 dark:bg-white/5 p-1.5 rounded-lg overflow-x-auto">
                    {JSON.stringify(log.details)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
