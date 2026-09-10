import type {
  Room,
  SchedulePeriodTime,
  Subject,
  Teacher,
  TimetableEntry,
} from '../types';

type LessonType = NonNullable<TimetableEntry['lessonType']>;

interface TimetableImportContext {
  selectedClassName: string;
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  periods: SchedulePeriodTime[];
}

export interface TimetableImportResult {
  entries: TimetableEntry[];
  errors: string[];
  className?: string;
}

const DAY_NAMES = new Map<string, number>([
  ['1', 1], ['mo', 1], ['montag', 1], ['mon', 1], ['monday', 1],
  ['2', 2], ['di', 2], ['dienstag', 2], ['tue', 2], ['tuesday', 2],
  ['3', 3], ['mi', 3], ['mittwoch', 3], ['wed', 3], ['wednesday', 3],
  ['4', 4], ['do', 4], ['donnerstag', 4], ['thu', 4], ['thursday', 4],
  ['5', 5], ['fr', 5], ['freitag', 5], ['fri', 5], ['friday', 5],
]);

const LESSON_TYPES = new Set<LessonType>(['regular', 'elective', 'remedial', 'other']);

function normalize(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('de-DE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function normalizeClassName(value: string): string {
  return normalize(value).replace(/[^a-z0-9]/g, '');
}

function readString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function resolveReference<T>(
  value: string,
  items: T[],
  aliases: (item: T) => Array<string | undefined>
): T[] {
  const needle = normalize(value);
  return items.filter((item) => aliases(item).some((alias) => alias && normalize(alias) === needle));
}

function parseDay(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5) {
    return value;
  }
  if (typeof value !== 'string') return null;
  return DAY_NAMES.get(normalize(value)) || null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function parseTimetableImportJson(
  json: string,
  context: TimetableImportContext
): TimetableImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { entries: [], errors: ['Die Datei enthält kein gültiges JSON.'] };
  }

  if (!isRecord(parsed)) {
    return { entries: [], errors: ['Die JSON-Datei muss ein Objekt enthalten.'] };
  }

  const errors: string[] = [];
  const formatVersion = parsed.formatVersion ?? parsed.version;
  if (formatVersion !== undefined && Number(formatVersion) !== 1) {
    errors.push('Nicht unterstützte formatVersion. Erwartet wird Version 1.');
  }

  const className = readString(parsed, ['className', 'klasse']);
  if (className && normalizeClassName(className) !== normalizeClassName(context.selectedClassName)) {
    errors.push(
      `Die Datei ist für Klasse „${className}“, ausgewählt ist aber Klasse „${context.selectedClassName}“.`
    );
  }

  const lessons = parsed.lessons ?? parsed.stunden;
  if (!Array.isArray(lessons)) {
    errors.push('Das Feld „lessons“ muss eine Liste sein.');
    return { entries: [], errors, className };
  }
  if (lessons.length === 0) {
    errors.push('Die Datei enthält keine Unterrichtsstunden.');
  }
  if (lessons.length > 100) {
    errors.push('Die Datei enthält mehr als 100 Stunden und wurde aus Sicherheitsgründen abgelehnt.');
  }

  const entries: TimetableEntry[] = [];
  const occupiedSlots = new Set<string>();

  lessons.slice(0, 100).forEach((lesson, index) => {
    const label = `Eintrag ${index + 1}`;
    if (!isRecord(lesson)) {
      errors.push(`${label}: muss ein JSON-Objekt sein.`);
      return;
    }

    const day = parseDay(lesson.day ?? lesson.tag ?? lesson.dayOfWeek);
    if (!day) {
      errors.push(`${label}: ungültiger Wochentag.`);
    }

    const periodValue = lesson.period ?? lesson.stunde;
    const period = typeof periodValue === 'number'
      ? periodValue
      : typeof periodValue === 'string' && periodValue.trim()
        ? Number(periodValue)
        : NaN;
    const periodInfo = Number.isInteger(period)
      ? context.periods.find((item) => item.period === period)
      : undefined;
    if (!periodInfo) {
      errors.push(`${label}: ungültige oder nicht konfigurierte Stunde.`);
    }

    const subjectValue = readString(lesson, ['subject', 'fach', 'subjectId']);
    const subjectMatches = subjectValue
      ? resolveReference(subjectValue, context.subjects, (subject) => [
          subject.id,
          subject.name,
          subject.shortName,
        ])
      : [];
    if (!subjectValue) {
      errors.push(`${label}: das Fach fehlt.`);
    } else if (subjectMatches.length === 0) {
      errors.push(`${label}: Fach „${subjectValue}“ ist in den Stammdaten unbekannt.`);
    } else if (subjectMatches.length > 1) {
      errors.push(`${label}: Fach „${subjectValue}“ ist nicht eindeutig.`);
    }

    const teacherValue = readString(lesson, ['teacher', 'lehrer', 'teacherId']);
    const teacherMatches = teacherValue
      ? resolveReference(teacherValue, context.teachers, (teacher) => [
          teacher.id,
          teacher.name,
          teacher.shortName,
          teacher.title ? `${teacher.title} ${teacher.name}` : undefined,
        ])
      : [];
    if (teacherValue && teacherMatches.length === 0) {
      errors.push(`${label}: Lehrkraft „${teacherValue}“ ist in den Stammdaten unbekannt.`);
    } else if (teacherMatches.length > 1) {
      errors.push(`${label}: Lehrkraft „${teacherValue}“ ist nicht eindeutig.`);
    }

    const roomValue = readString(lesson, ['room', 'raum', 'roomId']);
    const roomMatches = roomValue
      ? resolveReference(roomValue, context.rooms, (room) => [room.id, room.name])
      : [];
    if (roomValue && roomMatches.length === 0) {
      errors.push(`${label}: Raum „${roomValue}“ ist in den Stammdaten unbekannt.`);
    } else if (roomMatches.length > 1) {
      errors.push(`${label}: Raum „${roomValue}“ ist nicht eindeutig.`);
    }

    const lessonTypeValue = readString(lesson, ['lessonType', 'unterrichtsart']);
    const lessonType = lessonTypeValue as LessonType | undefined;
    if (lessonType && !LESSON_TYPES.has(lessonType)) {
      errors.push(`${label}: ungültige Unterrichtsart „${lessonType}“.`);
    }

    if (!day || !periodInfo || subjectMatches.length !== 1) return;
    if (teacherValue && teacherMatches.length !== 1) return;
    if (roomValue && roomMatches.length !== 1) return;
    if (lessonType && !LESSON_TYPES.has(lessonType)) return;

    const slot = `${day}-${period}`;
    if (occupiedSlots.has(slot)) {
      errors.push(`${label}: für diesen Wochentag und diese Stunde existiert bereits ein Eintrag.`);
      return;
    }
    occupiedSlots.add(slot);

    const courseGroup = readString(lesson, ['courseGroup', 'kurs', 'gruppe']);
    const note = readString(lesson, ['note', 'notiz']);
    entries.push({
      id: `entry-import-${day}-${period}`,
      dayOfWeek: day,
      period,
      startTime: periodInfo.startTime,
      endTime: periodInfo.endTime,
      subjectId: subjectMatches[0].id,
      teacherId: teacherMatches[0]?.id,
      roomId: roomMatches[0]?.id,
      courseGroup,
      note,
      lessonType,
    });
  });

  return {
    entries: entries.sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.period - b.period),
    errors,
    className,
  };
}

