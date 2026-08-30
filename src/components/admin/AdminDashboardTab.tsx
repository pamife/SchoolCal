import React from 'react';
import type { AdminStats } from '../../services/admin/adminService';
import { Users, KeyRound, CheckCircle2, XCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

interface AdminDashboardTabProps {
  stats: AdminStats | null;
  loading: boolean;
  onNavigateTab: (tab: 'generator' | 'licenses' | 'users' | 'audit') => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  stats,
  loading,
  onNavigateTab,
}) => {
  if (loading || !stats) {
    return (
      <div className="p-8 text-center text-xs text-gray-500 animate-pulse">
        Lade Dashboard-Statistiken...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. User Stats */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-ios-blue" />
          <span>Benutzer-Übersicht ({stats.totalUsers})</span>
        </h4>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5">
            <div className="text-xs font-semibold text-gray-500">Standard (Free)</div>
            <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {stats.standardUsers}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Kostenlose Accounts</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <div className="text-xs font-semibold text-ios-blue">Plus Abonnenten</div>
            <div className="text-2xl font-black text-ios-blue mt-1">
              {stats.plusUsers}
            </div>
            <div className="text-[10px] text-ios-blue/70 mt-0.5">Premium Nutzer</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
            <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">Pro Abonnenten</div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
              {stats.proUsers}
            </div>
            <div className="text-[10px] text-purple-500/70 mt-0.5">Höchste Tarifstufe</div>
          </div>
        </div>
      </div>

      {/* 2. License Stats */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-emerald-500" />
          <span>Lizenzcode-Status ({stats.totalLicenses} gesamt)</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verfügbar</span>
            </div>
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
              {stats.availableLicenses}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="text-xs font-semibold text-ios-blue flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aktiv eingelöst</span>
            </div>
            <div className="text-xl font-bold text-ios-blue mt-1">
              {stats.activeLicenses}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-100 dark:bg-ios-dark-secondary">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>Abgelaufen</span>
            </div>
            <div className="text-xl font-bold text-gray-700 dark:text-gray-300 mt-1">
              {stats.expiredLicenses}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Widerrufen</span>
            </div>
            <div className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
              {stats.revokedLicenses}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div>
          <h4 className="text-sm font-bold">Neue Lizenzcodes generieren</h4>
          <p className="text-xs text-white/80 mt-0.5">
            Erstelle neue Plus- oder Pro-Lizenzcodes für Tester oder Schüler.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onNavigateTab('generator')}
          className="bg-white text-blue-600 hover:bg-white/90 border-0"
        >
          Zum Generator
        </Button>
      </div>
    </div>
  );
};
