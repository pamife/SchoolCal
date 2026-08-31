import React from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Settings,
  Award,
} from 'lucide-react';
import type { NavigationTab } from '../../types';
import { useHomeworkStore } from '../../store/useHomeworkStore';
import { useKeyboardViewport } from '../../hooks/useKeyboardViewport';
import { haptics } from '../../utils/haptics';

interface MobileNavBarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { homework } = useHomeworkStore();
  const { isKeyboardOpen } = useKeyboardViewport();
  const openTasksCount = homework.filter(h => h.status !== 'done').length;

  const tabs: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'today', label: 'Heute', icon: Sun },
    { id: 'calendar', label: 'Kalender', icon: Calendar },
    { id: 'tasks', label: 'Aufgaben', icon: CheckCircle2, badge: openTasksCount > 0 ? openTasksCount : undefined },
    { id: 'grades', label: 'Noten', icon: Award },
    { id: 'school', label: 'Schule', icon: GraduationCap },
    { id: 'settings', label: 'Optionen', icon: Settings },
  ];

  // If mobile keyboard is active, hide the bottom bar to prevent viewport occlusion
  if (isKeyboardOpen) {
    return null;
  }

  return (
    <nav
      aria-label="Mobile Navigation"
      className="ipad:hidden fixed bottom-0 left-0 right-0 z-40 ios-glass-bar border-t border-black/5 dark:border-white/10 pb-[max(0.25rem,env(safe-area-inset-bottom,0px))] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)] select-none transition-transform duration-200"
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (!isActive) {
                  haptics.selection();
                }
                onTabChange(tab.id);
              }}
              className="relative flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 transition-all group ios-press-active"
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive
                      ? 'text-ios-blue scale-105'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[9px] mt-0.5 tracking-tight font-medium transition-colors ${
                  isActive
                    ? 'text-ios-blue font-bold'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="mobile-nav-dot"
                  className="absolute -bottom-0.5 w-1 h-1 bg-ios-blue rounded-full"
                  transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
