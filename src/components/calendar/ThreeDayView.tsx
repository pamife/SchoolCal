import React from 'react';
import { format, isToday, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { ScheduleEntry, CalendarEvent, Exam, Subject, Teacher, Room, Substitution } from '../../types';
import { getSubjectIcon, hexToRgba } from '../../utils/colorUtils';
import { Clock } from 'lucide-react';
import { haptics } from '../../utils/haptics';

interface ThreeDayViewProps {
  startDate: Date;
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
  onAddEventForDate: (date: Date) => void;
}

export const ThreeDayView: React.FC<ThreeDayViewProps> = ({
  startDate,
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
  onAddEventForDate,
}) => {
  const threeDays = [startDate, addDays(startDate, 1), addDays(startDate, 2)];
  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const roomMap = new Map(rooms.map(r => [r.id, r]));

  return (
    <div className="ios-card overflow-hidden flex flex-col">
      {/* 3-Day Header */}
      <div className="grid grid-cols-3 border-b border-black/5 dark:border-white/10 bg-gray-50/70 dark:bg-ios-dark-secondary/70">
        {threeDays.map((day) => {
          const isCurrent = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className={`p-3 text-center border-r last:border-r-0 border-black/5 dark:border-white/5 ${
                isCurrent ? 'bg-blue-500/10' : ''
              }`}
            >
              <div
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isCurrent ? 'text-ios-blue' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {format(day, 'EEEE', { locale: de })}
              </div>
              <div
                className={`text-lg font-bold mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-full ${
                  isCurrent
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

      {/* 3-Day Columns */}
      <div className="grid grid-cols-3 divide-x divide-black/5 dark:divide-white/5 p-2 min-h-[420px] max-h-[calc(100vh-280px)] overflow-y-auto no-scrollbar">
        {threeDays.map((day) => {
          const jsDay = day.getDay();
          const dayOfWeek = jsDay === 0 ? 7 : jsDay;
          const dayIso = format(day, 'yyyy-MM-dd');

          const dayLessons = scheduleEntries
            .filter(e => e.dayOfWeek === dayOfWeek)
            .sort((a, b) => a.period - b.period);

          const dayEvents = events.filter(e => e.startDate.startsWith(dayIso));
          const dayExams = exams.filter(e => e.date === dayIso);

          return (
            <div key={day.toISOString()} className="p-1.5 space-y-2 flex flex-col">
              {/* Exams */}
              {dayExams.map((exam) => (
                <div
                  key={exam.id}
                  onClick={() => {
                    haptics.selection();
                    onSelectExam(exam);
                  }}
                  className="p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-bold cursor-pointer hover:shadow-xs active:scale-95 transition-transform ios-press-active"
                >
                  <div className="text-[10px] text-red-500 uppercase tracking-wider">
                    Klausur ({exam.startTime || '08:00'})
                  </div>
                  <div className="truncate mt-0.5">{exam.title}</div>
                </div>
              ))}

              {/* School lessons */}
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

                return (
                  <div
                    key={entry.id}
                    onClick={() => {
                      haptics.selection();
                      onSelectScheduleEntry(entry, day);
                    }}
                    style={{
                      borderLeftColor: subject?.color || '#007AFF',
                      borderLeftWidth: '4px',
                      backgroundColor: subject ? hexToRgba(subject.color, 0.08) : undefined,
                    }}
                    className={`p-2 rounded-xl border border-black/5 dark:border-white/5 cursor-pointer hover:shadow-xs ios-press-active ${
                      isCancelled ? 'opacity-50 line-through bg-red-500/5' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                      <span className="font-bold">{entry.period}. Stunde</span>
                      <span>{entry.startTime}</span>
                    </div>
                    <div className="font-bold text-xs text-gray-900 dark:text-white mt-0.5 truncate">
                      {subject?.name || 'Unterricht'}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                      <span>{room?.name || ''}</span>
                      <span>{teacher?.shortName || ''}</span>
                    </div>
                  </div>
                );
              })}

              {/* Other events */}
              {dayEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  style={{
                    borderLeftColor: evt.color || '#5856D6',
                    borderLeftWidth: '4px',
                  }}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 cursor-pointer hover:shadow-xs"
                >
                  <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                    {evt.startDate.slice(11, 16)}
                  </div>
                  <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                    {evt.title}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => onAddEventForDate(day)}
                className="mt-auto py-1.5 text-xs text-gray-400 hover:text-ios-blue hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-center"
              >
                + Neuer Eintrag
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
