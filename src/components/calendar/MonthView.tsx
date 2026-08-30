import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { ScheduleEntry, CalendarEvent, Exam, Homework, Subject, Teacher, Room, Substitution } from '../../types';
import { DayView } from './DayView';

interface MonthViewProps {
  currentMonth: Date;
  scheduleEntries: ScheduleEntry[];
  events: CalendarEvent[];
  exams: Exam[];
  homework: Homework[];
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  substitutions: Substitution[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectExam: (exam: Exam) => void;
  onSelectScheduleEntry: (entry: ScheduleEntry) => void;
  onAddEventForDate: (date: Date) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentMonth,
  scheduleEntries,
  events,
  exams,
  homework,
  subjects,
  teachers,
  rooms,
  substitutions,
  onSelectEvent,
  onSelectExam,
  onSelectScheduleEntry,
  onAddEventForDate,
}) => {
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const monthDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDaysHeader = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  return (
    <div className="space-y-5">
      {/* Month Matrix Card */}
      <div className="ios-card p-3 sm:p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2 text-center">
          {weekDaysHeader.map((d) => (
            <div key={d} className="text-xs font-bold text-gray-400 dark:text-gray-500 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((day) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDay);
            const isCurrentDay = isToday(day);
            const dayIso = format(day, 'yyyy-MM-dd');

            // Count events and exams for dot indicators
            const hasExams = exams.some(e => e.date === dayIso);
            const hasEvents = events.some(e => e.startDate.startsWith(dayIso));
            const hasHomework = homework.some(h => h.dueDate === dayIso && h.status !== 'done');

            const jsDay = day.getDay();
            const dayOfWeek = jsDay === 0 ? 7 : jsDay;
            const hasLessons = isCurrentMonth && dayOfWeek <= 5 && scheduleEntries.some(e => e.dayOfWeek === dayOfWeek);

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`min-h-[52px] sm:min-h-[64px] p-1.5 rounded-2xl flex flex-col items-center justify-between transition-all relative ${
                  isSelected
                    ? 'bg-ios-blue text-white shadow-md'
                    : isCurrentDay
                    ? 'bg-blue-500/15 text-ios-blue dark:bg-blue-500/25 font-bold'
                    : isCurrentMonth
                    ? 'text-gray-800 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              >
                <span className="text-xs sm:text-sm font-semibold">
                  {format(day, 'd')}
                </span>

                {/* Dot Indicators */}
                <div className="flex items-center gap-1 mt-auto pb-1">
                  {hasExams && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-red-500'}`} />
                  )}
                  {hasHomework && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-500'}`} />
                  )}
                  {hasEvents && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`} />
                  )}
                  {hasLessons && !hasExams && !hasEvents && !hasHomework && (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-400/60'}`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda Detail View */}
      <div className="pt-2">
        <DayView
          selectedDate={selectedDay}
          scheduleEntries={scheduleEntries}
          events={events}
          exams={exams}
          subjects={subjects}
          teachers={teachers}
          rooms={rooms}
          substitutions={substitutions}
          onSelectEvent={onSelectEvent}
          onSelectExam={onSelectExam}
          onSelectScheduleEntry={onSelectScheduleEntry}
          onAddEventForDate={onAddEventForDate}
        />
      </div>
    </div>
  );
};
