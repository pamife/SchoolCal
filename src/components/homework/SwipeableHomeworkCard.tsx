import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Edit2, Trash2, Check, Sparkles } from 'lucide-react';
import type { Homework, Subject } from '../../types';
import { getRelativeDateLabel } from '../../utils/dateUtils';
import { Badge } from '../common/Badge';
import { haptics } from '../../utils/haptics';
import { useLongPress } from '../../hooks/useLongPress';

export interface SwipeableHomeworkCardProps {
  homework: Homework;
  subject?: Subject;
  onToggleComplete: (id: string) => void;
  onEdit: (homework: Homework) => void;
  onDelete: (id: string) => void;
  onLongPressOpen?: (homework: Homework) => void;
}

export const SwipeableHomeworkCard: React.FC<SwipeableHomeworkCardProps> = ({
  homework,
  subject,
  onToggleComplete,
  onEdit,
  onDelete,
  onLongPressOpen,
}) => {
  const isDone = homework.status === 'done';
  const relativeDate = getRelativeDateLabel(homework.dueDate);
  const isOverdue = relativeDate.includes('überfällig') && !isDone;

  const [dragOffset, setDragOffset] = useState(0);
  const x = useMotionValue(0);

  // Background action transforms based on drag x
  const completeBgOpacity = useTransform(x, [0, 40, 90], [0, 0.6, 1]);
  const completeScale = useTransform(x, [0, 60, 90], [0.8, 1, 1.15]);

  const deleteBgOpacity = useTransform(x, [-90, -40, 0], [1, 0.6, 0]);

  // Long press handler
  const longPressHandlers = useLongPress({
    delay: 450,
    triggerHaptic: true,
    onLongPress: () => {
      if (onLongPressOpen) {
        onLongPressOpen(homework);
      }
    },
    onClick: () => {
      // Normal click opens edit if not dragging
      if (Math.abs(x.get()) < 5) {
        onEdit(homework);
      }
    },
  });

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Swipe Right threshold to toggle complete
    if (offset > 75 || (offset > 40 && velocity > 300)) {
      haptics.success();
      onToggleComplete(homework.id);
    }
    // Left drag snapping is handled visually via action buttons
    setDragOffset(0);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden touch-pan-y select-none group">
      {/* Background Left: Green "Erledigt" reveal container */}
      <motion.div
        style={{ opacity: completeBgOpacity }}
        className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-start px-5 text-white font-bold text-sm shadow-inner"
      >
        <motion.div style={{ scale: completeScale }} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
          <span>{isDone ? 'Wieder öffnen' : 'Erledigt!'}</span>
        </motion.div>
      </motion.div>

      {/* Background Right: Action buttons reveal container (Edit & Delete) */}
      <motion.div
        style={{ opacity: deleteBgOpacity }}
        className="absolute inset-0 bg-gray-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-end px-3 gap-2"
      >
        {/* Edit Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            haptics.selection();
            onEdit(homework);
          }}
          className="w-10 h-10 rounded-xl bg-ios-blue text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
          title="Bearbeiten"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        {/* Delete Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            haptics.warning();
            onDelete(homework.id);
          }}
          className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
          title="Löschen"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Foreground Swipeable Card Surface */}
      <motion.div
        style={{ x }}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -110, right: 100 }}
        dragElastic={{ left: 0.15, right: 0.35 }}
        onDrag={(_, info) => setDragOffset(info.offset.x)}
        onDragEnd={handleDragEnd}
        {...longPressHandlers}
        className={`relative z-10 ios-card p-4 transition-shadow flex items-start justify-between gap-3 cursor-grab active:cursor-grabbing ${
          isDone
            ? 'opacity-55 bg-gray-50/70 dark:bg-ios-dark-secondary/50'
            : isOverdue
            ? 'border-red-500/30 bg-red-500/5'
            : 'hover:shadow-md bg-white dark:bg-ios-dark-card'
        }`}
      >
        {/* Left: Interactive Checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            haptics.success();
            onToggleComplete(homework.id);
          }}
          className="mt-0.5 text-gray-400 hover:text-ios-blue dark:hover:text-ios-blue transition-colors shrink-0 ios-press-active p-1 -m-1"
          title={isDone ? 'Als unerledigt markieren' : 'Als erledigt markieren'}
        >
          {isDone ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5 hover:scale-110 transition-transform" />
          )}
        </button>

        {/* Middle: Content */}
        <div className="flex-1 min-w-0 pointer-events-none">
          <div className="flex items-center gap-2">
            {subject && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white shrink-0 shadow-xs"
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
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {/* Due date badge */}
            <span
              className={`text-xs font-semibold flex items-center gap-1 ${
                isOverdue
                  ? 'text-red-600 dark:text-red-400 font-bold'
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

            {/* Auto / Manual Mode Badge */}
            {homework.dueDateSource?.isShifted ? (
              <Badge variant="amber" size="sm" className="flex items-center gap-1">
                <span>⚡ Frist verschoben (Ausfall)</span>
              </Badge>
            ) : homework.dueDateMode === 'AUTO' ? (
              <span
                className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                title="Automatisch anhand des Stundenplans berechnet"
              >
                <span>⚡ Auto</span>
              </span>
            ) : homework.dueDateMode === 'MANUAL' ? (
              <span
                className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                title="Manuell vom Benutzer festgelegt"
              >
                <span>✏️ Manuell</span>
              </span>
            ) : null}

            {subject && (
              <span className="text-[11px] text-gray-400 dark:text-gray-500 hidden xs:inline">
                {subject.name}
              </span>
            )}
          </div>
        </div>

        {/* Right edit button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            haptics.selection();
            onEdit(homework);
          }}
          className="p-2 -mr-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors shrink-0 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 active:scale-95"
          title="Bearbeiten"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