export function createTimetableImportTemplate(
  context: TimetableImportContext
): string {
  const firstPeriod = context.periods[0];
  const exampleLesson: Record<string, string | number> = {
    day: 'Montag',
    period: firstPeriod?.period || 1,
    subject: context.subjects[0]?.name || 'Mathematik',
  };
  if (context.teachers[0]) exampleLesson.teacher = context.teachers[0].name;
  if (context.rooms[0]) exampleLesson.room = context.rooms[0].name;

  return JSON.stringify(
    {
      formatVersion: 1,
      className: context.selectedClassName,
      aiInstructions: {
        description: 'Erstelle pro Unterrichtsstunde genau einen Eintrag. Zeiten werden automatisch aus der Stundennummer übernommen.',
        allowedDays: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'],
        availablePeriods: context.periods.map((period) => period.period),
        availableSubjects: context.subjects.map((subject) => ({
          name: subject.name,
          shortName: subject.shortName,
        })),
        availableTeachers: context.teachers.map((teacher) => ({
          name: teacher.name,
          shortName: teacher.shortName,
        })),
        availableRooms: context.rooms.map((room) => room.name),
        optionalFields: ['teacher', 'room', 'courseGroup', 'note', 'lessonType'],
        allowedLessonTypes: [...LESSON_TYPES],
      },
      lessons: [exampleLesson],
    },
    null,
    2
  );
}
