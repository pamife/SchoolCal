import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Calendar,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  User,
  MapPin,
  X,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useSearchStore } from '../../store/useSearchStore';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useHomeworkStore } from '../../store/useHomeworkStore';
import { useExamStore } from '../../store/useExamStore';
import { NavigationTab } from '../../types';
import { useKeyboardViewport } from '../../hooks/useKeyboardViewport';

interface GlobalSearchModalProps {
  onNavigateTab: (tab: NavigationTab) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  onNavigateTab,
}) => {
  const { isOpen, query, closeSearch, setQuery } = useSearchStore();
  const { isKeyboardOpen, keyboardHeight, viewportHeight } = useKeyboardViewport();
  const { subjects, teachers, rooms, scheduleEntries } = useSchoolStore();
  const { events } = useCalendarStore();
  const { homework } = useHomeworkStore();
  const { exams } = useExamStore();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useSearchStore.getState().openSearch();
      }
      if (e.key === 'Escape' && isOpen) {
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeSearch]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const q = query.toLowerCase().trim();

  // Search in subjects
  const matchedSubjects = q
    ? subjects.filter(
        s => s.name.toLowerCase().includes(q) || s.shortName.toLowerCase().includes(q)
      )
    : [];

  // Search in teachers
  const matchedTeachers = q
    ? teachers.filter(
        t =>
          t.name.toLowerCase().includes(q) ||
          t.shortName.toLowerCase().includes(q) ||
          t.email?.toLowerCase().includes(q)
      )
    : [];

  // Search in rooms
  const matchedRooms = q
    ? rooms.filter(
        r => r.name.toLowerCase().includes(q) || r.notes?.toLowerCase().includes(q)
      )
    : [];

  // Search in homework
  const matchedHomework = q
    ? homework.filter(
        h =>
          h.title.toLowerCase().includes(q) ||
          h.description?.toLowerCase().includes(q)
      )
    : [];

  // Search in exams
  const matchedExams = q
    ? exams.filter(
        e =>
          e.title.toLowerCase().includes(q) ||
          e.notes?.toLowerCase().includes(q) ||
          e.topics.some(t => t.title.toLowerCase().includes(q))
      )
    : [];

  // Search in events
  const matchedEvents = q
    ? events.filter(
        e =>
          e.title.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q)
      )
    : [];

  const hasResults =
    matchedSubjects.length > 0 ||
    matchedTeachers.length > 0 ||
    matchedRooms.length > 0 ||
    matchedHomework.length > 0 ||
    matchedExams.length > 0 ||
    matchedEvents.length > 0;

  const subjectMap = new Map(subjects.map(s => [s.id, s]));

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            bottom: isKeyboardOpen && keyboardHeight > 0 ? `${keyboardHeight}px` : 0,
          }}
          className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-[max(2.5rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] transition-[bottom] duration-150"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 350 }}
            style={{
              maxHeight: isKeyboardOpen ? `${Math.max(220, Math.floor(viewportHeight * 0.85))}px` : undefined,
            }}
            className="relative w-full max-w-xl bg-white dark:bg-ios-dark-card rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-black/10 dark:border-white/10 z-10 flex flex-col max-h-[80dvh]"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-white/10">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Fächer, Lehrer, Räume, Hausaufgaben, Klausuren suchen..."
                className="flex-1 bg-transparent text-sm sm:text-base font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold bg-gray-100 dark:bg-ios-dark-secondary rounded text-gray-400">
                  ESC
                </kbd>
              )}
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {!q && (
                <div className="py-8 text-center text-xs text-gray-400 space-y-1">
                  <p className="font-semibold text-gray-600 dark:text-gray-300">
                    Tippe einen Suchbegriff ein
                  </p>
                  <p>Beispiele: "Mathe", "Herr Schmidt", "Klausur", "Buch S. 42"</p>
                </div>
              )}

              {q && !hasResults && (
                <div className="py-8 text-center text-xs text-gray-400">
                  Keine Ergebnisse für "{query}" gefunden.
                </div>
              )}

              {/* 1. Subjects */}
              {matchedSubjects.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-1">
                    Schulfächer
                  </div>
                  <div className="space-y-1">
                    {matchedSubjects.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => {
                          onNavigateTab('school');
                          closeSearch();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                            style={{ backgroundColor: sub.color }}
                          >
                            {sub.shortName}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {sub.name}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Exams */}
              {matchedExams.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-red-500 mb-2 px-1">
                    Klausuren & Tests
                  </div>
                  <div className="space-y-1">
                    {matchedExams.map((exam) => {
                      const sub = subjectMap.get(exam.subjectId);
                      return (
                        <div
                          key={exam.id}
                          onClick={() => {
                            onNavigateTab('calendar');
                            closeSearch();
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <GraduationCap className="w-5 h-5 text-red-500" />
                            <div>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">
                                {exam.title}
                              </div>
                              <div className="text-xs text-gray-400">
                                {sub?.name} • Datum: {exam.date}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Homework */}
              {matchedHomework.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-ios-blue mb-2 px-1">
                    Hausaufgaben
                  </div>
                  <div className="space-y-1">
                    {matchedHomework.map((hw) => {
                      const sub = subjectMap.get(hw.subjectId);
                      return (
                        <div
                          key={hw.id}
                          onClick={() => {
                            onNavigateTab('tasks');
                            closeSearch();
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-5 h-5 text-ios-blue" />
                            <div>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">
                                {hw.title}
                              </div>
                              <div className="text-xs text-gray-400">
                                {sub?.name} • Fällig: {hw.dueDate}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Teachers */}
              {matchedTeachers.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 mb-2 px-1">
                    Lehrkräfte
                  </div>
                  <div className="space-y-1">
                    {matchedTeachers.map((teach) => (
                      <div
                        key={teach.id}
                        onClick={() => {
                          onNavigateTab('school');
                          closeSearch();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <User className="w-5 h-5 text-indigo-500" />
                          <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                              {teach.name} ({teach.shortName})
                            </div>
                            {teach.email && (
                              <div className="text-xs text-gray-400">{teach.email}</div>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Rooms */}
              {matchedRooms.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-teal-500 mb-2 px-1">
                    Räume
                  </div>
                  <div className="space-y-1">
                    {matchedRooms.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => {
                          onNavigateTab('school');
                          closeSearch();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin className="w-5 h-5 text-teal-500" />
                          <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                              {r.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {r.building || ''} {r.notes ? `• ${r.notes}` : ''}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Calendar Events */}
              {matchedEvents.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-purple-500 mb-2 px-1">
                    Termine
                  </div>
                  <div className="space-y-1">
                    {matchedEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => {
                          onNavigateTab('calendar');
                          closeSearch();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-5 h-5 text-purple-500" />
                          <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                              {evt.title}
                            </div>
                            <div className="text-xs text-gray-400">
                              {evt.startDate.slice(0, 10)} {evt.location ? `• 📍 ${evt.location}` : ''}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
