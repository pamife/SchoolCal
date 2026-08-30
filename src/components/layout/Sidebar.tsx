import React from 'react';
import {
  Sun,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Settings,
  Search,
  BookOpen,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { useHomeworkStore } from '../../store/useHomeworkStore';
import { useExamStore } from '../../store/useExamStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSearchStore } from '../../store/useSearchStore';
import { GERMAN_STATES } from '../../data/holidays';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { homework } = useHomeworkStore();
  const { exams } = useExamStore();
  const { settings } = useSettingsStore();
  const { user } = useAuthStore();
  const { openSearch } = useSearchStore();

  const openTasksCount = homework.filter(h => h.status !== 'done').length;
  const upcomingExamsCount = exams.length;
  const stateName = GERMAN_STATES.find(s => s.code === settings.state)?.name || settings.state;

  const navItems = [
    { id: 'today' as NavigationTab, label: 'Heute', icon: Sun, count: null },
    { id: 'calendar' as NavigationTab, label: 'Kalender', icon: Calendar, count: null },
    { id: 'tasks' as NavigationTab, label: 'Aufgaben', icon: CheckCircle2, count: openTasksCount || null },
    { id: 'school' as NavigationTab, label: 'Schule & Stundenplan', icon: GraduationCap, count: null },
    { id: 'settings' as NavigationTab, label: 'Einstellungen', icon: Settings, count: null },
  ];

  return (
    <aside className="hidden ipad:flex flex-col w-64 xl:w-72 bg-gray-50/80 dark:bg-ios-dark-card/90 backdrop-blur-xl border-r border-black/5 dark:border-white/10 shrink-0 h-screen sticky top-0 p-4 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ios-blue to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-1.5">
            SchoolCal
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-ios-blue/15 text-ios-blue dark:text-blue-400">
              Pro
            </span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {settings.schoolName || 'Schulplaner'}
          </p>
        </div>
      </div>

      {/* Global Search Button */}
      <button
        type="button"
        onClick={() => openSearch()}
        className="flex items-center justify-between w-full px-3.5 py-2.5 mb-4 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-ios-dark-secondary rounded-ios border border-black/5 dark:border-white/5 shadow-xs hover:border-ios-blue/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <span>Schnellsuche...</span>
        </div>
        <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 dark:bg-ios-dark-tertiary rounded text-gray-500">
          ⌘K
        </kbd>
      </button>

      {/* Navigation List */}
      <div className="space-y-1 mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 py-1">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-ios font-medium text-sm transition-all ${
                isActive
                  ? 'bg-ios-blue text-white shadow-sm font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.count !== null && item.count > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-red-500/15 text-red-500 dark:bg-red-500/20 dark:text-red-400'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* iPad Quick Status Cards */}
      <div className="mt-auto space-y-2 pt-4 border-t border-black/5 dark:border-white/10">
        <div className="p-3 rounded-ios bg-white/60 dark:bg-ios-dark-secondary/60 border border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-ios-blue" />
              Ferienkalender
            </span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {settings.state}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
            {stateName}
          </p>
        </div>

        {/* User profile snippet */}
        <div className="flex items-center gap-2.5 p-2 rounded-ios hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          onClick={() => onTabChange('settings')}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-ios-blue text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'PS'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
              {user?.displayName || 'Paul Schmidt'}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
              {settings.gradeLevel || 'Schüler'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
