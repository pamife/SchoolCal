import React from 'react';
import { CheckCircle2, Circle, Clock, Edit2, AlertCircle } from 'lucide-react';
import { Homework, Subject } from '../../types';
import { getRelativeDateLabel } from '../../utils/dateUtils';
import { Badge } from '../common/Badge';

interface HomeworkCardProps {
  homework: Homework;
  subject?: Subject;
  onToggleComplete: (id: string) => void;
  onEdit: (homework: Homework) => void;
}

export const HomeworkCard: React.FC<HomeworkCardProps> = ({
  homework,
  subject,
  onToggleComplete,
  onEdit,
}) => {
  const isDone = homework.status === 'done';
  const relativeDate = getRelativeDateLabel(homework.dueDate);
  const isOverdue = relativeDate.includes('überfällig') && !isDone;

  return (
    <div
      className={`ios-card p-4 transition-all flex items-start justify-between gap-3 group ${
        isDone
          ? 'opacity-55 bg-gray-50/50 dark:bg-ios-dark-secondary/40'
          : isOverdue
          ? 'border-red-500/30 bg-red-500/5'
          : 'hover:shadow-md'
      }`}
    >
      {/* Left: Interactive Checkbox */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete(homework.id);
        }}
        className="mt-0.5 text-gray-400 hover:text-ios-blue dark:hover:text-ios-blue transition-colors shrink-0 ios-press-active"
        title={isDone ? 'Als unerledigt markieren' : 'Als erledigt markieren'}
      >
        {isDone ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <Circle className="w-5 h-5 hover:scale-110 transition-transform" />
        )}
      </button>

      {/* Middle: Content */}
      <div
        onClick={() => onEdit(homework)}
        className="flex-1 min-w-0 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {subject && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white shrink-0"
              style={{ backgroundColor: subject.color }}
            >
              {subject.shortName}
            </span>
          )}
          <h4
            className={`text-sm font-bold text-gray-900 dark:text-white truncate ${
              isDone ? 'line-through text-gray-400 dark:text-gray-500' : ''
            }`}
          >
            {homework.title}
          </h4>
        </div>

        {homework.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {homework.description}
          </p>
        )}

        {/* Badges footer */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {/* Due date badge */}
          <span
            className={`text-xs font-semibold flex items-center gap-1 ${
              isOverdue
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Clock className="w-3 h-3" />
            {relativeDate}
          </span>

          {/* Priority */}
          {homework.priority === 'high' && (
            <Badge variant="red" size="sm">
              Hohe Priorität
            </Badge>
          )}
          {homework.priority === 'normal' && (
            <Badge variant="blue" size="sm">
              Normal
            </Badge>
          )}

          {subject && (
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              {subject.name}
            </span>
          )}
        </div>
      </div>

      {/* Right edit button */}
      <button
        type="button"
        onClick={() => onEdit(homework)}
        className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors shrink-0"
        title="Bearbeiten"
      >
        <Edit2 className="w-4 h-4" />
      </button>
    </div>
  );
};
