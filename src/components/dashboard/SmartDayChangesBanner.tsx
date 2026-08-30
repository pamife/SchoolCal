import React from 'react';
import { AlertTriangle, MapPin, User, XCircle, ArrowRight } from 'lucide-react';
import type { SmartDayChangeInfo } from '../../types';

interface SmartDayChangesBannerProps {
  changes: SmartDayChangeInfo[];
  onOpenSchoolTab?: () => void;
}

export const SmartDayChangesBanner: React.FC<SmartDayChangesBannerProps> = ({
  changes,
  onOpenSchoolTab,
}) => {
  if (!changes || changes.length === 0) return null;

  return (
    <div className="ios-card p-4 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Stundenplan-Änderungen heute ({changes.length})</span>
        </div>

        {onOpenSchoolTab && (
          <button
            type="button"
            onClick={onOpenSchoolTab}
            className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-0.5"
          >
            <span>Details</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {changes.map((ch) => (
          <div
            key={ch.id}
            className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              ch.type === 'cancelled'
                ? 'bg-red-500/10 border-red-500/20 text-red-900 dark:text-red-300'
                : 'bg-white/70 dark:bg-ios-dark-secondary/70 border-black/5 dark:border-white/10 text-gray-800 dark:text-gray-200'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {ch.type === 'cancelled' ? (
                <XCircle className="w-4 h-4 text-red-500" />
              ) : ch.type === 'room_change' ? (
                <MapPin className="w-4 h-4 text-amber-500" />
              ) : (
                <User className="w-4 h-4 text-purple-500" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-bold truncate">
                {ch.period}. Stunde: {ch.subjectName}
              </div>
              <div className="text-[11px] opacity-85 mt-0.5">
                {ch.details}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
