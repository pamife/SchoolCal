import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseApp';
import { DEFAULT_SCHOOL_ID } from '../../config/schoolConfig';
import type {
  SchoolClass,
  ClassTimetable,
  TimetableEntry,
  TimetableVariant,
  OnboardingQuestion,
  StudentTimetableSelection,
  TimetableDiff,
  TimetableDiffItem,
  ScheduleEntry,
  Subject,
  Teacher,
  Room,
} from '../../types';

/**
 * Strips undefined properties recursively for Firestore compatibility
 */
function sanitizeForFirestore<T>(data: T): any {
  if (data === null || data === undefined) {
    return null;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item));
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned;
  }
  return data;
}

// ----------------------------------------------------
// 1. Central School Subjects, Teachers, Rooms
// ----------------------------------------------------

export async function fetchSchoolSubjects(schoolId = DEFAULT_SCHOOL_ID): Promise<Subject[]> {
  try {
    const snap = await getDocs(collection(db, 'schools', schoolId, 'subjects'));
    const items: Subject[] = [];
    snap.forEach((d) => items.push(d.data() as Subject));
    return items;
  } catch (err) {
    console.warn(`Could not fetch school subjects (${schoolId}):`, err);
    return [];
  }
}

export async function saveSchoolSubject(
  subject: Subject,
  schoolId = DEFAULT_SCHOOL_ID
): Promise<void> {
  const ref = doc(db, 'schools', schoolId, 'subjects', subject.id);
  await setDoc(ref, sanitizeForFirestore(subject), { merge: true });
}

export async function deleteSchoolSubject(
  subjectId: string,
  schoolId = DEFAULT_SCHOOL_ID
): Promise<void> {
  const ref = doc(db, 'schools', schoolId, 'subjects', subjectId);
  await deleteDoc(ref);
}

export async function fetchSchoolTeachers(schoolId = DEFAULT_SCHOOL_ID): Promise<Teacher[]> {
  try {
    const snap = await getDocs(collection(db, 'schools', schoolId, 'teachers'));
    const items: Teacher[] = [];
    snap.forEach((d) => items.push(d.data() as Teacher));
    return items;
  } catch (err) {
    console.warn(`Could not fetch school teachers (${schoolId}):`, err);
    return [];
  }
}

export async function saveSchoolTeacher(
  teacher: Teacher,
  schoolId = DEFAULT_SCHOOL_ID
): Promise<void> {
  const ref = doc(db, 'schools', schoolId, 'teachers', teacher.id);
  await setDoc(ref, sanitizeForFirestore(teacher), { merge: true });
}

export async function deleteSchoolTeacher(
  teacherId: string,
  schoolId = DEFAULT_SCHOOL_ID
): Promise<void> {
  const ref = doc(db, 'schools', schoolId, 'teachers', teacherId);
  await deleteDoc(ref);
}

export async function fetchSchoolRooms(schoolId = DEFAULT_SCHOOL_ID): Promise<Room[]> {
  try {
    const snap = await getDocs(collection(db, 'schools', schoolId, 'rooms'));
    const items: Room[] = [];
    snap.forEach((d) => items.push(d.data() as Room));
    return items;
  } catch (err) {
    console.warn(`Could not fetch school rooms (${schoolId}):`, err);
    return [];
  }
}

export async function saveSchoolRoom(
  room: Room,
  schoolId = DEFAULT_SCHOOL_ID
): Promise<void> {
  const ref = doc(db, 'schools', schoolId, 'rooms', room.id);
  await setDoc(ref, sanitizeForFirestore(room), { merge: true });
}

export async function deleteSchoolRoom(
  roomId: string,
  schoolId = DEFAULT_SCHOOL_ID
): Promise<void> {
  const ref = doc(db, 'schools', schoolId, 'rooms', roomId);
  await deleteDoc(ref);
}

// ----------------------------------------------------
// 2. School Classes CRUD
// ----------------------------------------------------

export async function fetchSchoolClasses(
  schoolId = DEFAULT_SCHOOL_ID,
  includeArchived = false
): Promise<SchoolClass[]> {
  try {
    const snap = await getDocs(collection(db, 'schools', schoolId, 'classes'));
    const classes: SchoolClass[] = [];
    snap.forEach((d) => {
      const cls = d.data() as SchoolClass;
      if (includeArchived || !cls.archived) {
        classes.push(cls);
      }
    });
    return classes.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  } catch (err) {
    console.warn(`Could not fetch classes (${schoolId}):`, err);
    return [];
  }
}

