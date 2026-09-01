import React from 'react';
import { format, isToday } from 'date-fns';
import { de } from 'date-fns/locale';
import type {
  ScheduleEntry,
  CalendarEvent,
  Exam,
  Subject,
  Teacher,
  Room,
  Substitution,
  Holiday,
} from '../../types';
import { getSubjectIcon, hexToRgba } from '../../utils/colorUtils';
import { Badge } from '../common/Badge';
import { Clock, MapPin, User, Plus, AlertCircle, ChevronRight, Sparkles } from 'lucide-react';
import { haptics } from '../../utils/haptics';
import { getDayHolidayInfo } from '../../data/holidays';

interface DayViewProps {
  selectedDate: Date;
  scheduleEntries: ScheduleEntry[];
  events: CalendarEvent[];
  exams: Exam[];
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  substitutions: Substitution[];
  holidays?: Holiday[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectExam: (exam: Exam) => void;
  onSelectScheduleEntry: (entry: ScheduleEntry) => void;
  onAddEventForDate: (date: Date) => void;
}

interface GroupedDayLesson {
  entries: ScheduleEntry[];
  subject?: Subject;
  teacher?: Teacher;
  room?: Room;
  isCancelled: boolean;
  hasSubstitution: boolean;
  timeRange: string;
  periodLabel: string;
}

export const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  scheduleEntries,
  events,
  exams,
  subjects,
  teachers,
  rooms,
  substitutions,
  holidays = [],
  onSelectEvent,
  onSelectExam,
  onSelectScheduleEntry,
  onAddEventForDate,
}) => {
  const jsDay = selectedDate.getDay();
  const dayOfWeek = jsDay === 0 ? 7 : jsDay;
  const dayIso = format(selectedDate, 'yyyy-MM-dd');

  const holidayInfo = getDayHolidayInfo(dayIso, holidays);

  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const roomMap = new Map(rooms.map(r => [r.id, r]));
  const substMap = new Map(substitutions.map(s => [s.scheduleEntryId, s]));

  // Day specific items
  const dayLessons = scheduleEntries
    .filter(e => e.dayOfWeek === dayOfWeek)
    .sort((a, b) => a.period - b.period);

  const dayEvents = events.filter(e => e.startDate.startsWith(dayIso));
  const dayExams = exams.filter(e => e.date === dayIso);

  // Group consecutive lessons into Doppelstunden
  const groupedLessons: GroupedDayLesson[] = [];
  let i = 0;
  while (i < dayLessons.length) {
    const current = dayLessons[i];
    const next = dayLessons[i + 1];
    const subject = subjectMap.get(current.subjectId);

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
    const isCancelled = substitution?.type === 'cancelled';

    const periodLabel = isDouble ? `${current.period}. & ${next.period}. Std` : `${current.period}. Std`;
    const timeRange = isDouble ? `${current.startTime} – ${next.endTime}` : `${current.startTime} – ${current.endTime}`;

    groupedLessons.push({
      entries: groupEntries,
      subject,
      teacher,
      room,
      isCancelled,
      hasSubstitution: Boolean(substitution && !isCancelled),
      timeRange,
      periodLabel,
    });

    i += isDouble ? 2 : 1;
  }

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-gray-900 dark:text-white">
            {format(selectedDate, 'EEEE, d. MMMM yyyy', { locale: de })}
          </span>
          {isToday(selectedDate) && (
            <Badge variant="blue" size="sm">
              Heute
            </Badge>
          )}
        </div>

        <button
          type="button"
          onClick={() => onAddEventForDate(selectedDate)}
          className="text-xs font-semibold text-ios-blue hover:underline flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Eintrag hinzufügen
        </button>
      </div>

      {/* Holiday / Vacation Banner */}
      {holidayInfo.holiday && (
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-xs ${
            holidayInfo.isVacation
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-950 dark:text-emerald-100'
              : holidayInfo.isPublicHoliday
              ? 'bg-amber-500/10 border-amber-500/25 text-amber-950 dark:text-amber-100'
              : 'bg-purple-500/10 border-purple-500/25 text-purple-950 dark:text-purple-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">
              {holidayInfo.isVacation ? '🏖️' : holidayInfo.isPublicHoliday ? '🇩🇪' : '📅'}
            </span>
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                <span>{holidayInfo.label}</span>
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    holidayInfo.isVacation
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-200'
                      : holidayInfo.isPublicHoliday
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-200'
                      : 'bg-purple-500/20 text-purple-700 dark:text-purple-200'
                  }`}
                >
                  {holidayInfo.isVacation
                    ? 'Schulferien'
                    : holidayInfo.isPublicHoliday
                    ? 'Gesetzlicher Feiertag'
                    : 'Schulfrei'}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                {holidayInfo.isVacation
                  ? 'Keine Schule – Genieße deine Ferienzeit!'
                  : holidayInfo.isPublicHoliday
                  ? 'Schulfrei am gesetzlichen Feiertag.'
                  : 'Schulinterner freier Tag.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 1. Exams Section if any */}
      {dayExams.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5 px-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Prüfungen an diesem Tag
          </div>
          {dayExams.map((exam) => {
            const subject = subjectMap.get(exam.subjectId);
            return (
              <div
                key={exam.id}
                onClick={() => onSelectExam(exam)}
                className="ios-card p-4 border-l-4 border-red-500 bg-red-500/5 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {subject && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: subject.color }}
                      >
                        {subject.name}
                      </span>
                    )}
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{exam.title}</h4>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">
                    {exam.startTime || '08:00'} – {exam.endTime || '09:35'}
                  </span>
                </div>
                {exam.notes && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{exam.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 2. School Schedule Section */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1">
          Unterrichtsablauf
        </div>

        {holidayInfo.isSchoolFree ? (
          <div className="ios-card p-5 text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <div className="font-semibold text-gray-700 dark:text-gray-300">
              {holidayInfo.isVacation ? '🏖️ Schulfreier Ferientag' : '🇩🇪 Gesetzlicher Feiertag'}
            </div>
            <div className="text-xs text-gray-400">
              Heute findet kein regulärer Schulunterricht statt.
            </div>
          </div>
        ) : groupedLessons.length === 0 ? (
          <div className="ios-card p-6 text-center text-sm text-gray-400">
            Kein Unterricht für diesen Tag eingetragen.
          </div>
        ) : (
          <div className="space-y-2">
            {groupedLessons.map((grp, idx) => {
              const { entries: grpEntries, subject, teacher, room, isCancelled, hasSubstitution, timeRange, periodLabel } = grp;
              const isDouble = grpEntries.length > 1;
              const Icon = subject ? getSubjectIcon(subject.icon) : Clock;

              return (
                <div
                  key={grpEntries[0].id || idx}
                  onClick={() => {
                    haptics.selection();
                    onSelectScheduleEntry(grpEntries[0]);
                  }}
                  className={`ios-card p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-all hover:shadow-sm ios-press-active ${
                    isCancelled ? 'opacity-50 bg-red-500/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-ios-dark-secondary flex flex-col items-center justify-center font-bold text-xs text-gray-700 dark:text-gray-300">
                      <span>{periodLabel}</span>
                    </div>

                    {subject && (
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: subject.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold text-gray-900 dark:text-white ${isCancelled ? 'line-through' : ''}`}>
                          {subject?.name || 'Unterricht'}
                        </h4>
                        {isDouble && (
                          <span
                            style={{ backgroundColor: subject ? `${subject.color}25` : undefined, color: subject?.color || '#007AFF' }}
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
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        <span className="font-semibold">{timeRange}</span>
                        {room && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {room.name}
                          </span>
                        )}
                        {teacher && (
                          <span className="flex items-center gap-0.5">
                            <User className="w-3 h-3 text-gray-400" />
                            {teacher.shortName || teacher.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Personal Calendar Events Section */}
      {dayEvents.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1">
            Persönliche Termine & Ereignisse
          </div>
          <div className="space-y-2">
            {dayEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                style={{
                  backgroundColor: evt.color ? hexToRgba(evt.color, 0.08) : undefined,
                  borderLeftColor: evt.color || '#007AFF',
                  borderLeftWidth: '4px',
                }}
                className="ios-card p-3.5 flex items-center justify-between cursor-pointer hover:shadow-sm transition-all"
              >
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{evt.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>
                      {evt.allDay ? 'Ganztägig' : `${evt.startDate.slice(11, 16)} – ${evt.endDate.slice(11, 16)}`}
                    </span>
                    {evt.location && <span>• {evt.location}</span>}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
