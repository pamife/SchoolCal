import React from 'react';
import { Clock, MapPin, User, ChevronRight, Coffee } from 'lucide-react';
import type { ScheduleEntry, Subject, Teacher, Room, Substitution, ScheduleBreak } from '../../types';
import { Badge } from '../common/Badge';
import { useSchoolConfigStore } from '../../store/useSchoolConfigStore';
import { groupScheduleEntries } from '../../utils/lessonGroupingEngine';

interface TodayTimelineProps {
  entries: ScheduleEntry[];
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  substitutions: Substitution[];
  breaks?: ScheduleBreak[];
  currentPeriodNumber?: number;
  onSelectEntry?: (entry: ScheduleEntry) => void;
}

interface TimelineGroup {
  entries: ScheduleEntry[];
  subject?: Subject;
  teacher?: Teacher;
  room?: Room;
  isCurrent: boolean;
  isCancelled: boolean;
  hasSubstitution: boolean;
  timeRange: string;
  periodLabel: string;
  lastPeriod: number;
}

export const TodayTimeline: React.FC<TodayTimelineProps> = ({
  entries,
  subjects,
  teachers,
  rooms,
  substitutions,
  breaks: propBreaks,
  currentPeriodNumber,
  onSelectEntry,
}) => {
  const storeBreaks = useSchoolConfigStore((state) => state.breaks);
  const breaks = propBreaks || storeBreaks;

  if (entries.length === 0) {
    return (
      <div className="ios-card p-6 text-center text-gray-500 dark:text-gray-400">
        <p className="text-sm font-medium">Heute steht kein planmäßiger Unterricht an.</p>
        <p className="text-xs text-gray-400 mt-1">Wochenende, Feiertag oder noch kein Stundenplan angelegt.</p>
      </div>
    );
  }

  const groupedLessons = groupScheduleEntries({
    entries,
    subjects,
    substitutions,
    teachers,
    rooms,
  });

  return (
    <div className="space-y-2">
      {groupedLessons.map((group, idx) => {
        const {
          subject,
          teacher,
          room,
          isDouble,
          isCancelled,
          hasSubstitution,
          timeRange,
          periodLabel,
          entries: grpEntries,
          endPeriod,
        } = group;

        const isCurrent = grpEntries.some((e) => e.period === currentPeriodNumber);

        // Check if there is a break right after this group
        const matchingBreak = breaks.find((b) => b.afterPeriod === endPeriod);

        return (
          <React.Fragment key={grpEntries[0].id || idx}>
            <div
              onClick={() => onSelectEntry && onSelectEntry(grpEntries[0])}
              className={`ios-card p-3.5 transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                isCancelled
                  ? 'opacity-60 bg-red-500/5 border-red-500/20'
                  : isCurrent
                  ? 'border-ios-blue ring-1 ring-ios-blue/40 shadow-sm bg-blue-500/5'
                  : 'hover:border-black/10 dark:hover:border-white/20'
              }`}
            >
              {/* Left: Period Number & Time */}
              <div className="flex items-center gap-3 shrink-0">
                <div
                  className={`px-2 py-1.5 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition-transform group-hover:scale-105 ${
                    isCurrent
                      ? 'bg-ios-blue text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-ios-dark-secondary text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span>{periodLabel}</span>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">
                  {timeRange}
                </div>
              </div>

              {/* Middle: Subject, Teacher, Room, Badges */}
              <div className="flex-1 min-w-0 flex items-center gap-2.5">
                {subject && (
                  <div
                    className="w-2.5 h-8 rounded-full shrink-0"
                    style={{ backgroundColor: subject.color }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm font-bold text-gray-900 dark:text-white truncate ${
                        isCancelled ? 'line-through' : ''
                      }`}
                    >
                      {subject?.name || 'Fach'}
                    </h4>

                    {isDouble && (
                      <span
                        style={{
                          backgroundColor: subject ? `${subject.color}25` : undefined,
                          color: subject?.color || '#007AFF',
                        }}
                        className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full uppercase"
                      >
                        Doppelstunde
                      </span>
                    )}

                    {isCancelled && (
                      <Badge variant="red" size="sm">
                        Entfall
                      </Badge>
                    )}
                    {hasSubstitution && (
                      <Badge variant="amber" size="sm">
                        Vertretung
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                    {room && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>{room.name}</span>
                      </span>
                    )}
                    {teacher && (
                      <span className="flex items-center gap-0.5">
                        <User className="w-3 h-3 text-gray-400" />
                        <span>{teacher.shortName || teacher.name}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right indicator */}
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-transform group-hover:translate-x-0.5" />
            </div>

            {/* Break Banner between lessons if configured */}
            {matchingBreak && idx < groupedLessons.length - 1 && (
              <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 font-medium">
                <div className="flex items-center gap-2 font-bold">
                  <Coffee className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    {matchingBreak.name} ({matchingBreak.startTime} – {matchingBreak.endTime})
                  </span>
                </div>
                <span className="text-[10px] text-amber-600/80 font-semibold uppercase tracking-wider">
                  nach {endPeriod}. Std
                </span>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
