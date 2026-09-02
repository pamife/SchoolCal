import { Search, Plus, MapPin, Bot, RefreshCw, CloudOff, Check } from 'lucide-react';
import { useSearchStore } from '../../store/useSearchStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useSyncStore } from '../../store/useSyncStore';
import { performAppSync } from '../../services/sync/syncManager';
import { formatGermanDate, formatGermanWeekday } from '../../utils/dateUtils';
import { GERMAN_STATES } from '../../data/holidays';
import { Badge } from '../common/Badge';

interface TopHeaderProps {
  onOpenQuickAction: () => void;
  onOpenAiAssistant?: () => void;
  title?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenQuickAction,
  onOpenAiAssistant,
  title,
}) => {
  const { openSearch } = useSearchStore();
  const { settings } = useSettingsStore();
  const { syncStatus, isOnline, getFormattedRelativeTime } = useSyncStore();

  const today = new Date();
  const dateFormatted = formatGermanDate(today, 'd. MMMM yyyy');
  const weekday = formatGermanWeekday(today, 'long');
  const stateInfo = GERMAN_STATES.find(s => s.code === settings.state);

  const handleManualSync = () => {
    performAppSync({ force: true });
  };

  return (
    <header className="sticky top-0 z-30 ios-glass-bar border-b border-black/5 dark:border-white/10 px-4 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top,0px))] pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] select-none shrink-0">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Date / Title / Sync State */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ios-blue">
              {weekday}
            </span>
            <Badge variant="gray" size="sm" className="hidden sm:inline-flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5 text-ios-blue" />
              {stateInfo?.name || settings.state}
            </Badge>

            {/* Subtle Sync Indicator */}
            <button
              type="button"
              onClick={handleManualSync}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title={`Klicken zum Aktualisieren • Zuletzt synchronisiert: ${getFormattedRelativeTime()}`}
            >
              {syncStatus === 'syncing' ? (
                <>
                  <RefreshCw className="w-2.5 h-2.5 text-ios-blue animate-spin" />
                  <span className="text-[10px] text-ios-blue font-semibold">Aktualisiere...</span>
                </>
              ) : !isOnline ? (
                <>
                  <CloudOff className="w-2.5 h-2.5 text-amber-500" />
                  <span className="text-[10px] text-amber-500 font-semibold">Offline</span>
                </>
              ) : syncStatus === 'error' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-[10px] text-red-500 font-semibold">Sync-Fehler</span>
                </>
              ) : null}
            </button>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
            {title || dateFormatted}
          </h2>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* AI Assistant Quick Button */}
          {onOpenAiAssistant && (
            <button
              type="button"
              onClick={onOpenAiAssistant}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600/20 to-indigo-600/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all active:scale-95 shadow-xs"
              title="KI-Schulassistent öffnen"
            >
              <Bot className="w-4 h-4" />
            </button>
          )}

          {/* Global Search Button */}
          <button
            type="button"
            onClick={() => openSearch()}
            className="w-9 h-9 rounded-full bg-gray-200/70 dark:bg-ios-dark-secondary flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-300/80 dark:hover:bg-ios-dark-tertiary transition-colors"
            title="Suche (⌘K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* New Event / Task Quick Action Button */}
          <button
            type="button"
            onClick={onOpenQuickAction}
            className="h-9 px-3 sm:px-3.5 rounded-full bg-ios-blue text-white flex items-center gap-1.5 font-medium text-xs sm:text-sm shadow-sm hover:brightness-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">Hinzufügen</span>
          </button>
        </div>
      </div>
    </header>
  );
};