export async function saveSchoolClass(
  classData: SchoolClass,
  schoolId = DEFAULT_SCHOOL_ID
): Promise<SchoolClass> {
  const ref = doc(db, 'schools', schoolId, 'classes', classData.id);
  const nowIso = new Date().toISOString();
  const payload: SchoolClass = {
    ...classData,
    updatedAt: nowIso,
    createdAt: classData.createdAt || nowIso,
  };
  await setDoc(ref, sanitizeForFirestore(payload), { merge: true });
  return payload;
}

export async function archiveSchoolClass(
  classId: string,
  archived: boolean,
  schoolId = DEFAULT_SCHOOL_ID
): Promise<void> {
  const ref = doc(db, 'schools', schoolId, 'classes', classId);
  await setDoc(
    ref,
    sanitizeForFirestore({
      archived,
      updatedAt: new Date().toISOString(),
    }),
    { merge: true }
  );
}

export async function deleteSchoolClass(
  classId: string,
  schoolId = DEFAULT_SCHOOL_ID
): Promise<void> {
  // Delete draft and published subdocs
  try {
    await deleteDoc(doc(db, 'schools', schoolId, 'classes', classId, 'timetables', 'published'));
    await deleteDoc(doc(db, 'schools', schoolId, 'classes', classId, 'timetables', 'draft'));
  } catch {
    // ignore
  }
  await deleteDoc(doc(db, 'schools', schoolId, 'classes', classId));
}

