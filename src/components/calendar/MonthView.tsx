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
import { ScheduleEntry, CalendarEvent, Exam, Homework, Subject, Teacher, Room, Substitution, Holiday } from '../../types';
import { DayView } from './DayView';
import { haptics } from '../../utils/haptics';
import { getDayHolidayInfo } from '../../data/holidays';

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
  holidays?: Holiday[];
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
  holidays = [],
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
        {/* Legend / Info Bar for Holidays & Vacations */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2 border-b border-black/5 dark:border-white/5 text-[11px]">
          <div className="flex items-center gap-3 font-semibold text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500/50" />
              <span>🏖️ Schulferien</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/30 border border-amber-500/50" />
              <span>🇩🇪 Feiertag</span>
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">
            Tippe auf einen Tag für Details
          </span>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2 text-center">
          {weekDaysHeader.map((d) => (
            <div key={d} className="text-xs font-bold text-gray-400 dark:text-gray-500 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 sm:gap-1">
          {monthDays.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDay);
            const isCurrentDay = isToday(day);
            const dayIso = format(day, 'yyyy-MM-dd');

            // Holiday & Vacation check
            const holidayInfo = getDayHolidayInfo(dayIso, holidays);
            const isVacation = holidayInfo.isVacation;
            const isPublicHoliday = holidayInfo.isPublicHoliday;

            // Connection checks for continuous vacation visual bar
            const prevDayIso = format(new Date(day.getTime() - 86400000), 'yyyy-MM-dd');
            const nextDayIso = format(new Date(day.getTime() + 86400000), 'yyyy-MM-dd');
            const prevIsVacation = isVacation && getDayHolidayInfo(prevDayIso, holidays).isVacation;
            const nextIsVacation = isVacation && getDayHolidayInfo(nextDayIso, holidays).isVacation;
            const dayOfWeekInGrid = idx % 7; // 0 = Mo, 6 = So
            const isRowStart = dayOfWeekInGrid === 0;
            const isRowEnd = dayOfWeekInGrid === 6;

            // Count events and exams for dot indicators
            const hasExams = exams.some(e => e.date === dayIso);
            const hasEvents = events.some(e => e.startDate.startsWith(dayIso));
            const hasHomework = homework.some(h => h.dueDate === dayIso && h.status !== 'done');

            const jsDay = day.getDay();
            const dayOfWeek = jsDay === 0 ? 7 : jsDay;
            const hasLessons = isCurrentMonth && !holidayInfo.isSchoolFree && dayOfWeek <= 5 && scheduleEntries.some(e => e.dayOfWeek === dayOfWeek);

            // Shape styling for continuous vacation
            let vacationShapeClass = '';
            if (isVacation && !isSelected) {
              if ((holidayInfo.isStart || isRowStart) && (holidayInfo.isEnd || isRowEnd)) {
                vacationShapeClass = 'rounded-xl';
              } else if (holidayInfo.isStart || isRowStart) {
                vacationShapeClass = 'rounded-l-xl rounded-r-none';
              } else if (holidayInfo.isEnd || isRowEnd) {
                vacationShapeClass = 'rounded-r-xl rounded-l-none';
              } else {
                vacationShapeClass = 'rounded-none';
              }
            } else {
              vacationShapeClass = 'rounded-xl';
            }

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => {
                  haptics.selection();
                  setSelectedDay(day);
                }}
                className={`min-h-[56px] sm:min-h-[66px] p-1.5 flex flex-col items-center justify-between transition-all relative ios-press-active ${vacationShapeClass} ${
                  isSelected
                    ? 'bg-ios-blue text-white shadow-md z-10'
                    : isCurrentDay
                    ? 'bg-blue-500/15 text-ios-blue dark:bg-blue-500/25 font-bold ring-2 ring-ios-blue/40'
                    : isPublicHoliday
                    ? 'bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/25 font-semibold'
                    : isVacation
                    ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-100 border-y border-emerald-500/20 font-medium'
                    : isCurrentMonth
                    ? 'text-gray-800 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              >
                <div className="w-full flex items-center justify-between px-0.5">
                  <span className="text-xs sm:text-sm font-semibold">
                    {format(day, 'd')}
                  </span>

                  {/* Holiday / Vacation Mini Icon */}
                  {isPublicHoliday && (
                    <span className="text-[10px]" title={holidayInfo.label}>
                      🇩🇪
                    </span>
                  )}
                  {isVacation && (holidayInfo.isStart || isRowStart) && (
                    <span className="text-[10px]" title={holidayInfo.label}>
                      🏖️
                    </span>
                  )}
                </div>

                {/* Vacation Label on Start Days */}
                {isVacation && (holidayInfo.isStart || isRowStart) && (
                  <div className="w-full truncate text-[8px] sm:text-[9px] font-bold text-emerald-700 dark:text-emerald-300 text-left px-0.5 leading-tight">
                    {holidayInfo.label}
                  </div>
                )}

                {/* Public Holiday Label */}
                {isPublicHoliday && (
                  <div className="w-full truncate text-[8px] sm:text-[9px] font-bold text-amber-700 dark:text-amber-300 text-left px-0.5 leading-tight">
                    {holidayInfo.label}
                  </div>
                )}

                {/* Dot Indicators */}
                <div className="flex items-center gap-1 mt-auto pb-0.5">
                  {hasExams && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-red-500'}`} title="Klausur" />
                  )}
                  {hasHomework && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-500'}`} title="Hausaufgabe" />
                  )}
                  {hasEvents && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`} title="Termin" />
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
          holidays={holidays}
          onSelectEvent={onSelectEvent}
          onSelectExam={onSelectExam}
          onSelectScheduleEntry={onSelectScheduleEntry}
          onAddEventForDate={onAddEventForDate}
        />
      </div>
    </div>
  );
};
