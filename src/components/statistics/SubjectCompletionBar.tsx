import React from 'react';
import type { SubjectStat } from '../../types';

interface SubjectCompletionBarProps {
  stat: SubjectStat;
}

export const SubjectCompletionBar: React.FC<SubjectCompletionBarProps> = ({ stat }) => {
  return (
    <div className="p-3 rounded-2xl bg-white dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs"
            style={{ backgroundColor: stat.color || '#007AFF' }}
          >
            {stat.shortName}
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 dark:text-white">
              {stat.subjectName}
            </div>
            <div className="text-[10px] text-gray-400">
              {stat.lessonHoursFormatted} Unterricht / Woche
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-black text-gray-900 dark:text-white">
            {stat.completionRate}%
          </div>
          <div className="text-[10px] text-gray-400">
            {stat.completedTasks} / {stat.totalTasks} erledigt
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-100 dark:bg-ios-dark-tertiary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${stat.completionRate}%`,
            backgroundColor: stat.color || '#007AFF',
          }}
        />
      </div>
    </div>
  );
};
