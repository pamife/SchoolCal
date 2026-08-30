import React from 'react';
import type { AuditLogEntry } from '../../types';
import { Badge } from '../common/Badge';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface AuditLogTabProps {
  logs: AuditLogEntry[];
  loading: boolean;
}

export const AuditLogTab: React.FC<AuditLogTabProps> = ({ logs, loading }) => {
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'LICENSE_CREATED':
        return <Badge variant="green" size="sm">Codes erstellt</Badge>;
      case 'LICENSE_ACTIVATED':
        return <Badge variant="blue" size="sm">Code eingelöst</Badge>;
      case 'LICENSE_REVOKED':
        return <Badge variant="red" size="sm">Widerrufen</Badge>;
      case 'LICENSE_RESTORED':
        return <Badge variant="amber" size="sm">Wiederhergestellt</Badge>;
      case 'MANUAL_PLAN_GRANTED':
        return <Badge variant="purple" size="sm">Admin-Freischaltung</Badge>;
      default:
        return <Badge variant="gray" size="sm">{action}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-gray-500 animate-pulse">
        Lade Audit-Protokolle...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-gray-400 ios-card">
        Noch keine Audit-Einträge vorhanden.
      </div>
    );
  }

  return (
    <div className="ios-card overflow-hidden">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-xs border-collapse min-w-[580px]">
          <thead>
            <tr className="border-b border-black/5 dark:border-white/10 bg-gray-50/70 dark:bg-ios-dark-secondary/70 text-gray-500 font-bold uppercase text-[10px]">
              <th className="py-2.5 px-3">Zeitpunkt</th>
              <th className="py-2.5 px-3">Aktion</th>
              <th className="py-2.5 px-3">Ausführender</th>
              <th className="py-2.5 px-3">Ziel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {logs.map((entry) => (
              <tr key={entry.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap text-[11px]">
                  {format(new Date(entry.timestamp), 'dd.MM.yyyy HH:mm:ss', { locale: de })}
                </td>

                <td className="py-2.5 px-3">
                  {getActionBadge(entry.action)}
                </td>

                <td className="py-2.5 px-3 font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                  {entry.actorEmail || entry.actorUid}
                </td>

                <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300 text-[11px] truncate max-w-[150px]">
                  {entry.targetEmail || entry.targetUid || entry.licenseId || '–'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
