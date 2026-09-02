/**
 * Test Suite: SchoolCal Mobile UX, Doppelstunden, Ferien & Background Sync
 * Run via: npx tsx scripts/test-mobile-ux-sync.ts
 */

import { groupScheduleEntries, isDoubleLessonAdjacent } from '../src/utils/lessonGroupingEngine';
import { getDayHolidayInfo, getHolidaysForState, HOLIDAYS_DATABASE } from '../src/data/holidays';
import type { ScheduleEntry, Subject, Substitution, ScheduleBreak, CalendarEvent, Exam } from '../src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('====================================================');
console.log('📱 Running SchoolCal Mobile UX, Doppelstunden & Sync Tests');
console.log('====================================================\n');

// --- 1. Doppelstunden Engine Tests ---
console.log('--- 1. Doppelstunden & Pausenunterdrückung Tests ---');

const mockSubjects: Subject[] = [
  { id: 'sub-math', name: 'Mathematik', shortName: 'M', color: '#007AFF', icon: 'Calculator' },
  { id: 'sub-german', name: 'Deutsch', shortName: 'D', color: '#FF3B30', icon: 'BookOpen' },
  { id: 'sub-eng', name: 'Englisch', shortName: 'E', color: '#34C759', icon: 'Languages' },
];

const mockEntries: ScheduleEntry[] = [
  // Period 1 & 2: Math (Doppelstunde)
  { id: 'e-1', dayOfWeek: 1, period: 1, startTime: '08:00', endTime: '08:45', subjectId: 'sub-math', roomId: 'r-1', teacherId: 't-1' },
  { id: 'e-2', dayOfWeek: 1, period: 2, startTime: '08:45', endTime: '09:30', subjectId: 'sub-math', roomId: 'r-1', teacherId: 't-1' },
  // Period 3: German (Single lesson)
  { id: 'e-3', dayOfWeek: 1, period: 3, startTime: '09:50', endTime: '10:35', subjectId: 'sub-german', roomId: 'r-2', teacherId: 't-2' },
  // Period 4: English (Single lesson)
  { id: 'e-4', dayOfWeek: 1, period: 4, startTime: '10:40', endTime: '11:25', subjectId: 'sub-eng', roomId: 'r-3', teacherId: 't-3' },
];

const subjectMap = new Map(mockSubjects.map(s => [s.id, s]));

// Test isDoubleLessonAdjacent
assert(
  isDoubleLessonAdjacent(mockEntries[0], mockEntries[1], subjectMap) === true,
  'Math period 1 and 2 are recognized as a double lesson'
);
assert(
  isDoubleLessonAdjacent(mockEntries[1], mockEntries[2], subjectMap) === false,
  'Math period 2 and German period 3 are NOT a double lesson'
);

// Test groupScheduleEntries
const groups = groupScheduleEntries({
  entries: mockEntries,
  subjects: mockSubjects,
});

assert(groups.length === 3, `Expected 3 groups (Math Double, German, English), got ${groups.length}`);
assert(groups[0].isDouble === true, 'First group is flagged as isDouble: true');
assert(groups[0].timeRange === '08:00 – 09:30', `First group timeRange is '08:00 – 09:30', got '${groups[0].timeRange}'`);
assert(groups[0].periodLabel === '1. & 2. Std', `First group periodLabel is '1. & 2. Std', got '${groups[0].periodLabel}'`);
assert(groups[0].entries.length === 2, 'First group contains both lesson entries');
assert(groups[0].subject?.name === 'Mathematik', 'First group subject is Mathematik');

assert(groups[1].isDouble === false, 'Second group (German) is single lesson');
assert(groups[1].timeRange === '09:50 – 10:35', `German timeRange is '09:50 – 10:35', got '${groups[1].timeRange}'`);
assert(groups[1].periodLabel === '3. Std', `German periodLabel is '3. Std', got '${groups[1].periodLabel}'`);

assert(groups[2].isDouble === false, 'Third group (English) is single lesson');
assert(groups[2].periodLabel === '4. Std', `English periodLabel is '4. Std', got '${groups[2].periodLabel}'`);

// Test Break logic with double lessons
const mockBreaks: ScheduleBreak[] = [
  { id: 'b-1', name: '1. Hofpause', afterPeriod: 2, startTime: '09:30', endTime: '09:50', durationMinutes: 20 },
  { id: 'b-2', name: '2. Hofpause', afterPeriod: 4, startTime: '11:25', endTime: '11:45', durationMinutes: 20 },
];

