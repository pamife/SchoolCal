import React from 'react';
import { Clock, MapPin, User, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { ScheduleEntry, Subject, Teacher, Room, Substitution } from '../../types';
import { getSubjectIcon } from '../../utils/colorUtils';
import { Badge } from '../common/Badge';

interface NextLessonHeroProps {
  currentEntry: ScheduleEntry | null;
  nextEntry: ScheduleEntry | null;
  subject: Subject | undefined;
  teacher: Teacher | undefined;
  room: Room | undefined;
  substitution: Substitution | undefined;
  statusText: string;
  minutesRemaining?: number;
  minutesUntilNext?: number;
  onOpenSchedule: () => void;
}

export const NextLessonHero: React.FC<NextLessonHeroProps> = ({
  currentEntry,
  nextEntry,
  subject,
  teacher,
  room,
  substitution,
  statusText,
  minutesRemaining,
  minutesUntilNext,
  onOpenSchedule,
}) => {
  const activeEntry = currentEntry || nextEntry;
  const isCurrentActive = Boolean(currentEntry);

  if (!activeEntry || !subject) {
    return (
      <div className="ios-card p-5 relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border-blue-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-ios-blue/15 text-ios-blue flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-ios-blue">
                Unterrichtsstatus
              </span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Aktuell kein Unterricht
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Freizeit, Pause oder Schultag beendet.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenSchedule}
            className="text-xs font-semibold text-ios-blue hover:underline"
          >
            Stundenplan ansehen →
          </button>
        </div>
      </div>
    );
  }

  const Icon = getSubjectIcon(subject.icon);
  const isCancelled = substitution?.type === 'cancelled';

  return (
    <div
      onClick={onOpenSchedule}
      className={`ios-card p-5 relative overflow-hidden cursor-pointer transition-all hover:shadow-ios-lg ${
        isCancelled
          ? 'border-red-500/30 bg-red-500/5'
          : isCurrentActive
          ? 'border-ios-blue/40 ring-1 ring-ios-blue/30 shadow-md'
          : 'hover:border-black/10 dark:hover:border-white/20'
      }`}
    >
      {/* Background Accent Glow */}
      <div
        className="absolute -right-12 -top-12 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: subject.color }}
      />

      {/* Top Row: Tag & Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: isCurrentActive ? '#34C759' : subject.color }}
          />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {isCurrentActive ? 'Jetzt im Unterricht' : 'Nächste Schulstunde'}
          </span>
          {isCurrentActive && minutesRemaining !== undefined && (
            <Badge variant="green" size="sm">
              Noch {minutesRemaining} Min
            </Badge>
          )}
          {!isCurrentActive && minutesUntilNext !== undefined && (
            <Badge variant="blue" size="sm">
              In {minutesUntilNext} Min
            </Badge>
          )}
        </div>

        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {activeEntry.period}. Stunde ({activeEntry.startTime} – {activeEntry.endTime})
          </span>
        </div>
      </div>

      {/* Main Row: Subject Info */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className="w-13 h-13 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{ backgroundColor: subject.color }}
          >
            <Icon className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight truncate flex items-center gap-2">
              <span className={isCancelled ? 'line-through text-gray-400 dark:text-gray-500' : ''}>
                {subject.name}
              </span>
              {isCancelled && (
                <Badge variant="red" size="sm">
                  Entfällt
                </Badge>
              )}
            </h2>

            {/* Room & Teacher Pills */}
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-600 dark:text-gray-300">
              {room && (
                <span className="inline-flex items-center gap-1 font-medium bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md">
                  <MapPin className="w-3 h-3 text-ios-blue" />
                  {substitution?.newRoomId ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      {room.name} (geändert!)
                    </span>
                  ) : (
                    room.name
                  )}
                </span>
              )}

              {teacher && (
                <span className="inline-flex items-center gap-1 font-medium bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md">
                  <User className="w-3 h-3 text-indigo-500" />
                  {substitution?.newTeacherId ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      {teacher.name} (Vertretung)
                    </span>
                  ) : (
                    teacher.name
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Substitution Alert Banner */}
      {substitution && (
        <div className="mt-3.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="font-bold">Vertretungshinweis: </span>
            <span>{substitution.note || 'Stundenplanänderung für diese Stunde.'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
