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
import { Clock, Plus } from 'lucide-react';
import { haptics } from '../../utils/haptics';
import { getDayHolidayInfo } from '../../data/holidays';
import { isDoubleLessonAdjacent } from '../../utils/lessonGroupingEngine';

interface WeekViewProps {
  days: Date[];
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
  onSelectScheduleEntry: (entry: ScheduleEntry, date: Date) => void;
  onEmptySlotClick?: (date: Date) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  days,
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
  onEmptySlotClick,
}) => {
  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const roomMap = new Map(rooms.map(r => [r.id, r]));

  // Display Monday to Friday (5 school days)
  const schoolWeekDays = days.slice(0, 5);

  return (
    <div className="ios-card overflow-hidden">
      {/* Week grid header */}
      <div className="grid grid-cols-5 border-b border-black/5 dark:border-white/10 bg-gray-50/80 dark:bg-ios-dark-secondary/80">
        {schoolWeekDays.map((day) => {
          const isCurrentDay = isToday(day);
          const dayIso = format(day, 'yyyy-MM-dd');
          const holidayInfo = getDayHolidayInfo(dayIso, holidays);

          return (
            <div
              key={day.toISOString()}
              className={`p-2 sm:p-2.5 text-center border-r last:border-r-0 border-black/5 dark:border-white/5 transition-colors ${
                isCurrentDay ? 'bg-blue-500/10' : holidayInfo.isVacation ? 'bg-emerald-500/10' : holidayInfo.isPublicHoliday ? 'bg-amber-500/10' : ''
              }`}
            >
              <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {format(day, 'EEE', { locale: de })}
              </div>
              <div
                className={`text-sm sm:text-base font-bold mt-0.5 inline-flex w-7 h-7 sm:w-8 sm:h-8 items-center justify-center rounded-full ${
                  isCurrentDay
                    ? 'bg-ios-blue text-white shadow-xs'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {format(day, 'd')}
              </div>
              {holidayInfo.isVacation && (
                <div className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 truncate mt-0.5">
                  🏖️ Ferien
                </div>
              )}
              {holidayInfo.isPublicHoliday && (
                <div className="text-[9px] font-bold text-amber-700 dark:text-amber-300 truncate mt-0.5">
                  🇩🇪 Feiertag
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Week Columns */}
      <div className="grid grid-cols-5 min-h-[460px] divide-x divide-black/5 dark:divide-white/5">
        {schoolWeekDays.map((day) => {
          const jsDay = day.getDay();
          const dayOfWeek = jsDay === 0 ? 7 : jsDay;
          const dayIso = format(day, 'yyyy-MM-dd');
          const holidayInfo = getDayHolidayInfo(dayIso, holidays);

          // School lessons sorted by period (only if not school free)
          const dayLessons = holidayInfo.isSchoolFree
            ? []
            : scheduleEntries
                .filter(e => e.dayOfWeek === dayOfWeek)
                .sort((a, b) => a.period - b.period);

          // Events on this day
          const dayEvents = events.filter(e => e.startDate.startsWith(dayIso));

          // Exams on this day
          const dayExams = exams.filter(e => e.date === dayIso);

          return (
            <div
              key={day.toISOString()}
              className={`p-1.5 sm:p-2 space-y-1.5 flex flex-col justify-start relative group/col min-h-full ${
                holidayInfo.isVacation ? 'bg-emerald-500/5' : holidayInfo.isPublicHoliday ? 'bg-amber-500/5' : ''
              }`}
            >
              {/* Holiday Banner in Column */}
              {holidayInfo.holiday && (
                <div
                  className={`p-1.5 rounded-lg border text-xs font-bold ${
                    holidayInfo.isVacation
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                      : holidayInfo.isPublicHoliday
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-200'
                      : 'bg-purple-500/15 border-purple-500/30 text-purple-800 dark:text-purple-200'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[10px]">
                    <span>{holidayInfo.isVacation ? '🏖️' : holidayInfo.isPublicHoliday ? '🇩🇪' : '📅'}</span>
                    <span className="truncate">{holidayInfo.label}</span>
                  </div>
                  <div className="text-[9px] font-medium opacity-80 mt-0.5">
                    Schulfrei
                  </div>
                </div>
              )}

              {/* Exams banner */}
              {dayExams.map((exam) => (
                <div
                  key={exam.id}
                  onClick={() => {
                    haptics.selection();
                    onSelectExam(exam);
                  }}
                  className="p-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-bold cursor-pointer hover:scale-[1.02] active:scale-95 transition-transform shadow-xs ios-press-active"
                >
                  <div className="text-[10px] uppercase tracking-wider text-red-500 font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Klausur ({exam.startTime || '08:00'})
                  </div>
                  <div className="truncate text-[11px] mt-0.5">{exam.title}</div>
                </div>
              ))}

              {/* School timetable periods with Doppelstunden connection */}
              {dayLessons.map((entry, idx) => {
                const subject = subjectMap.get(entry.subjectId);
                const subEntry = substitutions.find(
                  s => s.scheduleEntryId === entry.id && s.date === dayIso
                );

                const prevEntry = dayLessons[idx - 1];
                const nextEntry = dayLessons[idx + 1];

                const isConnectedWithPrev = Boolean(
                  prevEntry && isDoubleLessonAdjacent(prevEntry, entry, subjectMap)
                );

                const isConnectedWithNext = Boolean(
                  nextEntry && isDoubleLessonAdjacent(entry, nextEntry, subjectMap)
                );

                const effectiveTeacherId = subEntry?.newTeacherId || entry.teacherId;
                const effectiveRoomId = subEntry?.newRoomId || entry.roomId;
                const teacher = effectiveTeacherId ? teacherMap.get(effectiveTeacherId) : undefined;
                const room = effectiveRoomId ? roomMap.get(effectiveRoomId) : undefined;

                const isCancelled = subEntry?.type === 'cancelled';

                return (
                  <div
                    key={entry.id}
                    onClick={() => {
                      haptics.selection();
                      onSelectScheduleEntry(entry, day);
                    }}
                    style={{
                      borderLeftColor: subject?.color || '#007AFF',
                      borderLeftWidth: '3px',
                      backgroundColor: subject ? hexToRgba(subject.color, 0.08) : undefined,
                    }}
                    className={`p-1.5 border border-black/5 dark:border-white/5 text-left transition-all cursor-pointer hover:shadow-xs group ios-press-active ${
                      isConnectedWithPrev && isConnectedWithNext
                        ? 'rounded-none border-t-0 border-b-0 -mt-1.5'
                        : isConnectedWithPrev
                        ? 'rounded-t-none rounded-b-lg border-t-0 -mt-1.5'
                        : isConnectedWithNext
                        ? 'rounded-b-none rounded-t-lg border-b-0'
                        : 'rounded-lg'
                    } ${isCancelled ? 'opacity-50 line-through bg-red-500/5' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">{entry.period}. Std</span>
                      <span className="text-[9px]">{entry.startTime}</span>
                    </div>

                    <div className="font-bold text-xs text-gray-900 dark:text-white truncate mt-0.5 flex items-center justify-between gap-1">
                      <span>{subject?.name || 'Unterricht'}</span>
                      {isConnectedWithNext && (
                        <span className="text-[8px] font-extrabold px-1 rounded bg-black/10 dark:bg-white/10 uppercase">
                          2 Std
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-gray-500 dark:text-gray-400 mt-1">
                      <span className={subEntry?.newRoomId ? 'text-amber-500 font-bold' : ''}>
                        {room?.name?.replace('Raum ', 'R') || ''}
                      </span>
                      <span className={subEntry?.newTeacherId ? 'text-amber-500 font-bold' : ''}>
                        {teacher?.shortName || ''}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Personal / Calendar Events */}
              {dayEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  style={{
                    backgroundColor: evt.color ? hexToRgba(evt.color, 0.15) : undefined,
                    borderLeftColor: evt.color || '#007AFF',
                    borderLeftWidth: '3px',
                  }}
                  className="p-1.5 rounded-lg border border-black/5 dark:border-white/5 text-left text-xs font-semibold text-gray-900 dark:text-white cursor-pointer hover:shadow-xs"
                >
                  <div className="text-[9px] text-gray-500">
                    {evt.allDay ? 'Ganztägig' : evt.startDate.slice(11, 16)}
                  </div>
                  <div className="truncate text-[11px] font-bold">{evt.title}</div>
                </div>
              ))}

              {/* Empty slot adder hover button */}
              {dayLessons.length === 0 && dayEvents.length === 0 && dayExams.length === 0 && (
                <div
                  onClick={() => onEmptySlotClick && onEmptySlotClick(day)}
                  className="flex-1 flex flex-col items-center justify-center p-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-300 dark:text-gray-600 hover:border-ios-blue hover:text-ios-blue cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4 mb-1" />
                  <span className="text-[10px] font-medium">Frei</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
