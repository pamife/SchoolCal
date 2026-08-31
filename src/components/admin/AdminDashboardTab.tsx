import React, { useState, useEffect } from 'react';
import type { AdminStats } from '../../services/admin/adminService';
import {
  Users,
  KeyRound,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Sparkles,
  Brain,
  Server,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../common/Button';
import { defaultAIService } from '../../services/ai/BackendAIService';
import type { AIHealthStatus } from '../../services/ai/AIServiceInterface';

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
  const [aiHealth, setAiHealth] = useState<AIHealthStatus | null>(null);
  const [checkingAi, setCheckingAi] = useState(false);

  const checkHealth = async (force = false) => {
    setCheckingAi(true);
    try {
      const health = await defaultAIService.checkHealth(force);
      setAiHealth(health);
    } catch {
      // Ignore
    } finally {
      setCheckingAi(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

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

      {/* 3. KI Backend & Gemini Health Status */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-purple-600" />
            <span>KI-Infrastruktur & Google Gemini Status</span>
          </h4>

          <button
            type="button"
            onClick={() => checkHealth(true)}
            disabled={checkingAi}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <RefreshCw className={`w-3 h-3 ${checkingAi ? 'animate-spin' : ''}`} />
            <span>Status prüfen</span>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="text-gray-500 text-[11px]">Provider</div>
              <div className="font-bold text-gray-900 dark:text-white mt-0.5">Google Gemini</div>
            </div>

            <div>
              <div className="text-gray-500 text-[11px]">Server Environment Key</div>
              <div className="mt-0.5 flex items-center gap-1 font-bold">
                {aiHealth?.configured ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Konfiguriert
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Nicht gesetzt
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="text-gray-500 text-[11px]">Status</div>
              <div className="mt-0.5">
                {aiHealth?.status === 'active' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                ) : aiHealth?.status === 'missing_key' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    Nicht konfiguriert
                  </span>
                ) : aiHealth?.status === 'invalid_key' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-600 dark:text-red-400">
                    Key ungültig
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-500/15 text-gray-600 dark:text-gray-400">
                    Offline
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="text-gray-500 text-[11px]">Aktives Modell</div>
              <div className="font-bold text-gray-900 dark:text-white mt-0.5 font-mono text-[11px]">
                {aiHealth?.model || 'gemini-1.5-flash'}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <Server className="w-3 h-3 text-purple-600" />
              <span>{aiHealth?.message || 'Serverless Netlify Function (/.netlify/functions/ai-assistant)'}</span>
            </span>
            <span>API-Key: Geschützt & serverseitig isoliert</span>
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
