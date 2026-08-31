import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useExamStore } from '../../store/useExamStore';
import { useHomeworkStore } from '../../store/useHomeworkStore';
import { useAuthStore } from '../../store/useAuthStore';
import { SegmentedControl, type SegmentOption } from '../common/SegmentedControl';
import { Button } from '../common/Button';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { ThreeDayView } from './ThreeDayView';
import { MonthView } from './MonthView';
import { EventModal } from './EventModal';
import type { CalendarEvent, CalendarViewType, Exam, ScheduleEntry } from '../../types';
import { getWeekDays, formatGermanDate } from '../../utils/dateUtils';
import { generateIcsCalendar, downloadIcsFile } from '../../services/ical/icalService';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import { haptics } from '../../utils/haptics';

interface CalendarScreenProps {
  onSelectScheduleEntry: (entry: ScheduleEntry) => void;
  onSelectExam: (exam: Exam) => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  onSelectScheduleEntry,
  onSelectExam,
}) => {
  const { user } = useAuthStore();
  const {
    events,
    selectedDate,
    viewType,
    setViewType,
    goToToday,
    goToNext,
    goToPrevious,
    addEvent,
    updateEvent,
    deleteEvent,
  } = useCalendarStore();

  const { subjects, teachers, rooms, scheduleEntries, substitutions } = useSchoolStore();
  const { exams } = useExamStore();
  const { homework } = useHomeworkStore();

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [modalInitialDate, setModalInitialDate] = useState<Date>(selectedDate);

  const [direction, setDirection] = useState<number>(0);
  const prevDateRef = useRef<number>(selectedDate.getTime());
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const uid = user?.uid || '';

  const viewOptions: SegmentOption<CalendarViewType>[] = [
    { id: 'day', label: 'Tag' },
    { id: '3days', label: '3 Tage' },
    { id: 'week', label: 'Woche' },
    { id: 'month', label: 'Monat' },
  ];

  const weekDays = getWeekDays(selectedDate, true);

  let headerTitle = '';
  if (viewType === 'day') {
    headerTitle = formatGermanDate(selectedDate, 'EEEE, d. MMMM');
  } else if (viewType === '3days') {
    headerTitle = `${format(selectedDate, 'd. MMM')} – ${format(new Date(selectedDate.getTime() + 2 * 86400000), 'd. MMM yyyy')}`;
  } else if (viewType === 'week') {
    headerTitle = `${format(weekDays[0], 'd. MMM')} – ${format(weekDays[4], 'd. MMM yyyy')}`;
  } else {
    headerTitle = format(selectedDate, 'MMMM yyyy', { locale: de });
  }

  const handleOpenNewEvent = (date?: Date) => {
    setEditingEvent(null);
    setModalInitialDate(date || selectedDate);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (evt: CalendarEvent) => {
    setEditingEvent(evt);
    setIsEventModalOpen(true);
  };

  const handleExportIcs = () => {
    const icsContent = generateIcsCalendar({
      events,
      exams,
      homework,
      subjects,
      scheduleEntries,
      teachers,
      rooms,
    });
    downloadIcsFile(icsContent, `SchoolCal_${format(new Date(), 'yyyy-MM-dd')}.ics`);
  };

  const handlePrevious = () => {
    setDirection(-1);
    haptics.selection();
    goToPrevious();
  };

  const handleNext = () => {
    setDirection(1);
    haptics.selection();
    goToNext();
  };

  const handleToday = () => {
    const nowTime = Date.now();
    setDirection(nowTime > selectedDate.getTime() ? 1 : -1);
    haptics.light();
    goToToday();
  };

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
    minDistance: 40,
    velocityThreshold: 0.25,
    edgeThreshold: 20,
  });

  const slideVariants = {
    enter: (dir: number) => ({
      x: prefersReducedMotion ? 0 : dir > 0 ? 35 : -35,
      opacity: prefersReducedMotion ? 1 : 0.85,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: prefersReducedMotion ? 0 : dir > 0 ? -35 : 35,
      opacity: prefersReducedMotion ? 1 : 0.85,
    }),
  };

  const currentViewKey = `${viewType}-${format(selectedDate, 'yyyy-MM-dd')}`;

  return (
    <div className="space-y-4 pb-24 ipad:pb-10 max-w-5xl mx-auto">
      {/* Calendar Controls Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
        {/* Left: View selector */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <SegmentedControl
            options={viewOptions}
            value={viewType}
            onChange={(newView) => {
              haptics.selection();
              setViewType(newView);
            }}
            size="sm"
          />
        </div>

        {/* Right: Navigation & Action */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Previous / Today / Next Controls */}
          <div className="flex items-center bg-gray-100 dark:bg-ios-dark-secondary rounded-ios p-0.5 border border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={handlePrevious}
              className="p-1.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-ios-dark-card transition-colors active:scale-95"
              title="Vorheriger Zeitraum"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-ios-dark-card rounded-lg transition-colors active:scale-95"
            >
              Heute
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-ios-dark-card transition-colors active:scale-95"
              title="Nächster Zeitraum"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Export to Apple Calendar (.ics) */}
          <button
            type="button"
            onClick={handleExportIcs}
            className="p-2 bg-gray-100 dark:bg-ios-dark-secondary text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-ios-dark-tertiary rounded-ios transition-colors active:scale-95"
            title="In Apple Kalender / ICS exportieren"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Add Event Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenNewEvent()}
            icon={<Plus className="w-4 h-4" />}
          >
            Termin
          </Button>
        </div>
      </div>

      {/* Date Header Sub-Title */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white capitalize">
          {headerTitle}
        </h2>
        <span className="text-xs text-gray-400 font-medium hidden sm:inline">
          Tippe oder wische zum Blättern
        </span>
      </div>

      {/* View Render with Smooth Horizontal Swipe Gestures */}
      <div {...swipeHandlers} className="w-full min-w-0 touch-pan-y">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentViewKey}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 380,
              mass: 0.8,
            }}
            className="w-full min-w-0"
          >
            {viewType === 'week' && (
              <WeekView
                days={weekDays}
                scheduleEntries={scheduleEntries}
                events={events}
                exams={exams}
                subjects={subjects}
                teachers={teachers}
                rooms={rooms}
                substitutions={substitutions}
                onSelectEvent={handleEditEvent}
                onSelectExam={onSelectExam}
                onSelectScheduleEntry={(entry) => onSelectScheduleEntry(entry)}
                onEmptySlotClick={(date) => handleOpenNewEvent(date)}
              />
            )}

            {viewType === 'day' && (
              <DayView
                selectedDate={selectedDate}
                scheduleEntries={scheduleEntries}
                events={events}
                exams={exams}
                subjects={subjects}
                teachers={teachers}
                rooms={rooms}
                substitutions={substitutions}
                onSelectEvent={handleEditEvent}
                onSelectExam={onSelectExam}
                onSelectScheduleEntry={onSelectScheduleEntry}
                onAddEventForDate={handleOpenNewEvent}
              />
            )}

            {viewType === '3days' && (
              <ThreeDayView
                startDate={selectedDate}
                scheduleEntries={scheduleEntries}
                events={events}
                exams={exams}
                subjects={subjects}
                teachers={teachers}
                rooms={rooms}
                substitutions={substitutions}
                onSelectEvent={handleEditEvent}
                onSelectExam={onSelectExam}
                onSelectScheduleEntry={(entry) => onSelectScheduleEntry(entry)}
                onAddEventForDate={handleOpenNewEvent}
              />
            )}

            {viewType === 'month' && (
              <MonthView
                currentMonth={selectedDate}
                scheduleEntries={scheduleEntries}
                events={events}
                exams={exams}
                homework={homework}
                subjects={subjects}
                teachers={teachers}
                rooms={rooms}
                substitutions={substitutions}
                onSelectEvent={handleEditEvent}
                onSelectExam={onSelectExam}
                onSelectScheduleEntry={onSelectScheduleEntry}
                onAddEventForDate={handleOpenNewEvent}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={(evt) => {
          if (editingEvent) {
            updateEvent(uid, evt.id, evt);
          } else {
            addEvent(uid, evt);
          }
        }}
        onDelete={(id) => deleteEvent(uid, id)}
        initialEvent={editingEvent}
        initialDate={modalInitialDate}
        subjects={subjects}
      />
    </div>
  );
};
