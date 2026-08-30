import React from 'react';
import { format, isToday } from 'date-fns';
import { de } from 'date-fns/locale';
import { ScheduleEntry, CalendarEvent, Exam, Subject, Teacher, Room, Substitution } from '../../types';
import { getSubjectIcon, hexToRgba, getEventTypeBadge } from '../../utils/colorUtils';
import { Clock, MapPin, User, AlertCircle, Plus } from 'lucide-react';
import { Badge } from '../common/Badge';

interface DayViewProps {
  selectedDate: Date;
  scheduleEntries: ScheduleEntry[];
  events: CalendarEvent[];
  exams: Exam[];
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  substitutions: Substitution[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectExam: (exam: Exam) => void;
  onSelectScheduleEntry: (entry: ScheduleEntry) => void;
  onAddEventForDate: (date: Date) => void;
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
  onSelectEvent,
  onSelectExam,
  onSelectScheduleEntry,
  onAddEventForDate,
}) => {
  const jsDay = selectedDate.getDay();
  const dayOfWeek = jsDay === 0 ? 7 : jsDay;
  const dayIso = format(selectedDate, 'yyyy-MM-dd');

  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const roomMap = new Map(rooms.map(r => [r.id, r]));

  // School lessons for this day
  const dayLessons = scheduleEntries
    .filter(e => e.dayOfWeek === dayOfWeek)
    .sort((a, b) => a.period - b.period);

  // Events on this day
  const dayEvents = events.filter(e => e.startDate.startsWith(dayIso));

  // Exams on this day
  const dayExams = exams.filter(e => e.date === dayIso);

  return (
    <div className="space-y-4">
      {/* Date Header Pill */}
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

        {dayLessons.length === 0 ? (
          <div className="ios-card p-6 text-center text-sm text-gray-400">
            Kein Unterricht für diesen Tag eingetragen.
          </div>
        ) : (
          <div className="space-y-2">
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
                  onClick={() => onSelectScheduleEntry(entry)}
                  className={`ios-card p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-all hover:shadow-sm ${
                    isCancelled ? 'opacity-50 bg-red-500/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-ios-dark-secondary flex flex-col items-center justify-center font-bold text-xs text-gray-700 dark:text-gray-300">
                      <span>{entry.period}.</span>
                      <span className="text-[9px] font-normal text-gray-400">Std</span>
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
                        {isCancelled && (
                          <Badge variant="red" size="sm">
                            Entfall
                          </Badge>
                        )}
                        {subEntry && !isCancelled && (
                          <Badge variant="amber" size="sm">
                            Vertretung
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        <span>{entry.startTime} – {entry.endTime}</span>
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Personal / Afternoon Events */}
      {dayEvents.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1">
            Termine & Freizeit
          </div>
          <div className="space-y-2">
            {dayEvents.map((evt) => {
              const badge = getEventTypeBadge(evt.type);
              return (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="ios-card p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-8 rounded-full"
                      style={{ backgroundColor: evt.color || '#007AFF' }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{evt.title}</h4>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.bgColor} ${badge.textColor}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        <span>
                          {evt.allDay ? 'Ganztägig' : `${evt.startDate.slice(11, 16)} – ${evt.endDate.slice(11, 16)}`}
                        </span>
                        {evt.location && <span>📍 {evt.location}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
