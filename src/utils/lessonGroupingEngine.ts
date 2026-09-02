import type { ScheduleEntry, Subject, Teacher, Room, Substitution } from '../types';

export interface GroupedLesson {
  id: string;
  entries: ScheduleEntry[];
  subject?: Subject;
  teacher?: Teacher;
  room?: Room;
  isDouble: boolean;
  isCancelled: boolean;
  hasSubstitution: boolean;
  startTime: string;
  endTime: string;
  timeRange: string;
  periodLabel: string;
  startPeriod: number;
  endPeriod: number;
}

/**
 * Checks if two schedule entries form a continuous double lesson:
 * 1. Same day of week
 * 2. Same subject (by ID or subject name fallback)
 * 3. Immediately adjacent in period (period + 1) or matching start/end time
 */
export function isDoubleLessonAdjacent(
  current: ScheduleEntry,
  next?: ScheduleEntry,
  subjectMap?: Map<string, Subject>
): boolean {
  if (!next) return false;
  if (current.dayOfWeek !== next.dayOfWeek) return false;

  // Check subject match
  const sameSubjectId = current.subjectId === next.subjectId;
  let sameSubjectName = false;
  if (!sameSubjectId && subjectMap) {
    const currentSub = subjectMap.get(current.subjectId);
    const nextSub = subjectMap.get(next.subjectId);
    if (currentSub && nextSub && currentSub.name.trim().toLowerCase() === nextSub.name.trim().toLowerCase()) {
      sameSubjectName = true;
    }
  }

  if (!sameSubjectId && !sameSubjectName) return false;

  // Check period continuity (e.g. 1 and 2) or time continuity (e.g. 08:45 == 08:45)
  const isSequentialPeriod = next.period === current.period + 1;
  const isConnectingTime = current.endTime === next.startTime;

  return isSequentialPeriod || isConnectingTime;
}

/**
 * Groups consecutive schedule entries into cohesive lesson units (e.g. Doppelstunden).
 * Between two halves of a double lesson, artificial breaks are omitted.
 */
export function groupScheduleEntries({
  entries,
  subjects,
  substitutions = [],
  teachers = [],
  rooms = [],
  dayIso,
}: {
  entries: ScheduleEntry[];
  subjects: Subject[];
  substitutions?: Substitution[];
  teachers?: Teacher[];
  rooms?: Room[];
  dayIso?: string;
}): GroupedLesson[] {
  if (!entries || entries.length === 0) return [];

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));
  
  // Filter substitutions for the relevant day if specified
  const daySubsts = dayIso
    ? substitutions.filter((s) => s.date === dayIso)
    : substitutions;
  const substMap = new Map(daySubsts.map((s) => [s.scheduleEntryId, s]));

  const sorted = [...entries].sort((a, b) => a.period - b.period);
  const groups: GroupedLesson[] = [];

  let i = 0;
  while (i < sorted.length) {
    const current = sorted[i];
    const next = sorted[i + 1];

    const isDouble = isDoubleLessonAdjacent(current, next, subjectMap);
    const groupEntries = isDouble && next ? [current, next] : [current];

    const subject = subjectMap.get(current.subjectId);
    const currentSubst = substMap.get(current.id);
    const nextSubst = next ? substMap.get(next.id) : undefined;
    const substitution = currentSubst || nextSubst;

    const effectiveTeacherId = substitution?.newTeacherId || current.teacherId;
    const effectiveRoomId = substitution?.newRoomId || current.roomId;

    const teacher = effectiveTeacherId ? teacherMap.get(effectiveTeacherId) : undefined;
    const room = effectiveRoomId ? roomMap.get(effectiveRoomId) : undefined;

    const isCancelled = Boolean(
      (currentSubst && currentSubst.type === 'cancelled') &&
      (!isDouble || (nextSubst && nextSubst.type === 'cancelled'))
    );
    const hasSubstitution = Boolean(substitution && !isCancelled);

    const startPeriod = current.period;
    const endPeriod = isDouble && next ? next.period : current.period;
    const startTime = current.startTime;
    const endTime = isDouble && next ? next.endTime : current.endTime;

    const periodLabel = isDouble && next
      ? `${startPeriod}. & ${endPeriod}. Std`
      : `${startPeriod}. Std`;

    const timeRange = `${startTime} – ${endTime}`;

    groups.push({
      id: groupEntries.map((e) => e.id).join('_'),
      entries: groupEntries,
      subject,
      teacher,
      room,
      isDouble,
      isCancelled,
      hasSubstitution,
      startTime,
      endTime,
      timeRange,
      periodLabel,
      startPeriod,
      endPeriod,
    });

    i += isDouble ? 2 : 1;
  }

  return groups;
}
