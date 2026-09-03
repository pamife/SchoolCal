import { create } from 'zustand';
import type {
  SchoolClass,
  ClassTimetable,
  StudentTimetableSelection,
  ScheduleEntry,
  Subject,
  Teacher,
  Room,
  TimetableDiff,
} from '../types';
import { useSchoolStore } from './useSchoolStore';
import { DEFAULT_SCHOOL_ID } from '../config/schoolConfig';
import {
  fetchSchoolClasses,
  saveSchoolClass,
  archiveSchoolClass,
  deleteSchoolClass,
  copyClassTimetable,
  fetchClassTimetable,
  saveClassTimetableDraft,
  publishClassTimetable,
  subscribeClassTimetable,
  fetchSchoolSubjects,
  saveSchoolSubject,
  deleteSchoolSubject,
  fetchSchoolTeachers,
  saveSchoolTeacher,
  deleteSchoolTeacher,
  fetchSchoolRooms,
  saveSchoolRoom,
  deleteSchoolRoom,
  fetchStudentTimetableSelection,
  saveStudentTimetableSelection,
  clearStudentTimetableSelection,
  resolveStudentSchedule,
  computeTimetableDiff,
} from '../services/school/classTimetableService';

interface ClassTimetableState {
  classes: SchoolClass[];
  selectedClass: SchoolClass | null;
  publishedTimetable: ClassTimetable | null;
  draftTimetable: ClassTimetable | null;
  schoolSubjects: Subject[];
  schoolTeachers: Teacher[];
  schoolRooms: Room[];
  studentSelection: StudentTimetableSelection | null;
  activeStudentSchedule: ScheduleEntry[];
  unreadUpdateDiff: TimetableDiff | null;
  isLoading: boolean;

  // Real-time unsubscribe ref
  liveTimetableUnsub: (() => void) | null;

  // Actions
  loadClasses: (schoolId?: string, includeArchived?: boolean) => Promise<void>;
  selectClass: (classId: string, schoolId?: string) => Promise<void>;
  loadClassTimetable: (classId: string, schoolId?: string) => Promise<void>;
  saveDraft: (adminUid: string, classId: string, data: Partial<ClassTimetable>) => Promise<ClassTimetable>;
  publishDraft: (
    adminUid: string,
    classId: string,
    draftData: ClassTimetable,
    changeSummary?: string[]
  ) => Promise<ClassTimetable>;
  addClass: (adminUid: string, classData: SchoolClass) => Promise<void>;
  updateClass: (adminUid: string, classId: string, updates: Partial<SchoolClass>) => Promise<void>;
  archiveClass: (adminUid: string, classId: string, archived: boolean) => Promise<void>;
  deleteClass: (adminUid: string, classId: string) => Promise<void>;
  copyClass: (adminUid: string, sourceId: string, targetId: string) => Promise<void>;

  // School Entities
  loadSchoolEntities: (schoolId?: string) => Promise<void>;
  addOrUpdateSubject: (subject: Subject, schoolId?: string) => Promise<void>;
  removeSubject: (subjectId: string, schoolId?: string) => Promise<void>;
  addOrUpdateTeacher: (teacher: Teacher, schoolId?: string) => Promise<void>;
  removeTeacher: (teacherId: string, schoolId?: string) => Promise<void>;
  addOrUpdateRoom: (room: Room, schoolId?: string) => Promise<void>;
  removeRoom: (roomId: string, schoolId?: string) => Promise<void>;

  // Student Actions
  loadStudentSelection: (userId: string) => Promise<StudentTimetableSelection | null>;
  setStudentClassAndVariants: (
    userId: string,
    classId: string,
    className: string,
    answers: Record<string, string>,
    activeVariantIds: string[],
    appliedVersion: number
  ) => Promise<void>;
  updateStudentOverrides: (
    userId: string,
    overrides: Record<string, Partial<ScheduleEntry>>
  ) => Promise<void>;
  acknowledgeTimetableUpdate: (userId: string, version: number) => Promise<void>;
  disconnectStudentClass: (userId: string) => Promise<void>;
  refreshStudentSchedule: () => void;
}