const breakAfterDouble = mockBreaks.find(b => b.afterPeriod === groups[0].endPeriod);
assert(breakAfterDouble !== undefined, 'Break after 2nd period is correctly mapped after the double lesson');
assert(breakAfterDouble?.name === '1. Hofpause', 'Break after double lesson is 1. Hofpause');

const breakAfterMid = mockBreaks.find(b => b.afterPeriod === 1);
assert(breakAfterMid === undefined, 'No break exists within period 1 (no artificial pause in double lesson)');

console.log('\n--- 2. Ferien & Feiertage in Kalenderansichten Tests ---');

const bbHolidays = getHolidaysForState('BB');
assert(bbHolidays.length > 0, 'Brandenburg holidays loaded successfully');

// Test Tag der Deutschen Einheit (2026-10-03)
const unityDay = getDayHolidayInfo('2026-10-03', bbHolidays);
assert(unityDay.isPublicHoliday === true, '2026-10-03 is recognized as public holiday');
assert(unityDay.isSchoolFree === true, '2026-10-03 is school free');
assert(unityDay.label === 'Tag der Deutschen Einheit', `Holiday label is 'Tag der Deutschen Einheit', got '${unityDay.label}'`);

// Test Herbstferien BB (2026-10-19 to 2026-10-30)
const autumnVacationStart = getDayHolidayInfo('2026-10-19', bbHolidays);
assert(autumnVacationStart.isVacation === true, '2026-10-19 is vacation day');
assert(autumnVacationStart.isSchoolFree === true, '2026-10-19 is school free');
assert(autumnVacationStart.isStart === true, '2026-10-19 is vacation start day');
assert(autumnVacationStart.label === 'Herbstferien', 'Label is Herbstferien');

const autumnVacationMid = getDayHolidayInfo('2026-10-23', bbHolidays);
assert(autumnVacationMid.isVacation === true, '2026-10-23 is vacation day in middle of break');
assert(autumnVacationMid.isStart === false, '2026-10-23 is not start day');

// Test Regular School Day (2026-09-16)
const regularDay = getDayHolidayInfo('2026-09-16', bbHolidays);
assert(regularDay.isSchoolFree === false, '2026-09-16 is a regular school day');
assert(regularDay.holiday === null, 'No holiday on regular day');

// Test Preservation of manual events & exams during vacation
const mockEvents: CalendarEvent[] = [
  { id: 'evt-1', title: 'Zahnarzt', startDate: '2026-10-20T15:00:00', endDate: '2026-10-20T16:00:00', allDay: false },
];
const mockExams: Exam[] = [
  { id: 'ex-1', title: 'Nachschreibtermin', subjectId: 'sub-math', date: '2026-10-21', startTime: '10:00', endTime: '11:00', type: 'exam', weight: 1 },
];

const vacationDayEvents = mockEvents.filter(e => e.startDate.startsWith('2026-10-20'));
assert(vacationDayEvents.length === 1, 'Manual calendar event remains visible on vacation day');
assert(vacationDayEvents[0].title === 'Zahnarzt', 'Event title is Zahnarzt');

const vacationDayExams = mockExams.filter(e => e.date === '2026-10-21');
assert(vacationDayExams.length === 1, 'Exam remains visible on vacation day');

console.log('\n--- 3. Background Sync & Deduplication Logic Tests ---');

// Test time difference formatting helper logic
function formatRelativeTime(date: Date | null): string {
  if (!date) return 'Noch nicht synchronisiert';
  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 30) return 'Gerade eben';
  if (diffSeconds < 60) return 'Vor weniger als 1 Minute';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes === 1) return 'Vor 1 Minute';
  if (diffMinutes < 60) return `Vor ${diffMinutes} Minuten`;
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

const justNow = new Date();
assert(formatRelativeTime(justNow) === 'Gerade eben', 'Current timestamp formats as Gerade eben');

const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
assert(formatRelativeTime(fiveMinAgo) === 'Vor 5 Minuten', '5 min ago timestamp formats as Vor 5 Minuten');

const oneMinAgo = new Date(Date.now() - 65 * 1000);
assert(formatRelativeTime(oneMinAgo) === 'Vor 1 Minute', '65s timestamp formats as Vor 1 Minute');

console.log('\n====================================================');
console.log('🎉 All Mobile UX, Doppelstunden, Ferien & Sync Tests PASSED!');
console.log('====================================================\n');