export async function copyClassTimetable(
  sourceClassId: string,
  targetClassId: string,
  adminUid: string,
  schoolId = DEFAULT_SCHOOL_ID
): Promise<void> {
  const sourceTimetable = await fetchClassTimetable(sourceClassId, 'published', schoolId) ||
    await fetchClassTimetable(sourceClassId, 'draft', schoolId);

  if (!sourceTimetable) {
    throw new Error('Quell-Stundenplan konnte nicht geladen werden.');
  }

  const nowIso = new Date().toISOString();
  const newDraft: ClassTimetable = {
    id: 'draft',
    classId: targetClassId,
    version: 0,
    status: 'draft',
    baseEntries: sourceTimetable.baseEntries.map((e) => ({
      ...e,
      id: `entry-${targetClassId}-${e.dayOfWeek}-${e.period}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    })),
    variants: (sourceTimetable.variants || []).map((v) => ({
      ...v,
      id: `var-${targetClassId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      entries: v.entries.map((e) => ({
        ...e,
        id: `entry-${targetClassId}-${e.dayOfWeek}-${e.period}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      })),
    })),
    questions: sourceTimetable.questions || [],
    updatedAt: nowIso,
  };

  await saveClassTimetableDraft(targetClassId, newDraft, schoolId);
}

// ----------------------------------------------------
// 3. Class Timetable (Draft & Published)
// ----------------------------------------------------

export async function fetchClassTimetable(
  classId: string,
  type: 'published' | 'draft' = 'published',
  schoolId = DEFAULT_SCHOOL_ID
): Promise<ClassTimetable | null> {
  try {
    const ref = doc(db, 'schools', schoolId, 'classes', classId, 'timetables', type);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as ClassTimetable;
    }
  } catch (err) {
    console.warn(`Could not fetch class timetable ${classId} (${type}):`, err);
  }
  return null;
}

export async function saveClassTimetableDraft(
  classId: string,
  data: Partial<ClassTimetable>,
  schoolId = DEFAULT_SCHOOL_ID
): Promise<ClassTimetable> {
  const ref = doc(db, 'schools', schoolId, 'classes', classId, 'timetables', 'draft');
  const nowIso = new Date().toISOString();
  const draft: ClassTimetable = {
    id: 'draft',
    classId,
    version: data.version || 1,
    status: 'draft',
    baseEntries: data.baseEntries || [],
    variants: data.variants || [],
    questions: data.questions || [],
    updatedAt: nowIso,
    changeSummary: data.changeSummary || [],
  };

  await setDoc(ref, sanitizeForFirestore(draft));
  return draft;
}

export async function publishClassTimetable(
  classId: string,
  draftData: ClassTimetable,
  adminUid: string,
  changeSummary: string[] = [],
  schoolId = DEFAULT_SCHOOL_ID
): Promise<ClassTimetable> {
  const publishedRef = doc(db, 'schools', schoolId, 'classes', classId, 'timetables', 'published');
  const classRef = doc(db, 'schools', schoolId, 'classes', classId);
  const nowIso = new Date().toISOString();

  // Determine next version number
  const currentPublished = await fetchClassTimetable(classId, 'published', schoolId);
  const nextVersion = (currentPublished?.version || 0) + 1;

  const publishedDoc: ClassTimetable = {
    ...draftData,
    id: 'published',
    classId,
    version: nextVersion,
    status: 'published',
    publishedAt: nowIso,
    publishedByUid: adminUid,
    updatedAt: nowIso,
    changeSummary,
  };

  // Save published doc
  await setDoc(publishedRef, sanitizeForFirestore(publishedDoc));

  // Update class activeTimetableVersion
  await setDoc(
    classRef,
    sanitizeForFirestore({
      activeTimetableVersion: nextVersion,
      publishedAt: nowIso,
      updatedAt: nowIso,
      updatedByUid: adminUid,
    }),
    { merge: true }
  );

  // Sync draft to match published version
  const syncedDraft: ClassTimetable = {
    ...publishedDoc,
    id: 'draft',
    status: 'draft',
  };
  await setDoc(
    doc(db, 'schools', schoolId, 'classes', classId, 'timetables', 'draft'),
    sanitizeForFirestore(syncedDraft)
  );

  return publishedDoc;
}

export function subscribeClassTimetable(
  classId: string,
  onUpdate: (timetable: ClassTimetable | null) => void,
  schoolId = DEFAULT_SCHOOL_ID
): () => void {
  const ref = doc(db, 'schools', schoolId, 'classes', classId, 'timetables', 'published');
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as ClassTimetable);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.warn(`Timetable subscription error for class ${classId}:`, err);
    }
  );
}

// ----------------------------------------------------
// 4. Conditional Questions Logic & Resolution Engine
// ----------------------------------------------------

/**
 * Evaluates whether a question should be shown based on its condition and previous answers.
 */
export function isQuestionActive(
  question: OnboardingQuestion,
  answers: Record<string, string>
): boolean {
  if (!question.condition) {
    return true;
  }

  const { dependsOnQuestionId, expectedOptionId, operator = 'equals' } = question.condition;
  const parentAnswer = answers[dependsOnQuestionId];

  if (operator === 'equals') {
    return parentAnswer === expectedOptionId;
  }
  if (operator === 'not_equals') {
    return parentAnswer !== undefined && parentAnswer !== expectedOptionId;
  }

  return true;
}

/**
 * Filters the list of questions to only those that currently satisfy conditional logic.
 */
export function evaluateQuestionVisibility(
  questions: OnboardingQuestion[],
  answers: Record<string, string>
): OnboardingQuestion[] {
  const sorted = [...questions].sort((a, b) => a.order - b.order);
  return sorted.filter((q) => isQuestionActive(q, answers));
}

/**
 * Extracts active variant IDs from answered questions.
 */
export function extractActiveVariants(
  questions: OnboardingQuestion[],
  answers: Record<string, string>
): string[] {
  const activeVariantSet = new Set<string>();

  for (const question of questions) {
    // Only process question if condition is met
    if (!isQuestionActive(question, answers)) {
      continue;
    }

    const selectedOptionId = answers[question.id];
    if (!selectedOptionId) continue;

    const option = question.options.find((o) => o.id === selectedOptionId);
    if (option && option.variantIds) {
      for (const varId of option.variantIds) {
        if (varId) {
          activeVariantSet.add(varId);
        }
      }
    }
  }

  return Array.from(activeVariantSet);
}

/**
 * Resolves a student's personal schedule by combining:
 * 1. Base class timetable entries
 * 2. Active variants chosen by the student (overwriting replaced periods)
 * 3. Personal student overrides (e.g. room or teacher notes)
 * 4. Custom student-added lessons
 */
export function resolveStudentSchedule({
  baseEntries,
  variants = [],
  activeVariantIds = [],
  personalOverrides = {},
  customEntries = [],
}: {
  baseEntries: TimetableEntry[];
  variants?: TimetableVariant[];
  activeVariantIds?: string[];
  personalOverrides?: Record<string, Partial<ScheduleEntry>>;
  customEntries?: ScheduleEntry[];
}): ScheduleEntry[] {
  // 1. Build map of slots replaced by active variants
  const activeVariants = variants.filter((v) => activeVariantIds.includes(v.id));
  const replacedSlots = new Set<string>(); // key: `${dayOfWeek}-${period}`
  const variantEntriesToApply: TimetableEntry[] = [];

  for (const variant of activeVariants) {
    // Record slots this variant replaces
    if (variant.replacesPeriods) {
      for (const slot of variant.replacesPeriods) {
        replacedSlots.add(`${slot.dayOfWeek}-${slot.period}`);
      }
    }
    // Collect its specific entries
    if (variant.entries) {
      for (const entry of variant.entries) {
        variantEntriesToApply.push(entry);
        replacedSlots.add(`${entry.dayOfWeek}-${entry.period}`);
      }
    }
  }

  // 2. Retain base entries that are NOT replaced by any active variant
  const scheduleEntries: ScheduleEntry[] = [];

  for (const base of baseEntries) {
    const slotKey = `${base.dayOfWeek}-${base.period}`;
    if (!replacedSlots.has(slotKey)) {
      scheduleEntries.push({
        id: base.id,
        dayOfWeek: base.dayOfWeek,
        period: base.period,
        startTime: base.startTime,
        endTime: base.endTime,
        subjectId: base.subjectId,
        teacherId: base.teacherId,
        roomId: base.roomId,
      });
    }
  }

  // 3. Add variant entries
  for (const vEntry of variantEntriesToApply) {
    scheduleEntries.push({
      id: vEntry.id,
      dayOfWeek: vEntry.dayOfWeek,
      period: vEntry.period,
      startTime: vEntry.startTime,
      endTime: vEntry.endTime,
      subjectId: vEntry.subjectId,
      teacherId: vEntry.teacherId,
      roomId: vEntry.roomId,
    });
  }

  // 4. Apply personal overrides if student customized a specific cell
  const finalEntries = scheduleEntries.map((entry) => {
    const cellKey = `${entry.dayOfWeek}-${entry.period}`;
    const override = personalOverrides[cellKey];
    if (override) {
      return {
        ...entry,
        ...override,
        id: entry.id, // Preserve ID
      };
    }
    return entry;
  });

  // 5. Append student's custom extra lessons (not conflicting with existing slots)
  const existingSlotKeys = new Set(finalEntries.map((e) => `${e.dayOfWeek}-${e.period}`));
  for (const custom of customEntries) {
    const cellKey = `${custom.dayOfWeek}-${custom.period}`;
    if (!existingSlotKeys.has(cellKey)) {
      finalEntries.push(custom);
      existingSlotKeys.add(cellKey);
    }
  }

  // Sort by dayOfWeek, then period
  return finalEntries.sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) {
      return a.dayOfWeek - b.dayOfWeek;
    }
    return a.period - b.period;
  });
}

// ----------------------------------------------------
// 5. Timetable Diff Computation (Preview & Notification)
// ----------------------------------------------------

const DAY_NAMES: Record<number, string> = {
  1: 'Montag',
  2: 'Dienstag',
  3: 'Mittwoch',
  4: 'Donnerstag',
  5: 'Freitag',
};

export function computeTimetableDiff(
  oldEntries: (TimetableEntry | ScheduleEntry)[] = [],
  newEntries: (TimetableEntry | ScheduleEntry)[] = [],
  subjects: Subject[] = [],
  teachers: Teacher[] = [],
  rooms: Room[] = []
): TimetableDiff {
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));
  const teacherMap = new Map(teachers.map((t) => [t.id, t.name || t.shortName]));
  const roomMap = new Map(rooms.map((r) => [r.id, r.name]));

  const oldMap = new Map<string, TimetableEntry | ScheduleEntry>();
  for (const e of oldEntries) {
    oldMap.set(`${e.dayOfWeek}-${e.period}`, e);
  }

  const newMap = new Map<string, TimetableEntry | ScheduleEntry>();
  for (const e of newEntries) {
    newMap.set(`${e.dayOfWeek}-${e.period}`, e);
  }

  const items: TimetableDiffItem[] = [];
  const summary: string[] = [];

  const allSlotKeys = new Set([...oldMap.keys(), ...newMap.keys()]);

  // Sort slot keys by day and period
  const sortedSlotKeys = Array.from(allSlotKeys).sort((a, b) => {
    const [d1, p1] = a.split('-').map(Number);
    const [d2, p2] = b.split('-').map(Number);
    if (d1 !== d2) return d1 - d2;
    return p1 - p2;
  });

  for (const slotKey of sortedSlotKeys) {
    const [day, period] = slotKey.split('-').map(Number);
    const dayName = DAY_NAMES[day] || `Tag ${day}`;
    const oldEntry = oldMap.get(slotKey);
    const newEntry = newMap.get(slotKey);

    if (!oldEntry && newEntry) {
      // Added
      const subName = subjectMap.get(newEntry.subjectId) || 'Fach';
      const teacherName = newEntry.teacherId ? teacherMap.get(newEntry.teacherId) : undefined;
      const roomName = newEntry.roomId ? roomMap.get(newEntry.roomId) : undefined;
      const desc = `${dayName}, ${period}. Stunde: ${subName} hinzugefügt${roomName ? ` (${roomName})` : ''}`;
      items.push({
        dayOfWeek: day,
        period,
        type: 'added',
        after: { subjectName: subName, teacherName, roomName },
        description: desc,
      });
      summary.push(desc);
    } else if (oldEntry && !newEntry) {
      // Removed
      const subName = subjectMap.get(oldEntry.subjectId) || 'Fach';
      const desc = `${dayName}, ${period}. Stunde: ${subName} entfällt`;
      items.push({
        dayOfWeek: day,
        period,
        type: 'removed',
        before: {
          subjectName: subName,
          teacherName: oldEntry.teacherId ? teacherMap.get(oldEntry.teacherId) : undefined,
          roomName: oldEntry.roomId ? roomMap.get(oldEntry.roomId) : undefined,
        },
        description: desc,
      });
      summary.push(desc);
    } else if (oldEntry && newEntry) {
      // Check modifications
      const changedSubject = oldEntry.subjectId !== newEntry.subjectId;
      const changedTeacher = oldEntry.teacherId !== newEntry.teacherId;
      const changedRoom = oldEntry.roomId !== newEntry.roomId;

      if (changedSubject || changedTeacher || changedRoom) {
        const oldSub = subjectMap.get(oldEntry.subjectId) || 'Fach';
        const newSub = subjectMap.get(newEntry.subjectId) || 'Fach';
        const oldTeacher = oldEntry.teacherId ? teacherMap.get(oldEntry.teacherId) : undefined;
        const newTeacher = newEntry.teacherId ? teacherMap.get(newEntry.teacherId) : undefined;
        const oldRoom = oldEntry.roomId ? roomMap.get(oldEntry.roomId) : undefined;
        const newRoom = newEntry.roomId ? roomMap.get(newEntry.roomId) : undefined;

        const changesList: string[] = [];
        if (changedSubject) changesList.push(`Fach: ${oldSub} → ${newSub}`);
        if (changedTeacher) changesList.push(`Lehrkraft: ${oldTeacher || '–'} → ${newTeacher || '–'}`);
        if (changedRoom) changesList.push(`Raum: ${oldRoom || '–'} → ${newRoom || '–'}`);

        const desc = `${dayName}, ${period}. Stunde: ${changesList.join(', ')}`;

        items.push({
          dayOfWeek: day,
          period,
          type: 'modified',
          before: { subjectName: oldSub, teacherName: oldTeacher, roomName: oldRoom },
          after: { subjectName: newSub, teacherName: newTeacher, roomName: newRoom },
          description: desc,
        });
        summary.push(desc);
      }
    }
  }

  return {
    hasChanges: items.length > 0,
    items,
    summary,
  };
}

// ----------------------------------------------------
// 6. Student Timetable Selection Persistence
// ----------------------------------------------------

export async function fetchStudentTimetableSelection(
  userId: string
): Promise<StudentTimetableSelection | null> {
  if (!userId) return null;
  try {
    const ref = doc(db, 'users', userId, 'classSelection', 'current');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as StudentTimetableSelection;
    }
  } catch (err) {
    console.warn(`Could not fetch class selection for user ${userId}:`, err);
  }
  return null;
}

export async function saveStudentTimetableSelection(
  userId: string,
  selection: Partial<StudentTimetableSelection>
): Promise<StudentTimetableSelection> {
  const ref = doc(db, 'users', userId, 'classSelection', 'current');
  const nowIso = new Date().toISOString();
  const existing = await fetchStudentTimetableSelection(userId);

  const merged: StudentTimetableSelection = {
    userId,
    classId: selection.classId || existing?.classId || '',
    className: selection.className || existing?.className || '',
    selectedOptionIds: selection.selectedOptionIds || existing?.selectedOptionIds || {},
    activeVariantIds: selection.activeVariantIds || existing?.activeVariantIds || [],
    appliedVersion: selection.appliedVersion ?? existing?.appliedVersion ?? 1,
    lastNotifiedVersion: selection.lastNotifiedVersion ?? existing?.lastNotifiedVersion ?? 1,
    timetableSource: selection.timetableSource || existing?.timetableSource || 'admin',
    personalOverrides: selection.personalOverrides || existing?.personalOverrides || {},
    customEntries: selection.customEntries || existing?.customEntries || [],
    updatedAt: nowIso,
  };

  await setDoc(ref, sanitizeForFirestore(merged));
  return merged;
}

export async function clearStudentTimetableSelection(userId: string): Promise<void> {
  if (!userId) return;
  try {
    const ref = doc(db, 'users', userId, 'classSelection', 'current');
    await deleteDoc(ref);
  } catch (err) {
    console.warn(`Could not clear student timetable selection for user ${userId}:`, err);
  }
}