export const useClassTimetableStore = create<ClassTimetableState>((set, get) => ({
  classes: [],
  selectedClass: null,
  publishedTimetable: null,
  draftTimetable: null,
  schoolSubjects: [],
  schoolTeachers: [],
  schoolRooms: [],
  studentSelection: null,
  activeStudentSchedule: [],
  unreadUpdateDiff: null,
  isLoading: false,
  liveTimetableUnsub: null,

  loadClasses: async (schoolId = DEFAULT_SCHOOL_ID, includeArchived = false) => {
    set({ isLoading: true });
    try {
      const classes = await fetchSchoolClasses(schoolId, includeArchived);
      set({ classes, isLoading: false });
    } catch (err) {
      console.error('Error loading classes:', err);
      set({ isLoading: false });
    }
  },

  selectClass: async (classId: string, schoolId = DEFAULT_SCHOOL_ID) => {
    const cls = get().classes.find((c) => c.id === classId) || null;
    set({ selectedClass: cls });
    if (classId) {
      await get().loadClassTimetable(classId, schoolId);
    }
  },

  loadClassTimetable: async (classId: string, schoolId = DEFAULT_SCHOOL_ID) => {
    set({ isLoading: true });
    try {
      const [published, draft] = await Promise.all([
        fetchClassTimetable(classId, 'published', schoolId),
        fetchClassTimetable(classId, 'draft', schoolId),
      ]);
      set({
        publishedTimetable: published,
        draftTimetable: draft || published,
        isLoading: false,
      });
    } catch (err) {
      console.error('Error loading class timetable:', err);
      set({ isLoading: false });
    }
  },

  saveDraft: async (adminUid: string, classId: string, data: Partial<ClassTimetable>) => {
    const draft = await saveClassTimetableDraft(classId, data);
    set({ draftTimetable: draft });
    return draft;
  },

  publishDraft: async (adminUid: string, classId: string, draftData: ClassTimetable, changeSummary = []) => {
    const published = await publishClassTimetable(classId, draftData, adminUid, changeSummary);
    set({
      publishedTimetable: published,
      draftTimetable: { ...published, id: 'draft', status: 'draft' },
    });
    // Refresh classes list to show updated version
    await get().loadClasses();
    return published;
  },

  addClass: async (adminUid: string, classData: SchoolClass) => {
    await saveSchoolClass(classData);
    await get().loadClasses();
  },

  updateClass: async (adminUid: string, classId: string, updates: Partial<SchoolClass>) => {
    const existing = get().classes.find((c) => c.id === classId);
    if (!existing) return;
    const merged: SchoolClass = { ...existing, ...updates, updatedByUid: adminUid };
    await saveSchoolClass(merged);
    await get().loadClasses();
  },

  archiveClass: async (adminUid: string, classId: string, archived: boolean) => {
    await archiveSchoolClass(classId, archived);
    await get().loadClasses();
  },

  deleteClass: async (adminUid: string, classId: string) => {
    await deleteSchoolClass(classId);
    await get().loadClasses();
  },

  copyClass: async (adminUid: string, sourceId: string, targetId: string) => {
    await copyClassTimetable(sourceId, targetId, adminUid);
    await get().loadClassTimetable(targetId);
  },

  // School Central Entities
  loadSchoolEntities: async (schoolId = DEFAULT_SCHOOL_ID) => {
    try {
      const [subjects, teachers, rooms] = await Promise.all([
        fetchSchoolSubjects(schoolId),
        fetchSchoolTeachers(schoolId),
        fetchSchoolRooms(schoolId),
      ]);
      set({
        schoolSubjects: subjects,
        schoolTeachers: teachers,
        schoolRooms: rooms,
      });

      // Merge central school entities into user school store so UI can use them immediately
      const currentSchool = useSchoolStore.getState();
      const existingSubIds = new Set(currentSchool.subjects.map((s) => s.id));
      const newSubs = subjects.filter((s) => !existingSubIds.has(s.id));

      const existingTeacherIds = new Set(currentSchool.teachers.map((t) => t.id));
      const newTeachers = teachers.filter((t) => !existingTeacherIds.has(t.id));

      const existingRoomIds = new Set(currentSchool.rooms.map((r) => r.id));
      const newRooms = rooms.filter((r) => !existingRoomIds.has(r.id));

      if (newSubs.length > 0 || newTeachers.length > 0 || newRooms.length > 0) {
        useSchoolStore.setState({
          subjects: [...currentSchool.subjects, ...newSubs],
          teachers: [...currentSchool.teachers, ...newTeachers],
          rooms: [...currentSchool.rooms, ...newRooms],
        });
      }
    } catch (err) {
      console.error('Error loading school central entities:', err);
    }
  },

  addOrUpdateSubject: async (subject: Subject, schoolId = DEFAULT_SCHOOL_ID) => {
    await saveSchoolSubject(subject, schoolId);
    const subjects = await fetchSchoolSubjects(schoolId);
    set({ schoolSubjects: subjects });
  },

  removeSubject: async (subjectId: string, schoolId = DEFAULT_SCHOOL_ID) => {
    await deleteSchoolSubject(subjectId, schoolId);
    const subjects = await fetchSchoolSubjects(schoolId);
    set({ schoolSubjects: subjects });
  },

  addOrUpdateTeacher: async (teacher: Teacher, schoolId = DEFAULT_SCHOOL_ID) => {
    await saveSchoolTeacher(teacher, schoolId);
    const teachers = await fetchSchoolTeachers(schoolId);
    set({ schoolTeachers: teachers });
  },

  removeTeacher: async (teacherId: string, schoolId = DEFAULT_SCHOOL_ID) => {
    await deleteSchoolTeacher(teacherId, schoolId);
    const teachers = await fetchSchoolTeachers(schoolId);
    set({ schoolTeachers: teachers });
  },

  addOrUpdateRoom: async (room: Room, schoolId = DEFAULT_SCHOOL_ID) => {
    await saveSchoolRoom(room, schoolId);
    const rooms = await fetchSchoolRooms(schoolId);
    set({ schoolRooms: rooms });
  },

  removeRoom: async (roomId: string, schoolId = DEFAULT_SCHOOL_ID) => {
    await deleteSchoolRoom(roomId, schoolId);
    const rooms = await fetchSchoolRooms(schoolId);
    set({ schoolRooms: rooms });
  },

  // Student Selection & Real-time Live Resolution
  loadStudentSelection: async (userId: string) => {
    if (!userId) return null;
    const selection = await fetchStudentTimetableSelection(userId);
    set({ studentSelection: selection });

    // Clean up any old subscription
    if (get().liveTimetableUnsub) {
      get().liveTimetableUnsub!();
      set({ liveTimetableUnsub: null });
    }

    if (selection && selection.classId && selection.timetableSource === 'admin') {
      // Load initial published class timetable
      const published = await fetchClassTimetable(selection.classId, 'published');
      set({ publishedTimetable: published });

      // Calculate active student schedule
      get().refreshStudentSchedule();

      // Check if there is an unread update diff
      if (published && published.version > (selection.lastNotifiedVersion || 0)) {
        const prevSchedule = get().activeStudentSchedule;
        const resolvedNew = resolveStudentSchedule({
          baseEntries: published.baseEntries || [],
          variants: published.variants || [],
          activeVariantIds: selection.activeVariantIds || [],
          personalOverrides: selection.personalOverrides,
          customEntries: selection.customEntries,
        });
        const diff = computeTimetableDiff(
          prevSchedule,
          resolvedNew,
          get().schoolSubjects,
          get().schoolTeachers,
          get().schoolRooms
        );
        if (diff.hasChanges) {
          set({ unreadUpdateDiff: diff });
        }
      }

      // Start real-time subscription for instant live admin updates!
      const unsub = subscribeClassTimetable(selection.classId, (updatedTimetable) => {
        if (!updatedTimetable) return;
        const currentSel = get().studentSelection;
        if (!currentSel) return;

        const prevSchedule = get().activeStudentSchedule;
        set({ publishedTimetable: updatedTimetable });

        const resolved = resolveStudentSchedule({
          baseEntries: updatedTimetable.baseEntries || [],
          variants: updatedTimetable.variants || [],
          activeVariantIds: currentSel.activeVariantIds || [],
          personalOverrides: currentSel.personalOverrides,
          customEntries: currentSel.customEntries,
        });

        // Compute diff if version updated
        if (updatedTimetable.version > (currentSel.lastNotifiedVersion || 0)) {
          const diff = computeTimetableDiff(
            prevSchedule,
            resolved,
            get().schoolSubjects,
            get().schoolTeachers,
            get().schoolRooms
          );
          if (diff.hasChanges) {
            set({ unreadUpdateDiff: diff });
          }
        }

        set({ activeStudentSchedule: resolved });
      });

      set({ liveTimetableUnsub: unsub });
    }

    return selection;
  },

  setStudentClassAndVariants: async (
    userId: string,
    classId: string,
    className: string,
    answers: Record<string, string>,
    activeVariantIds: string[],
    appliedVersion: number
  ) => {
    const selection = await saveStudentTimetableSelection(userId, {
      classId,
      className,
      selectedOptionIds: answers,
      activeVariantIds,
      appliedVersion,
      lastNotifiedVersion: appliedVersion,
      timetableSource: 'admin',
    });

    set({ studentSelection: selection, unreadUpdateDiff: null });

    // Load published timetable and subscribe
    await get().loadStudentSelection(userId);
  },

  updateStudentOverrides: async (
    userId: string,
    overrides: Record<string, Partial<ScheduleEntry>>
  ) => {
    const updated = await saveStudentTimetableSelection(userId, {
      personalOverrides: overrides,
    });
    set({ studentSelection: updated });
    get().refreshStudentSchedule();
  },

  acknowledgeTimetableUpdate: async (userId: string, version: number) => {
    const updated = await saveStudentTimetableSelection(userId, {
      lastNotifiedVersion: version,
      appliedVersion: version,
    });
    set({ studentSelection: updated, unreadUpdateDiff: null });
  },

  disconnectStudentClass: async (userId: string) => {
    if (get().liveTimetableUnsub) {
      get().liveTimetableUnsub!();
      set({ liveTimetableUnsub: null });
    }
    await clearStudentTimetableSelection(userId);
    set({
      studentSelection: null,
      activeStudentSchedule: [],
      unreadUpdateDiff: null,
    });
  },

  refreshStudentSchedule: () => {
    const { publishedTimetable, studentSelection } = get();
    if (!publishedTimetable || !studentSelection) {
      set({ activeStudentSchedule: [] });
      return;
    }

    const resolved = resolveStudentSchedule({
      baseEntries: publishedTimetable.baseEntries || [],
      variants: publishedTimetable.variants || [],
      activeVariantIds: studentSelection.activeVariantIds || [],
      personalOverrides: studentSelection.personalOverrides,
      customEntries: studentSelection.customEntries,
    });

    set({ activeStudentSchedule: resolved });
    if (studentSelection.timetableSource === 'admin') {
      useSchoolStore.setState({ scheduleEntries: resolved });
    }
  },
}));
