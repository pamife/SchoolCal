import React from 'react';
import { format, isSameDay, isToday, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { ScheduleEntry, CalendarEvent, Exam, Subject, Teacher, Room, Substitution } from '../../types';
import { getSubjectIcon, hexToRgba } from '../../utils/colorUtils';
import { MapPin, User, Clock, AlertCircle } from 'lucide-react';

interface WeekViewProps {
  days: Date[];
  scheduleEntries: ScheduleEntry[];
  events: CalendarEvent[];
  exams: Exam[];
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  substitutions: Substitution[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectExam: (exam: Exam) => void;
  onSelectScheduleEntry: (entry: ScheduleEntry, date: Date) => void;
  onEmptySlotClick: (date: Date, hour: number) => void;
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
  onSelectEvent,
  onSelectExam,
  onSelectScheduleEntry,
  onEmptySlotClick,
}) => {
  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const roomMap = new Map(rooms.map(r => [r.id, r]));

  // Display Monday - Friday (or weekend if events exist)
  const displayDays = days.slice(0, 5); // Monday to Friday

  return (
    <div className="ios-card overflow-hidden flex flex-col">
      {/* Week Header: Day names & dates */}
      <div className="grid grid-cols-5 border-b border-black/5 dark:border-white/10 bg-gray-50/70 dark:bg-ios-dark-secondary/70">
        {displayDays.map((day) => {
          const isCurrentDay = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className={`p-2.5 sm:p-3 text-center border-r last:border-r-0 border-black/5 dark:border-white/5 ${
                isCurrentDay ? 'bg-blue-500/10' : ''
              }`}
            >
              <div
                className={`text-[11px] font-semibold uppercase tracking-wider ${
                  isCurrentDay ? 'text-ios-blue' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {format(day, 'EEE', { locale: de })}
              </div>
              <div
                className={`text-sm sm:text-base font-bold mt-0.5 inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full ${
                  isCurrentDay
                    ? 'bg-ios-blue text-white shadow-xs'
                    : 'text-gray-800 dark:text-gray-200'
                }`}
              >
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Body: 5 Columns for Mon - Fri */}
      <div className="grid grid-cols-5 min-h-[460px] divide-x divide-black/5 dark:divide-white/5 overflow-y-auto max-h-[calc(100vh-280px)] no-scrollbar p-1">
        {displayDays.map((day, dayIndex) => {
          const jsDay = day.getDay();
          const dayOfWeek = jsDay === 0 ? 7 : jsDay;
          const dayIso = format(day, 'yyyy-MM-dd');

          // School lessons for this day
          const dayLessons = scheduleEntries
            .filter(e => e.dayOfWeek === dayOfWeek)
            .sort((a, b) => a.period - b.period);

          // Events on this day
          const dayEvents = events.filter(e => e.startDate.startsWith(dayIso));

          // Exams on this day
          const dayExams = exams.filter(e => e.date === dayIso);

          return (
            <div key={day.toISOString()} className="p-1 space-y-1.5 flex flex-col">
              {/* Exams on top */}
              {dayExams.map((exam) => {
                const sub = subjectMap.get(exam.subjectId);
                return (
                  <div
                    key={exam.id}
                    onClick={() => onSelectExam(exam)}
                    className="p-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-bold cursor-pointer hover:scale-[1.02] transition-transform shadow-xs"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-red-500 font-extrabold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      Klausur ({exam.startTime || '08:00'})
                    </div>
                    <div className="truncate text-[11px] mt-0.5">{exam.title}</div>
                  </div>
                );
              })}

              {/* School timetable periods */}
              {dayLessons.map((entry) => {
                const subject = subjectMap.get(entry.subjectId);
                const subEntry = substitutions.find(
                  s => s.scheduleEntryId === entry.id && s.date === dayIso
                );

                const effectiveTeacherId = subEntry?.newTeacherId || entry.teacherId;
                const effectiveRoomId = subEntry?.newRoomId || entry.roomId;
                const teacher = effectiveTeacherId ? teacherMap.get(effectiveTeacherId) : undefined;
                const room = effectiveRoomId ? roomMap.get(effectiveRoomId) : undefined;

                const isCancelled = subEntry?.type === 'cancelled';
                const Icon = subject ? getSubjectIcon(subject.icon) : Clock;

                return (
                  <div
                    key={entry.id}
                    onClick={() => onSelectScheduleEntry(entry, day)}
                    style={{
                      borderLeftColor: subject?.color || '#007AFF',
                      borderLeftWidth: '3px',
                      backgroundColor: subject ? hexToRgba(subject.color, 0.08) : undefined,
                    }}
                    className={`p-1.5 rounded-lg border border-black/5 dark:border-white/5 text-left transition-all cursor-pointer hover:shadow-xs group ${
                      isCancelled ? 'opacity-50 line-through bg-red-500/5' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">{entry.period}. Std</span>
                      <span className="text-[9px]">{entry.startTime}</span>
                    </div>

                    <div className="font-bold text-xs text-gray-900 dark:text-white truncate mt-0.5 flex items-center gap-1">
                      {subject?.name || 'Unterricht'}
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-gray-500 dark:text-gray-400 mt-1">
                      <span className={subEntry?.newRoomId ? 'text-amber-500 font-bold' : ''}>
                        {room?.name?.replace('Raum ', 'R') || ''}
                      </span>
                      <span className={subEntry?.newTeacherId ? 'text-amber-500 font-bold' : ''}>
                        {teacher?.shortName || ''}
                      </span>
                    </div>

                    {subEntry && (
                      <div className="text-[9px] text-amber-600 dark:text-amber-400 font-bold mt-0.5 truncate">
                        {isCancelled ? '⚠️ Entfall' : '⚠️ Vertretung'}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Extra afternoon / evening events */}
              {dayEvents.map((evt) => {
                const sub = evt.subjectId ? subjectMap.get(evt.subjectId) : undefined;
                return (
                  <div
                    key={evt.id}
                    onClick={() => onSelectEvent(evt)}
                    style={{
                      borderLeftColor: evt.color || sub?.color || '#5856D6',
                      borderLeftWidth: '3px',
                    }}
                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 text-left cursor-pointer hover:shadow-xs"
                  >
                    <div className="text-[9px] font-semibold text-gray-500 dark:text-gray-400">
                      {evt.startDate.slice(11, 16)}
                    </div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {evt.title}
                    </div>
                  </div>
                );
              })}

              {/* Quick Add Button */}
              <button
                type="button"
                onClick={() => onEmptySlotClick(day, 14)}
                className="mt-auto py-1 text-[10px] text-gray-400 hover:text-ios-blue hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors text-center"
              >
                + Termin
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
