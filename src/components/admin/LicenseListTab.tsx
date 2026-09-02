import React, { useState } from 'react';
import type { License } from '../../types';
import { revokeLicense, restoreLicense } from '../../services/admin/adminService';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Search, ShieldAlert, CheckCircle2, RotateCcw, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface LicenseListTabProps {
  licenses: License[];
  adminUid: string;
  adminEmail: string;
  loading: boolean;
  onRefresh: () => void;
}

export const LicenseListTab: React.FC<LicenseListTabProps> = ({
  licenses,
  adminUid,
  adminEmail,
  loading,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [planFilter, setPlanFilter] = useState<string>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleRevoke = async (licId: string) => {
    if (window.confirm('Möchtest du diese Lizenz wirklich widerrufen? Der verknüpfte Nutzer fällt automatisch auf den Standard-Tarif zurück.')) {
      setActionLoading(licId);
      try {
        await revokeLicense(adminUid, adminEmail, licId);
        onRefresh();
      } catch (err: any) {
        alert('Fehler beim Widerrufen: ' + err.message);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleRestore = async (licId: string) => {
    setActionLoading(licId);
    try {
      await restoreLicense(adminUid, adminEmail, licId);
      onRefresh();
    } catch (err: any) {
      alert('Fehler beim Wiederherstellen: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredLicenses = licenses.filter((lic) => {
    const matchesSearch =
      lic.codePrefix.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lic.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lic.activatedByEmail && lic.activatedByEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lic.activatedByUid && lic.activatedByUid.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lic.notes && lic.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || lic.status === statusFilter;
    const matchesPlan = planFilter === 'ALL' || lic.plan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Code, E-Mail, Notiz suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'Alle' },
            { id: 'AVAILABLE', label: 'Verfügbar' },
            { id: 'ACTIVE', label: 'Aktiv' },
            { id: 'EXPIRED', label: 'Abgelaufen' },
            { id: 'REVOKED', label: 'Widerrufen' },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatusFilter(st.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                statusFilter === st.id
                  ? 'bg-ios-blue text-white'
                  : 'bg-gray-100 dark:bg-ios-dark-secondary text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Licenses Table */}
      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500 animate-pulse">
          Lade Lizenzen...
        </div>
      ) : filteredLicenses.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-400 ios-card">
          Keine Lizenzen gefunden.
        </div>
      ) : (
        <div className="ios-card overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/10 bg-gray-50/70 dark:bg-ios-dark-secondary/70 text-gray-500 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Code / ID</th>
                  <th className="py-2.5 px-3">Tarif</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Gültig bis</th>
                  <th className="py-2.5 px-3">Aktiviert von</th>
                  <th className="py-2.5 px-3 text-right">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredLicenses.map((lic) => {
                  const isActioning = actionLoading === lic.id;

                  return (
                    <tr key={lic.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-gray-900 dark:text-white">
                        <div>{lic.codePrefix}</div>
                        {lic.notes && (
                          <div className="text-[10px] font-sans font-normal text-gray-400 truncate max-w-[140px]">
                            {lic.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                            lic.plan === 'PRO'
                              ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                              : 'bg-blue-500/15 text-ios-blue'
                          }`}
                        >
                          {lic.plan}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <Badge
                          variant={
                            lic.status === 'ACTIVE'
                              ? 'blue'
                              : lic.status === 'AVAILABLE'
                              ? 'green'
                              : lic.status === 'EXPIRED'
                              ? 'gray'
                              : 'red'
                          }
                          size="sm"
                        >
                          {lic.status === 'AVAILABLE'
                            ? 'Verfügbar'
                            : lic.status === 'ACTIVE'
                            ? 'Aktiv'
                            : lic.status === 'EXPIRED'
                            ? 'Abgelaufen'
                            : 'Widerrufen'}
                        </Badge>
                      </td>

                      <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300 text-[11px]">
                        {lic.expiresAt
                          ? format(new Date(lic.expiresAt), 'dd.MM.yyyy', { locale: de })
                          : lic.durationDays
                          ? `${lic.durationDays} Tage`
                          : 'Unbegrenzt'}
                      </td>

                      <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300 text-[11px]">
                        {lic.activatedByEmail ? (
                          <span className="font-semibold text-gray-900 dark:text-white truncate block max-w-[150px]">
                            {lic.activatedByEmail}
                          </span>
                        ) : lic.activatedByUid ? (
                          <span className="font-mono text-[10px] text-gray-400 truncate block max-w-[100px]">
                            {lic.activatedByUid.slice(0, 8)}...
                          </span>
                        ) : (
                          <span className="text-gray-400">–</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        {lic.status === 'REVOKED' ? (
                          <button
                            type="button"
                            disabled={isActioning}
                            onClick={() => handleRestore(lic.id)}
                            className="text-[11px] font-bold text-ios-blue hover:underline inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Wiederherstellen</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isActioning}
                            onClick={() => handleRevoke(lic.id)}
                            className="text-[11px] font-bold text-red-500 hover:underline inline-flex items-center gap-1"
                          >
                            <ShieldAlert className="w-3 h-3" />
                            <span>Widerrufen</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
