import React from 'react';
import { CheckCircle2, Circle, Clock, ChevronRight, Plus } from 'lucide-react';
import { Homework, Subject } from '../../types';
import { getRelativeDateLabel } from '../../utils/dateUtils';
import { Badge } from '../common/Badge';

interface TodayHomeworkWidgetProps {
  homework: Homework[];
  subjects: Subject[];
  onToggleComplete: (id: string) => void;
  onOpenHomeworkTab: () => void;
  onAddHomework: () => void;
}

export const TodayHomeworkWidget: React.FC<TodayHomeworkWidgetProps> = ({
  homework,
  subjects,
  onToggleComplete,
  onOpenHomeworkTab,
  onAddHomework,
}) => {
  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const pendingTasks = homework.filter(h => h.status !== 'done').slice(0, 4);

  return (
    <div className="ios-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-ios-blue" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Anstehende Aufgaben
          </h3>
          {pendingTasks.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-ios-blue font-bold">
              {pendingTasks.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddHomework}
            className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-ios-blue transition-colors"
            title="Aufgabe hinzufügen"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onOpenHomeworkTab}
            className="text-xs font-semibold text-ios-blue hover:underline flex items-center gap-0.5"
          >
            Alle anzeigen
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {pendingTasks.length === 0 ? (
        <div className="py-4 text-center text-xs text-gray-400">
          🎉 Keine offenen Aufgaben für die nächsten Tage!
        </div>
      ) : (
        <div className="space-y-2">
          {pendingTasks.map((task) => {
            const subject = subjectMap.get(task.subjectId);
            const dateLabel = getRelativeDateLabel(task.dueDate);

            return (
              <div
                key={task.id}
                className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
              >
                <button
                  type="button"
                  onClick={() => onToggleComplete(task.id)}
                  className="mt-0.5 text-gray-400 hover:text-ios-blue dark:hover:text-ios-blue transition-colors shrink-0"
                >
                  <Circle className="w-4 h-4" />
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight truncate">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {subject && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded leading-none text-white"
                        style={{ backgroundColor: subject.color }}
                      >
                        {subject.shortName}
                      </span>
                    )}
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {dateLabel}
                    </span>
                    {task.priority === 'high' && (
                      <Badge variant="red" size="sm" className="text-[10px] py-0 px-1">
                        Dringend
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
