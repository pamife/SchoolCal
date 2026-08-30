import React, { useState } from 'react';
import {
  BookOpen,
  User,
  MapPin,
  RefreshCw,
  Plus,
  Download,
  Upload,
  Clock,
  Sparkles,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useSchoolStore } from '../../store/useSchoolStore';
import { SegmentedControl, SegmentOption } from '../common/SegmentedControl';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { getSubjectIcon, hexToRgba } from '../../utils/colorUtils';
import { exportScheduleCsv } from '../../services/export/dataExportService';
import { ScheduleEntryModal } from './ScheduleEntryModal';
import { SubstitutionModal } from './SubstitutionModal';
import { SubjectModal } from './SubjectModal';
import { TeacherModal } from './TeacherModal';
import { RoomModal } from './RoomModal';
import { Subject, Teacher, Room, ScheduleEntry, Substitution } from '../../types';

type SchoolSubTab = 'schedule' | 'subjects' | 'teachers' | 'rooms' | 'substitutions';

export const SchoolScreen: React.FC = () => {
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

  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  const handleCellClick = (dayId: number, periodNum: number) => {
    const existing = scheduleEntries.find(e => e.dayOfWeek === dayId && e.period === periodNum);
    setSelectedEntry(existing || null);
    setSelectedDay(dayId);
    setSelectedPeriod(periodNum);
    setIsScheduleModalOpen(true);
  };

  const handleExportCsv = () => {
    exportScheduleCsv(scheduleEntries, subjects, teachers, rooms);
  };

  return (
    <div className="space-y-4 pb-24 ipad:pb-10 max-w-5xl mx-auto">
      {/* Subtab Navigator */}
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
              onClick={handleExportCsv}
              className="p-2 bg-gray-100 dark:bg-ios-dark-secondary text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-ios-dark-tertiary rounded-ios transition-colors text-xs font-semibold flex items-center gap-1.5"
              title="Als CSV herunterladen"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">CSV Export</span>
            </button>
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
          {/* Schedule Table */}
          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[640px]">
              {/* Header row */}
              <div className="grid grid-cols-6 border-b border-black/5 dark:border-white/10 bg-gray-50/70 dark:bg-ios-dark-secondary/70">
                <div className="p-3 text-center text-xs font-bold text-gray-400 dark:text-gray-500 border-r border-black/5 dark:border-white/5">
                  Std
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

              {/* Rows for periods 1-8 */}
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {periods.map((periodNum) => (
                  <div key={periodNum} className="grid grid-cols-6 items-stretch min-h-[68px]">
                    {/* Period number column */}
                    <div className="p-2 flex flex-col items-center justify-center border-r border-black/5 dark:border-white/5 bg-gray-50/40 dark:bg-ios-dark-secondary/40">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {periodNum}. Std
                      </span>
                    </div>

                    {/* 5 Day Cells */}
                    {days.map((day) => {
                      const entry = scheduleEntries.find(
                        e => e.dayOfWeek === day.id && e.period === periodNum
                      );
                      const subject = entry ? subjectMap.get(entry.subjectId) : undefined;
                      const teacher = entry?.teacherId ? teacherMap.get(entry.teacherId) : undefined;
                      const room = entry?.roomId ? roomMap.get(entry.roomId) : undefined;
                      const Icon = subject ? getSubjectIcon(subject.icon) : Clock;

                      return (
                        <div
                          key={day.id}
                          onClick={() => handleCellClick(day.id, periodNum)}
                          className="p-1.5 border-r last:border-r-0 border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex flex-col justify-center"
                        >
                          {entry && subject ? (
                            <div
                              style={{
                                borderLeftColor: subject.color,
                                borderLeftWidth: '3px',
                                backgroundColor: hexToRgba(subject.color, 0.08),
                              }}
                              className="p-1.5 rounded-lg border border-black/5 dark:border-white/5 h-full flex flex-col justify-between"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                                  {subject.name}
                                </span>
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
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. FÄCHER LIST VIEW */}
      {activeTab === 'subjects' && (
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

      {/* 3. LEHRER LIST VIEW */}
      {activeTab === 'teachers' && (
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

      {/* 4. RÄUME LIST VIEW */}
      {activeTab === 'rooms' && (
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

      {/* 5. VERTRETUNGEN LIST VIEW */}
      {activeTab === 'substitutions' && (
        <div className="space-y-3">
          {substitutions.length === 0 ? (
            <div className="ios-card p-8 text-center text-sm text-gray-400">
              Keine Vertretungen oder Stundenausfälle eingetragen.
            </div>
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
        onSave={(entry) => {
          if (selectedEntry) {
            updateScheduleEntry(entry.id, entry);
          } else {
            addScheduleEntry(entry);
          }
        }}
        onDelete={(id) => deleteScheduleEntry(id)}
        initialEntry={selectedEntry}
        initialDay={selectedDay}
        initialPeriod={selectedPeriod}
        subjects={subjects}
        teachers={teachers}
        rooms={rooms}
      />

      <SubstitutionModal
        isOpen={isSubstModalOpen}
        onClose={() => setIsSubstModalOpen(false)}
        onSave={(sub) => {
          if (selectedSubst) {
            updateSubstitution(sub.id, sub);
          } else {
            addSubstitution(sub);
          }
        }}
        onDelete={(id) => deleteSubstitution(id)}
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
            updateSubject(sub.id, sub);
          } else {
            addSubject(sub);
          }
        }}
        onDelete={(id) => deleteSubject(id)}
        initialSubject={selectedSubject}
        teachers={teachers}
        rooms={rooms}
      />

      <TeacherModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onSave={(teach) => {
          if (selectedTeacher) {
            updateTeacher(teach.id, teach);
          } else {
            addTeacher(teach);
          }
        }}
        onDelete={(id) => deleteTeacher(id)}
        initialTeacher={selectedTeacher}
        subjects={subjects}
      />

      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        onSave={(room) => {
          if (selectedRoom) {
            updateRoom(room.id, room);
          } else {
            addRoom(room);
          }
        }}
        onDelete={(id) => deleteRoom(id)}
        initialRoom={selectedRoom}
      />
    </div>
  );
};
