import {
  DEFAULT_SCHOOL_ID,
  DEFAULT_SCHOOL_PROFILE,
  OFFICIAL_SCHERPF_PERIODS,
  OFFICIAL_SCHERPF_BREAKS,
  DEFAULT_WEBUNTIS_CONFIG,
} from '../src/config/schoolConfig';
import { getHolidaysForState } from '../src/data/holidays';
import { calculateSmartDayData } from '../src/utils/smartDayEngine';
import { calculateAutoDueDate, recalculateAutoDueDates } from '../src/utils/homeworkDueDateEngine';
import type { ScheduleEntry, Homework, UserSettings } from '../src/types';

function runTestSuite() {
  console.log('🧪 Starting SchoolCal - Scherpf-Gymnasium & WebUntis Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Central School Constants & ID
  console.log('📋 Test Group 1: Central School Configuration & Constants');
  assert(
    DEFAULT_SCHOOL_ID === 'christa-peter-scherpf-gymnasium-prenzlau',
    'Default schoolId is christa-peter-scherpf-gymnasium-prenzlau'
  );
  assert(
    DEFAULT_SCHOOL_PROFILE.name === 'Christa-und-Peter-Scherpf-Gymnasium',
    'School profile name matches Christa-und-Peter-Scherpf-Gymnasium'
  );
  assert(
    DEFAULT_SCHOOL_PROFILE.city === 'Prenzlau' && DEFAULT_SCHOOL_PROFILE.state === 'BB',
    'School city is Prenzlau and state is BB (Brandenburg)'
  );

  // 2. Official Lesson Periods
  console.log('\n⏰ Test Group 2: Official Scherpf Lesson Periods (Hausordnung)');
  assert(OFFICIAL_SCHERPF_PERIODS.length === 10, 'Total of 10 official periods configured');
  assert(
    OFFICIAL_SCHERPF_PERIODS[0].startTime === '07:30' && OFFICIAL_SCHERPF_PERIODS[0].endTime === '08:15',
    '1. Stunde: 07:30 – 08:15'
  );
  assert(
    OFFICIAL_SCHERPF_PERIODS[1].startTime === '08:20' && OFFICIAL_SCHERPF_PERIODS[1].endTime === '09:05',
    '2. Stunde: 08:20 – 09:05'
  );
  assert(
    OFFICIAL_SCHERPF_PERIODS[2].startTime === '09:20' && OFFICIAL_SCHERPF_PERIODS[2].endTime === '10:05',
    '3. Stunde: 09:20 – 10:05'
  );
  assert(
    OFFICIAL_SCHERPF_PERIODS[3].startTime === '10:10' && OFFICIAL_SCHERPF_PERIODS[3].endTime === '10:55',
    '4. Stunde: 10:10 – 10:55'
  );
  assert(
    OFFICIAL_SCHERPF_PERIODS[4].startTime === '11:10' && OFFICIAL_SCHERPF_PERIODS[4].endTime === '11:55',
    '5. Stunde: 11:10 – 11:55'
  );
  assert(
    OFFICIAL_SCHERPF_PERIODS[5].startTime === '12:00' && OFFICIAL_SCHERPF_PERIODS[5].endTime === '12:45',
    '6. Stunde: 12:00 – 12:45'
  );
  assert(
    OFFICIAL_SCHERPF_PERIODS[6].startTime === '13:20' && OFFICIAL_SCHERPF_PERIODS[6].endTime === '14:05',
    '7. Stunde: 13:20 – 14:05'
  );
  assert(
    OFFICIAL_SCHERPF_PERIODS[7].startTime === '14:10' && OFFICIAL_SCHERPF_PERIODS[7].endTime === '14:55',
    '8. Stunde: 14:10 – 14:55'
  );
  assert(
    OFFICIAL_SCHERPF_PERIODS[8].startTime === '15:00' && OFFICIAL_SCHERPF_PERIODS[8].endTime === '15:45',
    '9. Stunde: 15:00 – 15:45'
  );
  assert(
    OFFICIAL_SCHERPF_PERIODS[9].startTime === '15:45' && OFFICIAL_SCHERPF_PERIODS[9].endTime === '16:30',
    '10. Stunde: 15:45 – 16:30'
  );

  // 3. Official School Breaks
  console.log('\n☕ Test Group 3: Official Scherpf Breaks');
  assert(OFFICIAL_SCHERPF_BREAKS.length === 3, 'Total of 3 official major breaks configured');
  const break1 = OFFICIAL_SCHERPF_BREAKS.find((b) => b.id === 'break-hof-1');
  const break2 = OFFICIAL_SCHERPF_BREAKS.find((b) => b.id === 'break-hof-2');
  const lunch = OFFICIAL_SCHERPF_BREAKS.find((b) => b.id === 'break-lunch');

  assert(
    Boolean(break1 && break1.startTime === '09:05' && break1.endTime === '09:20' && break1.afterPeriod === 2),
    '1. Hofpause: 09:05 – 09:20 (nach 2. Stunde)'
  );
  assert(
    Boolean(break2 && break2.startTime === '10:55' && break2.endTime === '11:10' && break2.afterPeriod === 4),
    '2. Hofpause: 10:55 – 11:10 (nach 4. Stunde)'
  );
  assert(
    Boolean(lunch && lunch.startTime === '12:45' && lunch.endTime === '13:20' && lunch.afterPeriod === 6),
    'Mittagspause: 12:45 – 13:20 (nach 6. Stunde)'
  );

  // 4. WebUntis Central Configuration
  console.log('\n🌐 Test Group 4: WebUntis Central Configuration');
  assert(
    DEFAULT_WEBUNTIS_CONFIG.server === 'arche.webuntis.com',
    'WebUntis Server is arche.webuntis.com'
  );
  assert(
    DEFAULT_WEBUNTIS_CONFIG.school === 'scherpf-gymnasium',
    'WebUntis School key is scherpf-gymnasium'
  );
  assert(DEFAULT_WEBUNTIS_CONFIG.enabled === true, 'WebUntis is enabled by default');

  // 5. Brandenburg Holidays Database
  console.log('\n🏖️ Test Group 5: Brandenburg (BB) Holidays 2026/2027');
  const bbHolidays = getHolidaysForState('BB');
  assert(bbHolidays.length >= 10, 'Brandenburg holiday catalogue is populated');
  const hasHerbst26 = bbHolidays.some((h) => h.name.includes('Herbstferien') && h.startDate.startsWith('2026'));
  const hasWeihnachten26 = bbHolidays.some((h) => h.name.includes('Weihnachtsferien') && h.startDate.startsWith('2026'));
  const hasWinter27 = bbHolidays.some((h) => h.name.includes('Winterferien') && h.startDate.startsWith('2027'));
  const hasOstern27 = bbHolidays.some((h) => h.name.includes('Osterferien') && h.startDate.startsWith('2027'));
  const hasSommer27 = bbHolidays.some((h) => h.name.includes('Sommerferien') && h.startDate.startsWith('2027'));

  assert(hasHerbst26, 'Herbstferien 2026 Brandenburg present');
  assert(hasWeihnachten26, 'Weihnachtsferien 2026 Brandenburg present');
  assert(hasWinter27, 'Winterferien 2027 Brandenburg present');
  assert(hasOstern27, 'Osterferien 2027 Brandenburg present');
  assert(hasSommer27, 'Sommerferien 2027 Brandenburg present');

  // 6. Smart Day Engine with Pauses & Lesson Context
  console.log('\n🧠 Test Group 6: Smart Day Engine Break & Time Context');
  const testEntries: ScheduleEntry[] = [
    {
      id: 'e1',
      subjectId: 'sub_math',
      dayOfWeek: 1, // Montag
      period: 1,
      startTime: '07:30',
      endTime: '08:15',
    },
    {
      id: 'e2',
      subjectId: 'sub_math',
      dayOfWeek: 1,
      period: 2,
      startTime: '08:20',
      endTime: '09:05',
    },
    {
      id: 'e3',
      subjectId: 'sub_de',
      dayOfWeek: 1,
      period: 3,
      startTime: '09:20',
      endTime: '10:05',
    },
  ];

  // Test during 1. Hofpause (09:10) on a Monday
  const mondayPauseTime = new Date('2026-09-07T09:10:00');
  const smartDayPause = calculateSmartDayData({
    currentDate: mondayPauseTime,
    scheduleEntries: testEntries,
    periodTimes: OFFICIAL_SCHERPF_PERIODS,
    breaks: OFFICIAL_SCHERPF_BREAKS,
    subjects: [
      { id: 'sub_math', name: 'Mathematik', shortName: 'Mat', color: '#007AFF' },
      { id: 'sub_de', name: 'Deutsch', shortName: 'Deu', color: '#FF9500' },
    ],
    teachers: [],
    rooms: [],
    substitutions: [],
    homework: [],
    exams: [],
    calendarEvents: [],
    holidayState: 'BB',
  });

  assert(smartDayPause.timeContext === 'in_break', 'Smart Day correctly detects in_break state');
  assert(smartDayPause.activeBreak?.name === '1. Hofpause', 'Active break is 1. Hofpause');
  assert(smartDayPause.headline.includes('1. Hofpause'), 'Headline explicitly contains 1. Hofpause');
  assert(smartDayPause.nextLesson?.entry.period === 3, 'Next lesson is 3. Stunde Deutsch');

  // 7. Auto Homework Due Date Calculation Engine
  console.log('\n📚 Test Group 7: Homework Due Date Engine (AUTO vs MANUAL)');
  const dummySettings: UserSettings = {
    theme: 'system',
    state: 'BB',
    defaultCalendarView: 'week',
    smartDayEnabled: true,
    hapticFeedback: true,
    notifications: {
      enabled: false,
      morningReminder: false,
      morningReminderTime: '07:00',
      eveningReminder: false,
      eveningReminderTime: '19:00',
      homeworkReminder: false,
      homeworkReminderLeadMinutes: 60,
      examLeadDays: 3,
      soundEnabled: true,
    },
    periodTimes: OFFICIAL_SCHERPF_PERIODS,
    breaks: OFFICIAL_SCHERPF_BREAKS,
  };

  const calcAutoResult = calculateAutoDueDate({
    subjectId: 'sub_math',
    referenceDate: new Date('2026-09-07T12:00:00'), // Montag nach Unterricht
    scheduleEntries: testEntries,
    substitutions: [],
    holidayState: 'BB',
    settings: dummySettings,
  });

  assert(
    calcAutoResult !== null && calcAutoResult.found && calcAutoResult.dueDate === '2026-09-14',
    'Next Math lesson on next Monday (2026-09-14) correctly calculated'
  );

  const manualHw: Homework = {
    id: 'hw1',
    subjectId: 'sub_math',
    title: 'Übungsblatt S. 42',
    dueDate: '2026-09-10',
    dueDateMode: 'MANUAL',
    status: 'open',
    priority: 'normal',
    createdAt: '2026-09-07T08:00:00Z',
  };

  const autoHw: Homework = {
    id: 'hw2',
    subjectId: 'sub_math',
    title: 'Buch S. 100 Nr 4',
    dueDate: '2026-09-08',
    dueDateMode: 'AUTO',
    status: 'open',
    priority: 'normal',
    createdAt: '2026-09-07T08:00:00Z',
  };

  const recalcResult = recalculateAutoDueDates({
    homeworkList: [manualHw, autoHw],
    scheduleEntries: testEntries,
    substitutions: [],
    holidayState: 'BB',
    settings: dummySettings,
    referenceDate: new Date('2026-09-07T12:00:00'),
  });

  const updatedManual = recalcResult.updatedHomework.find((h) => h.id === 'hw1');
  const updatedAuto = recalcResult.updatedHomework.find((h) => h.id === 'hw2');

  assert(
    updatedManual?.dueDate === '2026-09-10',
    'MANUAL homework due date remains unchanged'
  );
  assert(
    updatedAuto?.dueDate === '2026-09-14',
    'AUTO homework due date is recalculated to next valid lesson date'
  );

  console.log(`\n=============================================`);
  console.log(`🎉 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log(`=============================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
