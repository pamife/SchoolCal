import React, { useState } from 'react';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  TrendingUp,
  BookOpen,
  Award,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useHomeworkStore } from '../../store/useHomeworkStore';
import { useExamStore } from '../../store/useExamStore';
import { useGradeStore } from '../../store/useGradeStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useSubscription } from '../../hooks/useSubscription';
import { calculateSchoolStatistics } from '../../utils/statisticsEngine';
import { SubjectCompletionBar } from './SubjectCompletionBar';
import { FeatureGate } from '../licensing/FeatureGate';
import { PricingModal } from '../licensing/PricingModal';
import { LicenseActivationModal } from '../licensing/LicenseActivationModal';
import type { StatisticsPeriod } from '../../types';

export const StatisticsScreen: React.FC = () => {
  const { scheduleEntries, subjects } = useSchoolStore();
  const { homework } = useHomeworkStore();
  const { exams } = useExamStore();
  const { grades } = useGradeStore();
  const { settings } = useSettingsStore();
  const { isPlus, isPro } = useSubscription();

  const [period, setPeriod] = useState<StatisticsPeriod>('this_week');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isActivationOpen, setIsActivationOpen] = useState(false);

  const stats = calculateSchoolStatistics({
    period,
    scheduleEntries,
    periodTimes: settings.periodTimes || [],
    subjects,
    homework,
    exams,
    grades,
  });

  const periodOptions: { id: StatisticsPeriod; label: string; isPlus?: boolean }[] = [
    { id: 'today', label: 'Heute' },
    { id: 'this_week', label: 'Diese Woche' },
    { id: 'last_week', label: 'Letzte Woche', isPlus: true },
    { id: 'this_month', label: 'Dieser Monat', isPlus: true },
    { id: 'last_month', label: 'Letzter Monat', isPlus: true },
    { id: 'school_year', label: 'Schuljahr', isPlus: true },
  ];

  const handlePeriodChange = (newPeriod: StatisticsPeriod, requiresPlus?: boolean) => {
    if (requiresPlus && !isPlus) {
      setIsPricingOpen(true);
      return;
    }
    setPeriod(newPeriod);
  };

  const hasAnyData = scheduleEntries.length > 0 || homework.length > 0 || exams.length > 0;

  return (
    <div className="space-y-6 pb-4 ipad:pb-6 max-w-5xl mx-auto px-1">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-ios-blue" />
            <span>Schulstatistiken</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Analysiere deine Unterrichtszeiten, Erledigungsquoten und Lernfortschritte
          </p>
        </div>
      </div>

      {/* Period Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {periodOptions.map((p) => {
          const isSelected = period === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePeriodChange(p.id, p.isPlus)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-ios-blue text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-ios-dark-secondary dark:hover:bg-ios-dark-tertiary text-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{p.label}</span>
              {p.isPlus && !isPlus && (
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-ios-blue/20 text-ios-blue">
                  Plus
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!hasAnyData ? (
        <div className="ios-card p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-ios-dark-secondary text-gray-400 flex items-center justify-center mx-auto">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Noch keine Statistiken verfügbar
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Sobald du deinen Stundenplan, Hausaufgaben oder anstehende Klausuren eingetragen hast, erscheinen hier deine persönlichen Auswertungen.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. Key Performance Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Total Lesson Time */}
            <div className="ios-card p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Unterrichtszeit
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                  {stats.totalLessonHoursFormatted}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  Im Zeitraum: {stats.periodLabel}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-ios-blue flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* Task Completion Rate */}
            <div className="ios-card p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Erledigungsquote
                </div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {stats.totalHomeworkCount > 0 ? `${stats.overallCompletionRate}%` : '–'}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {stats.completedHomeworkCount} von {stats.totalHomeworkCount} erledigt
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* Open / Overdue Tasks */}
            <div className="ios-card p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Offene Aufgaben
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                  {stats.openHomeworkCount}
                </div>
                <div className="text-[10px] text-red-500 font-semibold mt-0.5">
                  {stats.overdueHomeworkCount > 0
                    ? `${stats.overdueHomeworkCount} überfällig`
                    : 'Keine überfälligen Aufgaben'}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>

            {/* Upcoming Exams */}
            <div className="ios-card p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Prüfungen & Tests
                </div>
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                  {stats.upcomingExamsCount}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {stats.completedExamsCount} bereits absolviert
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* 2. Fächer-Erledigungsquoten & Aufgabenstatistik */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-ios-blue" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Aufgaben & Erledigung pro Schulfach
                </h3>
              </div>
              <span className="text-xs text-gray-400">
                {stats.subjectStats.length} Schulfächer
              </span>
            </div>

            {stats.subjectStats.length === 0 ? (
              <div className="ios-card p-6 text-center text-xs text-gray-400">
                Keine Schulfächer angelegt.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stats.subjectStats.map((subStat) => (
                  <SubjectCompletionBar key={subStat.subjectId} stat={subStat} />
                ))}
              </div>
            )}
          </div>

          {/* 3. Stundenplan-Verteilung nach Fächern */}
          <div className="ios-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Wöchentliche Stundenverteilung
                </h3>
              </div>
              <span className="text-xs font-semibold text-gray-500">
                {scheduleEntries.length} Schulstunden / Woche
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {stats.subjectStats
                .filter((s) => s.lessonMinutes > 0)
                .map((s) => (
                  <div
                    key={s.subjectId}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: s.color || '#007AFF' }}
                      />
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                        {s.subjectName}
                      </span>
                    </div>
                    <span className="text-xs font-black text-gray-900 dark:text-white shrink-0">
                      {s.lessonHoursFormatted}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* 4. Historische Trends (KW-Verlauf) */}
          <div className="ios-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Aufgaben-Trendverlauf (Wochenvergleich)
                </h3>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300">
                Echte Verlaufsdaten
              </span>
            </div>

            {stats.hasEnoughDataForTrends ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {stats.weeklyTrends.map((trend) => (
                    <div
                      key={trend.weekLabel}
                      className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center"
                    >
                      <div className="text-xs font-extrabold text-purple-700 dark:text-purple-300">
                        {trend.weekLabel}
                      </div>
                      <div className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
                        {trend.completedTasks} / {trend.totalTasks}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        Aufgaben erledigt
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary text-center space-y-1">
                <HelpCircle className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Noch nicht genügend Daten für einen Trend vorhanden
                </div>
                <div className="text-[11px] text-gray-400 max-w-sm mx-auto">
                  Sobald du über mindestens 2 verschiedene Schulwochen hinweg Aufgaben erledigt hast, wird dir hier dein Entwicklungs- und Produktivitätsverlauf angezeigt.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pricing & Activation Modals */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onOpenActivation={() => {
          setIsPricingOpen(false);
          setIsActivationOpen(true);
        }}
      />

      <LicenseActivationModal
        isOpen={isActivationOpen}
        onClose={() => setIsActivationOpen(false)}
      />
    </div>
  );
};
