import React, { useState } from 'react';
import {
  BookOpen,
  User,
  MapPin,
  RefreshCw,
  Plus,
  Download,
  Edit2,
  Clock,
  Coffee,
} from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { SegmentedControl, type SegmentOption } from '../common/SegmentedControl';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { getSubjectIcon, hexToRgba } from '../../utils/colorUtils';
import { exportScheduleCsv } from '../../services/export/dataExportService';
import { ScheduleEntryModal } from './ScheduleEntryModal';
import { SubstitutionModal } from './SubstitutionModal';
import { SubjectModal } from './SubjectModal';
import { TeacherModal } from './TeacherModal';
import { RoomModal } from './RoomModal';
import { PeriodTimesModal } from './PeriodTimesModal';
import { EmptyState } from '../common/EmptyState';
import type { Subject, Teacher, Room, ScheduleEntry, Substitution, SchedulePeriodTime, ScheduleBreak } from '../../types';
import { DEFAULT_PERIOD_TIMES } from '../../data/mockData';

type SchoolSubTab = 'schedule' | 'subjects' | 'teachers' | 'rooms' | 'substitutions';

export const SchoolScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { settings, updateSettings } = useSettingsStore();
  const {
    subjects,
    teachers,
    rooms,
    scheduleEntries,
    substitutions,
    addSubject,
    updateSubject,
    deleteSubject,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addRoom,
    updateRoom,
    deleteRoom,
    addScheduleEntry,
    updateScheduleEntry,
    deleteScheduleEntry,
    addSubstitution,
    updateSubstitution,
    deleteSubstitution,
  } = useSchoolStore();

  const [activeTab, setActiveTab] = useState<SchoolSubTab>('schedule');

  // Modal states
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ScheduleEntry | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState(1);

  const [isSubstModalOpen, setIsSubstModalOpen] = useState(false);
  const [selectedSubst, setSelectedSubst] = useState<Substitution | null>(null);

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [isPeriodTimesModalOpen, setIsPeriodTimesModalOpen] = useState(false);

  const uid = user?.uid || '';

  const tabs: SegmentOption<SchoolSubTab>[] = [
    { id: 'schedule', label: 'Stundenplan' },
    { id: 'subjects', label: `Fächer (${subjects.length})` },
    { id: 'teachers', label: `Lehrer (${teachers.length})` },
    { id: 'rooms', label: `Räume (${rooms.length})` },
    { id: 'substitutions', label: `Vertretungen (${substitutions.length})` },
  ];

  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const roomMap = new Map(rooms.map(r => [r.id, r]));

  const days = [
    { id: 1, name: 'Montag', short: 'Mo' },
    { id: 2, name: 'Dienstag', short: 'Di' },
    { id: 3, name: 'Mittwoch', short: 'Mi' },
    { id: 4, name: 'Donnerstag', short: 'Do' },
    { id: 5, name: 'Freitag', short: 'Fr' },
  ];

  const periodTimes: SchedulePeriodTime[] =
    settings.periodTimes && settings.periodTimes.length > 0
      ? settings.periodTimes
      : DEFAULT_PERIOD_TIMES;

  const breaks: ScheduleBreak[] = settings.breaks || [];

  const handleCellClick = (dayId: number, periodNum: number) => {
    const existing = scheduleEntries.find(e => e.dayOfWeek === dayId && e.period === periodNum);
    setSelectedEntry(existing || null);
    setSelectedDay(dayId);
    setSelectedPeriod(periodNum);
    setIsScheduleModalOpen(true);
  };

  const handleSaveScheduleEntry = async (entry: ScheduleEntry, isDoubleLesson?: boolean) => {
    if (selectedEntry) {
      await updateScheduleEntry(uid, entry.id, entry);
    } else {
      await addScheduleEntry(uid, entry);
      // If user selected double lesson, also add next period
      if (isDoubleLesson) {
        const nextPeriodNum = entry.period + 1;
        const nextPeriodInfo = periodTimes.find(p => p.period === nextPeriodNum);
        const secondEntry: ScheduleEntry = {
          ...entry,
          id: `sch-${entry.dayOfWeek}-${nextPeriodNum}-${Date.now()}`,
          period: nextPeriodNum,
          startTime: nextPeriodInfo?.startTime || '08:50',
          endTime: nextPeriodInfo?.endTime || '09:35',
        };
        await addScheduleEntry(uid, secondEntry);
      }
    }
  };

  const handleSavePeriodTimes = async (
    newPeriods: SchedulePeriodTime[],
    newBreaks: ScheduleBreak[]
  ) => {
    await updateSettings({ periodTimes: newPeriods, breaks: newBreaks }, uid);
  };

  const handleExportCsv = () => {
    exportScheduleCsv(scheduleEntries, subjects, teachers, rooms);
  };

  return (
    <div className="space-y-4 pb-24 ipad:pb-10 max-w-5xl mx-auto">
      {/* Subtab Navigator & Global Actions */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar pb-1 px-1">
        <SegmentedControl
          options={tabs}
          value={activeTab}
          onChange={setActiveTab}
          size="sm"
        />

        {/* Tab specific primary action button */}
        {activeTab === 'schedule' && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsPeriodTimesModalOpen(true)}
              className="p-2 bg-gray-100 dark:bg-ios-dark-secondary text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-ios-dark-tertiary rounded-ios transition-colors text-xs font-semibold flex items-center gap-1.5"
              title="Glockenzeiten & Pausen anpassen"
            >
              <Clock className="w-4 h-4 text-ios-blue" />
              <span className="hidden sm:inline">Zeitplan</span>
            </button>

            {scheduleEntries.length > 0 && (
              <button
                type="button"
                onClick={handleExportCsv}
                className="p-2 bg-gray-100 dark:bg-ios-dark-secondary text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-ios-dark-tertiary rounded-ios transition-colors text-xs font-semibold flex items-center gap-1.5"
                title="Als CSV herunterladen"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">CSV Export</span>
              </button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedEntry(null);
                setSelectedDay(1);
                setSelectedPeriod(1);
                setIsScheduleModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              Stunde
            </Button>
          </div>
        )}

        {activeTab === 'subjects' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedSubject(null);
              setIsSubjectModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Fach
          </Button>
        )}

        {activeTab === 'teachers' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedTeacher(null);
              setIsTeacherModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Lehrkraft
          </Button>
        )}

        {activeTab === 'rooms' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedRoom(null);
              setIsRoomModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Raum
          </Button>
        )}

        {activeTab === 'substitutions' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedSubst(null);
              setIsSubstModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Vertretung
          </Button>
        )}
      </div>

      {/* 1. STUNDENPLAN MATRIX VIEW */}
      {activeTab === 'schedule' && (
        <div className="ios-card overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[640px]">
              {/* Header row */}
              <div className="grid grid-cols-6 border-b border-black/5 dark:border-white/10 bg-gray-50/70 dark:bg-ios-dark-secondary/70">
                <div className="p-3 text-center text-xs font-bold text-gray-400 dark:text-gray-500 border-r border-black/5 dark:border-white/5">
                  Zeit
                </div>
                {days.map((day) => (
                  <div
                    key={day.id}
                    className="p-3 text-center text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 border-r last:border-r-0 border-black/5 dark:border-white/5"
                  >
                    {day.name}
                  </div>
                ))}
              </div>

              {/* Rows for periods */}
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {periodTimes.map((periodInfo) => {
                  const periodNum = periodInfo.period;
                  const matchingBreaks = breaks.filter(b => b.afterPeriod === periodNum);

                  return (
                    <React.Fragment key={periodNum}>
                      <div className="grid grid-cols-6 items-stretch min-h-[72px]">
                        {/* Period & Time column */}
                        <div className="p-2 flex flex-col items-center justify-center border-r border-black/5 dark:border-white/5 bg-gray-50/40 dark:bg-ios-dark-secondary/40">
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            {periodNum}. Std
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {periodInfo.startTime}–{periodInfo.endTime}
                          </span>
                        </div>

                        {/* 5 Day Cells */}
                        {days.map((day) => {
                          const entry = scheduleEntries.find(
                            e => e.dayOfWeek === day.id && e.period === periodNum
                          );
                          const prevEntry = scheduleEntries.find(
                            e => e.dayOfWeek === day.id && e.period === periodNum - 1
                          );
                          const nextEntry = scheduleEntries.find(
                            e => e.dayOfWeek === day.id && e.period === periodNum + 1
                          );

                          const subject = entry ? subjectMap.get(entry.subjectId) : undefined;
                          const teacher = entry?.teacherId ? teacherMap.get(entry.teacherId) : undefined;
                          const room = entry?.roomId ? roomMap.get(entry.roomId) : undefined;

                          // Doppelstunden-Erkennung (gleiches Fach vorher / nachher)
                          const isConnectedWithPrev = Boolean(
                            entry && prevEntry && entry.subjectId === prevEntry.subjectId
                          );
                          const isConnectedWithNext = Boolean(
                            entry && nextEntry && entry.subjectId === nextEntry.subjectId
                          );

                          return (
                            <div
                              key={day.id}
                              onClick={() => handleCellClick(day.id, periodNum)}
                              className={`p-1.5 border-r last:border-r-0 border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex flex-col justify-center ${
                                isConnectedWithPrev ? 'pt-0' : ''
                              } ${isConnectedWithNext ? 'pb-0' : ''}`}
                            >
                              {entry && subject ? (
                                <div
                                  style={{
                                    borderLeftColor: subject.color,
                                    borderLeftWidth: '3px',
                                    backgroundColor: hexToRgba(subject.color, 0.08),
                                  }}
                                  className={`p-2 border border-black/5 dark:border-white/5 h-full flex flex-col justify-between transition-all ${
                                    isConnectedWithPrev && isConnectedWithNext
                                      ? 'rounded-none border-t-0 border-b-0 -mt-1.5 -mb-1.5'
                                      : isConnectedWithPrev
                                      ? 'rounded-t-none rounded-b-lg border-t-0 -mt-1.5'
                                      : isConnectedWithNext
                                      ? 'rounded-b-none rounded-t-lg border-b-0 -mb-1.5'
                                      : 'rounded-lg'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                                      {subject.name}
                                    </span>
                                    {isConnectedWithNext && (
                                      <span
                                        style={{ backgroundColor: hexToRgba(subject.color, 0.2), color: subject.color }}
                                        className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase"
                                      >
                                        Doppelstunde
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                                    <span>{room?.name?.replace('Raum ', 'R') || ''}</span>
                                    <span>{teacher?.shortName || ''}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-full rounded-lg border border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center text-[10px] text-gray-300 dark:text-gray-600 hover:border-ios-blue hover:text-ios-blue transition-colors">
                                  +
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Render Break Row if a break is scheduled after this period */}
                      {matchingBreaks.map((b) => (
                        <div
                          key={b.id}
                          className="grid grid-cols-6 items-center bg-amber-500/10 dark:bg-amber-500/5 border-y border-amber-500/20 py-1.5 px-3 text-[11px] font-semibold text-amber-700 dark:text-amber-400"
                        >
                          <div className="text-center font-bold flex items-center justify-center gap-1">
                            <Coffee className="w-3 h-3 text-amber-500" />
                            <span>{b.startTime}–{b.endTime}</span>
                          </div>
                          <div className="col-span-5 text-center sm:text-left sm:pl-4">
                            {b.name}
                          </div>
                        </div>
                      ))}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. FÄCHER LIST VIEW */}
      {activeTab === 'subjects' && (
        <div>
          {subjects.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-8 h-8 text-ios-blue" />}
              title="Noch keine Schulfächer angelegt"
              description="Lege deine Schulfächer wie Mathe, Deutsch oder Englisch mit eigener Farbe an."
              actionLabel="Erstes Fach erstellen"
              onAction={() => {
                setSelectedSubject(null);
                setIsSubjectModalOpen(true);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {subjects.map((sub) => {
                const Icon = getSubjectIcon(sub.icon);
                const teacher = sub.teacherId ? teacherMap.get(sub.teacherId) : undefined;
                const room = sub.defaultRoomId ? roomMap.get(sub.defaultRoomId) : undefined;
                const countLessons = scheduleEntries.filter(e => e.subjectId === sub.id).length;

                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubject(sub);
                      setIsSubjectModalOpen(true);
                    }}
                    className="ios-card p-4 flex items-start justify-between gap-3 cursor-pointer hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: sub.color }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {sub.name}
                          </h4>
                          <Badge variant="gray" size="sm">
                            {sub.shortName}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
                          {teacher && <div>Lehrer: {teacher.name}</div>}
                          {room && <div>Raum: {room.name}</div>}
                          <div className="text-[11px] text-ios-blue font-medium">
                            {countLessons} Std. pro Woche
                          </div>
                        </div>
                      </div>
                    </div>
                    <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors shrink-0 mt-1" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. LEHRER LIST VIEW */}
      {activeTab === 'teachers' && (
        <div>
          {teachers.length === 0 ? (
            <EmptyState
              icon={<User className="w-8 h-8 text-indigo-500" />}
              title="Noch keine Lehrkräfte eingetragen"
              description="Füge deine Fachlehrer mit Namen und Kürzel hinzu."
              actionLabel="Lehrkraft hinzufügen"
              onAction={() => {
                setSelectedTeacher(null);
                setIsTeacherModalOpen(true);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {teachers.map((teach) => {
                const teacherSubjects = subjects.filter(s => teach.subjects?.includes(s.id) || s.teacherId === teach.id);

                return (
                  <div
                    key={teach.id}
                    onClick={() => {
                      setSelectedTeacher(teach);
                      setIsTeacherModalOpen(true);
                    }}
                    className="ios-card p-4 flex items-start justify-between gap-3 cursor-pointer hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {teach.shortName || teach.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {teach.name}
                        </h4>
                        {teach.email && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {teach.email}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {teacherSubjects.map((s) => (
                            <span
                              key={s.id}
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                              style={{ backgroundColor: s.color }}
                            >
                              {s.shortName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors shrink-0 mt-1" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. RÄUME LIST VIEW */}
      {activeTab === 'rooms' && (
        <div>
          {rooms.length === 0 ? (
            <EmptyState
              icon={<MapPin className="w-8 h-8 text-teal-500" />}
              title="Noch keine Räume erfasst"
              description="Erfasse deine Klassenräume, Fachsäle oder Sporthallen."
              actionLabel="Raum erfassen"
              onAction={() => {
                setSelectedRoom(null);
                setIsRoomModalOpen(true);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {rooms.map((rm) => (
                <div
                  key={rm.id}
                  onClick={() => {
                    setSelectedRoom(rm);
                    setIsRoomModalOpen(true);
                  }}
                  className="ios-card p-4 flex items-start justify-between gap-3 cursor-pointer hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {rm.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {rm.building || 'Haupttrakt'} {rm.floor ? `• ${rm.floor}` : ''}
                      </p>
                      {rm.notes && (
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 truncate">
                          {rm.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors shrink-0 mt-1" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. VERTRETUNGEN LIST VIEW */}
      {activeTab === 'substitutions' && (
        <div className="space-y-3">
          {substitutions.length === 0 ? (
            <EmptyState
              icon={<RefreshCw className="w-8 h-8 text-amber-500" />}
              title="Keine Vertretungen eingetragen"
              description="Hier siehst du geänderte Räume, Vertretungslehrer oder Entfall."
              actionLabel="Vertretung erfassen"
              onAction={() => {
                setSelectedSubst(null);
                setIsSubstModalOpen(true);
              }}
            />
          ) : (
            substitutions.map((subst) => {
              const entry = scheduleEntries.find(e => e.id === subst.scheduleEntryId);
              const subject = entry ? subjectMap.get(entry.subjectId) : undefined;
              const newTeacher = subst.newTeacherId ? teacherMap.get(subst.newTeacherId) : undefined;
              const newRoom = subst.newRoomId ? roomMap.get(subst.newRoomId) : undefined;

              return (
                <div
                  key={subst.id}
                  onClick={() => {
                    setSelectedSubst(subst);
                    setIsSubstModalOpen(true);
                  }}
                  className="ios-card p-4 flex items-start justify-between gap-3 cursor-pointer hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500">
                          {subst.date}
                        </span>
                        <Badge
                          variant={subst.type === 'cancelled' ? 'red' : 'amber'}
                          size="sm"
                        >
                          {subst.type === 'cancelled'
                            ? 'Entfall'
                            : subst.type === 'room_change'
                            ? 'Raumänderung'
                            : 'Vertretung'}
                        </Badge>
                      </div>

                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                        {entry ? `${entry.period}. Std: ${subject?.name || 'Fach'}` : 'Stunde'}
                      </h4>

                      {subst.note && (
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                          {subst.note}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        {newTeacher && <span>Vertretung durch: <strong>{newTeacher.name}</strong></span>}
                        {newRoom && <span>In Raum: <strong>{newRoom.name}</strong></span>}
                      </div>
                    </div>
                  </div>
                  <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors shrink-0 mt-1" />
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modals */}
      <ScheduleEntryModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleSaveScheduleEntry}
        onDelete={(id) => deleteScheduleEntry(uid, id)}
        initialEntry={selectedEntry}
        initialDay={selectedDay}
        initialPeriod={selectedPeriod}
        subjects={subjects}
        teachers={teachers}
        rooms={rooms}
        periodTimes={periodTimes}
      />

      <PeriodTimesModal
        isOpen={isPeriodTimesModalOpen}
        onClose={() => setIsPeriodTimesModalOpen(false)}
        periodTimes={periodTimes}
        breaks={breaks}
        onSave={handleSavePeriodTimes}
      />

      <SubstitutionModal
        isOpen={isSubstModalOpen}
        onClose={() => setIsSubstModalOpen(false)}
        onSave={(sub) => {
          if (selectedSubst) {
            updateSubstitution(uid, sub.id, sub);
          } else {
            addSubstitution(uid, sub);
          }
        }}
        onDelete={(id) => deleteSubstitution(uid, id)}
        initialSubstitution={selectedSubst}
        scheduleEntries={scheduleEntries}
        subjects={subjects}
        teachers={teachers}
        rooms={rooms}
      />

      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        onSave={(sub) => {
          if (selectedSubject) {
            updateSubject(uid, sub.id, sub);
          } else {
            addSubject(uid, sub);
          }
        }}
        onDelete={(id) => deleteSubject(uid, id)}
        initialSubject={selectedSubject}
        teachers={teachers}
        rooms={rooms}
      />

      <TeacherModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onSave={(teach) => {
          if (selectedTeacher) {
            updateTeacher(uid, teach.id, teach);
          } else {
            addTeacher(uid, teach);
          }
        }}
        onDelete={(id) => deleteTeacher(uid, id)}
        initialTeacher={selectedTeacher}
        subjects={subjects}
      />

      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        onSave={(room) => {
          if (selectedRoom) {
            updateRoom(uid, room.id, room);
          } else {
            addRoom(uid, room);
          }
        }}
        onDelete={(id) => deleteRoom(uid, id)}
        initialRoom={selectedRoom}
      />
    </div>
  );
};
