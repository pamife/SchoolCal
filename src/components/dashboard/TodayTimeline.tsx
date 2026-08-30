import React from 'react';
import { Clock, MapPin, User, AlertCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { ScheduleEntry, Subject, Teacher, Room, Substitution } from '../../types';
import { getSubjectIcon } from '../../utils/colorUtils';
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
        <p className="text-xs text-gray-400 mt-1">Wochenende, Feiertag oder schulfreier Tag.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const subject = subjectMap.get(entry.subjectId);
        const substitution = substMap.get(entry.id);
        const effectiveTeacherId = substitution?.newTeacherId || entry.teacherId;
        const effectiveRoomId = substitution?.newRoomId || entry.roomId;

        const teacher = effectiveTeacherId ? teacherMap.get(effectiveTeacherId) : undefined;
        const room = effectiveRoomId ? roomMap.get(effectiveRoomId) : undefined;
        const isCurrent = entry.period === currentPeriodNumber;
        const isCancelled = substitution?.type === 'cancelled';
        const Icon = subject ? getSubjectIcon(subject.icon) : Clock;

        return (
          <div
            key={entry.id}
            onClick={() => onSelectEntry && onSelectEntry(entry)}
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
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-transform group-hover:scale-105 ${
                  isCurrent
                    ? 'bg-ios-blue text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-ios-dark-secondary text-gray-700 dark:text-gray-300'
                }`}
              >
                {entry.period}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                <div className="font-semibold text-gray-700 dark:text-gray-300">{entry.startTime}</div>
                <div>{entry.endTime}</div>
              </div>
            </div>

            {/* Middle: Subject, Teacher, Room, Substitution */}
            <div className="flex-1 min-w-0 flex items-center gap-2.5">
              {subject && (
                <div
                  className="w-2.5 h-7 rounded-full shrink-0"
                  style={{ backgroundColor: subject.color }}
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className={`text-sm font-bold text-gray-900 dark:text-white truncate ${isCancelled ? 'line-through' : ''}`}>
                    {subject?.name || 'Fach'}
                  </h4>
                  {isCancelled && (
                    <Badge variant="red" size="sm">
                      Entfall
                    </Badge>
                  )}
                  {substitution && !isCancelled && (
                    <Badge variant="amber" size="sm">
                      Vertretung
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                  {room && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className={substitution?.newRoomId ? 'text-amber-500 font-semibold' : ''}>
                        {room.name}
                      </span>
                    </span>
                  )}
                  {teacher && (
                    <span className="flex items-center gap-0.5">
                      <User className="w-3 h-3 text-gray-400" />
                      <span className={substitution?.newTeacherId ? 'text-amber-500 font-semibold' : ''}>
                        {teacher.shortName || teacher.name}
                      </span>
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
