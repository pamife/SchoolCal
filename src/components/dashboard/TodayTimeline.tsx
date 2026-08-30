import React from 'react';
import { Clock, MapPin, User, ChevronRight } from 'lucide-react';
import type { ScheduleEntry, Subject, Teacher, Room, Substitution } from '../../types';
import { Badge } from '../common/Badge';

interface TodayTimelineProps {
  entries: ScheduleEntry[];
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  substitutions: Substitution[];
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
}

export const TodayTimeline: React.FC<TodayTimelineProps> = ({
  entries,
  subjects,
  teachers,
  rooms,
  substitutions,
  currentPeriodNumber,
  onSelectEntry,
}) => {
  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const roomMap = new Map(rooms.map(r => [r.id, r]));
  const substMap = new Map(substitutions.map(s => [s.scheduleEntryId, s]));

  if (entries.length === 0) {
    return (
      <div className="ios-card p-6 text-center text-gray-500 dark:text-gray-400">
        <p className="text-sm font-medium">Heute steht kein planmäßiger Unterricht an.</p>
        <p className="text-xs text-gray-400 mt-1">Wochenende, Feiertag oder noch kein Stundenplan angelegt.</p>
      </div>
    );
  }

  // Group consecutive lessons of the same subject into Doppelstunden
  const groups: TimelineGroup[] = [];
  let i = 0;

  while (i < entries.length) {
    const current = entries[i];
    const next = entries[i + 1];
    const subject = subjectMap.get(current.subjectId);

    // Check if next lesson is directly following period and same subject
    const isDouble = Boolean(
      next &&
      next.period === current.period + 1 &&
      next.subjectId === current.subjectId
    );

    const groupEntries = isDouble ? [current, next] : [current];
    const substitution = substMap.get(current.id) || (next && substMap.get(next.id));
    const effectiveTeacherId = substitution?.newTeacherId || current.teacherId;
    const effectiveRoomId = substitution?.newRoomId || current.roomId;

    const teacher = effectiveTeacherId ? teacherMap.get(effectiveTeacherId) : undefined;
    const room = effectiveRoomId ? roomMap.get(effectiveRoomId) : undefined;
    const isCurrent = groupEntries.some(e => e.period === currentPeriodNumber);
    const isCancelled = substitution?.type === 'cancelled';

    const periodLabel = isDouble ? `${current.period}. & ${next.period}. Std` : `${current.period}. Std`;
    const timeRange = isDouble ? `${current.startTime} – ${next.endTime}` : `${current.startTime} – ${current.endTime}`;

    groups.push({
      entries: groupEntries,
      subject,
      teacher,
      room,
      isCurrent,
      isCancelled,
      hasSubstitution: Boolean(substitution && !isCancelled),
      timeRange,
      periodLabel,
    });

    i += isDouble ? 2 : 1;
  }

  return (
    <div className="space-y-2">
      {groups.map((group, idx) => {
        const { subject, teacher, room, isCurrent, isCancelled, hasSubstitution, timeRange, periodLabel, entries: grpEntries } = group;
        const isDouble = grpEntries.length > 1;

        return (
          <div
            key={grpEntries[0].id || idx}
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
                  <h4 className={`text-sm font-bold text-gray-900 dark:text-white truncate ${isCancelled ? 'line-through' : ''}`}>
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
        );
      })}
    </div>
  );
};
