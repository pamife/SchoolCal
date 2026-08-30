import { calculateSmartDayData } from '../src/utils/smartDayEngine';
import { calculateSchoolStatistics } from '../src/utils/statisticsEngine';
import {
  isWithinQuietHours,
} from '../src/services/notifications/notificationService';
import { evaluatePendingNotifications } from '../src/services/notifications/notificationScheduler';
import { buildSafeAISchoolContext } from '../src/services/ai/aiContextBuilder';
import { executeConfirmedAIAction } from '../src/services/ai/aiActionHandler';
import {
  isPlanEligible,
  getRequiredPlanForFeature,
} from '../src/config/features';
import type {
  ScheduleEntry,
  Subject,
  Teacher,
  Room,
  Substitution,
  Homework,
  Exam,
  Grade,
  NotificationPreferences,
  UserSettings,
} from '../src/types';

async function runSmartFeaturesTests() {
  console.log('====================================================');
  console.log('🚀 Running SchoolCal Smart- & Premium-Features Tests');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // --- Sample Test Data (Real Schema) ---
  const testSubjects: Subject[] = [
    { id: 'sub-mathe', name: 'Mathematik', shortName: 'M', color: '#007AFF', icon: 'Calculator' },
    { id: 'sub-deutsch', name: 'Deutsch', shortName: 'D', color: '#FF9500', icon: 'BookOpen' },
    { id: 'sub-englisch', name: 'Englisch', shortName: 'E', color: '#34C759', icon: 'Globe' },
    { id: 'sub-physik', name: 'Physik', shortName: 'Ph', color: '#AF52DE', icon: 'Atom' },
  ];

  const testTeachers: Teacher[] = [
    { id: 't-mueller', name: 'Herr Müller', shortName: 'MÜL' },
    { id: 't-schmidt', name: 'Frau Schmidt', shortName: 'SCH' },
  ];

  const testRooms: Room[] = [
    { id: 'r-204', name: '204' },
    { id: 'r-301', name: '301' },
  ];

  // Tuesday Schedule (Day 2)
  const testSchedule: ScheduleEntry[] = [
    { id: 'sch-1', dayOfWeek: 2, period: 1, startTime: '08:00', endTime: '08:45', subjectId: 'sub-deutsch', roomId: 'r-204', teacherId: 't-mueller' },
    { id: 'sch-2', dayOfWeek: 2, period: 2, startTime: '08:50', endTime: '09:35', subjectId: 'sub-mathe', roomId: 'r-204', teacherId: 't-mueller' },
    { id: 'sch-3', dayOfWeek: 2, period: 3, startTime: '10:00', endTime: '10:45', subjectId: 'sub-englisch', roomId: 'r-204', teacherId: 't-schmidt' },
    { id: 'sch-4', dayOfWeek: 2, period: 4, startTime: '10:50', endTime: '11:35', subjectId: 'sub-physik', roomId: 'r-301', teacherId: 't-schmidt' },
  ];

  const testSubstitutions: Substitution[] = [
    {
      id: 'subst-1',
      scheduleEntryId: 'sch-3',
      date: '2026-09-15',
      type: 'room_change',
      newRoomId: 'r-301',
      note: 'Englisch findet heute in Raum 301 statt.',
    },
  ];

  const testHomework: Homework[] = [
    { id: 'hw-1', title: 'Mathematik Arbeitsblatt', subjectId: 'sub-mathe', dueDate: '2026-09-15', dueTime: '12:00', priority: 'high', status: 'todo', createdAt: '2026-09-10' },
    { id: 'hw-2', title: 'Englisch Vokabeln', subjectId: 'sub-englisch', dueDate: '2026-09-15', dueTime: '14:00', priority: 'normal', status: 'todo', createdAt: '2026-09-12' },
    { id: 'hw-3', title: 'Deutsch Aufsatz', subjectId: 'sub-deutsch', dueDate: '2026-09-20', priority: 'normal', status: 'done', createdAt: '2026-09-08', completedAt: '2026-09-14' },
  ];

  const testExams: Exam[] = [
    {
      id: 'ex-1',
      title: 'Physik Klausur',
      subjectId: 'sub-physik',
      type: 'exam',
      date: '2026-09-18', // 3 days after Sep 15
      topics: [{ id: 'top-1', title: 'Mechanik', completed: true }, { id: 'top-2', title: 'Optik', completed: false }],
      studyProgress: 50,
    },
  ];

  // ----------------------------------------------------
  // TEST GROUP 1: 🧠 Smart Day Engine
  // ----------------------------------------------------
  console.log('--- 1. Smart Day Tests ---');

  // Test 1.1: Tuesday Morning before school (07:30)
  const tuesdayMorning = new Date('2026-09-15T07:30:00');
  const smartDayMorning = calculateSmartDayData({
    currentDate: tuesdayMorning,
    scheduleEntries: testSchedule,
    periodTimes: [],
    subjects: testSubjects,
    teachers: testTeachers,
    rooms: testRooms,
    substitutions: testSubstitutions,
    homework: testHomework,
    exams: testExams,
    calendarEvents: [],
    userName: 'Paul',
  });

  assert(smartDayMorning.timeContext === 'before_school', 'Smart Day detects before_school context');
  assert(smartDayMorning.todayLessonsCount === 4, 'Smart Day counts 4 lessons today');
  assert(smartDayMorning.nextLesson?.subject?.name === 'Deutsch', 'Smart Day identifies 1st lesson Deutsch');
  assert(smartDayMorning.todayHomework.length === 2, 'Smart Day identifies 2 homework due today');
  assert(smartDayMorning.upcomingExams.length === 1, 'Smart Day identifies 1 upcoming exam');
  assert(smartDayMorning.activeChanges.length === 1, 'Smart Day detects 1 room change substitution');

  // Test 1.2: During Lesson (09:00 - Mathe Period 2)
  const tuesdayInLesson = new Date('2026-09-15T09:00:00');
  const smartDayInLesson = calculateSmartDayData({
    currentDate: tuesdayInLesson,
    scheduleEntries: testSchedule,
    periodTimes: [],
    subjects: testSubjects,
    teachers: testTeachers,
    rooms: testRooms,
    substitutions: testSubstitutions,
    homework: testHomework,
    exams: testExams,
    calendarEvents: [],
    userName: 'Paul',
  });

  assert(smartDayInLesson.timeContext === 'in_lesson', 'Smart Day detects in_lesson context');
  assert(smartDayInLesson.currentLesson?.subject?.name === 'Mathematik', 'Smart Day identifies current lesson Mathematik');
  assert(smartDayInLesson.currentLesson?.minutesRemaining === 35, 'Smart Day calculates 35 mins remaining in lesson');
  assert(smartDayInLesson.headline.includes('Mathematik'), 'Headline reflects current lesson');

  // Test 1.3: Break before room-changed English (09:45)
  const tuesdayInBreak = new Date('2026-09-15T09:45:00');
  const smartDayBreak = calculateSmartDayData({
    currentDate: tuesdayInBreak,
    scheduleEntries: testSchedule,
    periodTimes: [],
    subjects: testSubjects,
    teachers: testTeachers,
    rooms: testRooms,
    substitutions: testSubstitutions,
    homework: testHomework,
    exams: testExams,
    calendarEvents: [],
    userName: 'Paul',
  });

  assert(smartDayBreak.timeContext === 'in_break', 'Smart Day detects in_break context');
  assert(smartDayBreak.nextLesson?.subject?.name === 'Englisch', 'Next lesson in break is Englisch');
  assert(smartDayBreak.nextLesson?.minutesUntil === 15, 'Next lesson starts in 15 minutes');

  // Test 1.4: After School (14:30)
  const tuesdayAfterSchool = new Date('2026-09-15T14:30:00');
  const smartDayAfterSchool = calculateSmartDayData({
    currentDate: tuesdayAfterSchool,
    scheduleEntries: testSchedule,
    periodTimes: [],
    subjects: testSubjects,
    teachers: testTeachers,
    rooms: testRooms,
    substitutions: testSubstitutions,
    homework: testHomework,
    exams: testExams,
    calendarEvents: [],
    userName: 'Paul',
  });

  assert(smartDayAfterSchool.timeContext === 'after_school', 'Smart Day detects after_school context');
  assert(smartDayAfterSchool.headline.includes('Schule geschafft'), 'Headline shows Schule geschafft');

  // Test 1.5: Weekend (Saturday)
  const saturdayDate = new Date('2026-09-19T11:00:00');
  const smartDayWeekend = calculateSmartDayData({
    currentDate: saturdayDate,
    scheduleEntries: testSchedule,
    periodTimes: [],
    subjects: testSubjects,
    teachers: testTeachers,
    rooms: testRooms,
    substitutions: [],
    homework: [],
    exams: [],
    calendarEvents: [],
    userName: 'Paul',
  });

  assert(smartDayWeekend.timeContext === 'weekend', 'Smart Day detects weekend context');
  assert(smartDayWeekend.headline.includes('Wochenende'), 'Headline wishes Schönes Wochenende');

  // Test 1.6: Empty dataset (0 fake data)
  const emptySmartDay = calculateSmartDayData({
    currentDate: tuesdayMorning,
    scheduleEntries: [],
    periodTimes: [],
    subjects: [],
    teachers: [],
    rooms: [],
    substitutions: [],
    homework: [],
    exams: [],
    calendarEvents: [],
  });

  assert(emptySmartDay.todayLessonsCount === 0, 'Empty state has 0 lessons');
  assert(emptySmartDay.todayHomework.length === 0, 'Empty state has 0 homework');
  assert(emptySmartDay.upcomingExams.length === 0, 'Empty state has 0 exams');
  assert(emptySmartDay.currentLesson === null, 'No current lesson in empty state');

  // ----------------------------------------------------
  // TEST GROUP 2: 📊 Statistics Engine
  // ----------------------------------------------------
  console.log('\n--- 2. Statistics Engine Tests ---');

  const testGrades: Grade[] = [
    { id: 'g-1', subjectId: 'sub-mathe', value: 1.5, weight: 2.0, type: 'exam', date: '2026-09-10', title: '1. Schulaufgabe' },
    { id: 'g-2', subjectId: 'sub-mathe', value: 2.0, weight: 1.0, type: 'test', date: '2026-09-12', title: 'Kurzarbeit' },
  ];

  const stats = calculateSchoolStatistics({
    period: 'this_week',
    scheduleEntries: testSchedule,
    periodTimes: [],
    subjects: testSubjects,
    homework: testHomework,
    exams: testExams,
    grades: testGrades,
    currentDate: tuesdayMorning,
  });

  assert(stats.totalLessonMinutes === 180, 'Calculates 180 minutes of lessons this week');
  assert(stats.totalLessonHoursFormatted === '3 h', 'Formats lesson time as 3 h');
  assert(stats.totalHomeworkCount === 3, 'Counts 3 total homework in period');
  assert(stats.completedHomeworkCount === 1, 'Counts 1 completed homework');
  assert(stats.overallCompletionRate === 33, 'Calculates 33% overall completion rate');
  assert(stats.subjectStats.length === 4, 'Includes all 4 subjects in breakdown');

  const matheStat = stats.subjectStats.find((s) => s.subjectId === 'sub-mathe');
  assert(matheStat?.totalTasks === 1, 'Mathe has 1 task');
  assert(matheStat?.completedTasks === 0, 'Mathe has 0 completed tasks');
  assert(matheStat?.averageGrade === 1.67, 'Calculates weighted grade average 1.67 for Mathe');

  // Empty data test
  const emptyStats = calculateSchoolStatistics({
    period: 'this_week',
    scheduleEntries: [],
    periodTimes: [],
    subjects: [],
    homework: [],
    exams: [],
    grades: [],
  });

  assert(emptyStats.hasEnoughDataForTrends === false, 'Empty data honest flag hasEnoughDataForTrends is false');
  assert(emptyStats.overallCompletionRate === 0, 'Empty data has 0% completion');

  // ----------------------------------------------------
  // TEST GROUP 3: 🔔 Notifications & Quiet Hours
  // ----------------------------------------------------
  console.log('\n--- 3. Notification & Quiet Hours Tests ---');

  const prefs: NotificationPreferences = {
    enabled: true,
    lessonReminders: true,
    lessonReminderMinutes: 10,
    roomChanges: true,
    teacherChanges: true,
    cancellations: true,
    substitutions: true,
    homeworkDueDayBefore: true,
    homeworkDue2HoursBefore: true,
    homeworkDue30MinBefore: false,
    examReminder7Days: true,
    examReminder3Days: true,
    examReminder1Day: true,
    examReminderDayOf: true,
    smartDayMorningBrief: true,
    schoolEndSummary: true,
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
  };

  // Test Quiet Hours
  const nightTime = new Date('2026-09-15T23:30:00');
  const daytime = new Date('2026-09-15T14:00:00');

  assert(isWithinQuietHours(prefs, nightTime) === true, '23:30 is recognized as within quiet hours (22:00-07:00)');
  assert(isWithinQuietHours(prefs, daytime) === false, '14:00 is recognized as outside quiet hours');

  // Notification Scheduler Evaluation at 07:55 (5 mins before 08:00 Deutsch)
  const morningAlertTime = new Date('2026-09-15T07:55:00');
  const pendingAlerts = evaluatePendingNotifications({
    scheduleEntries: testSchedule,
    substitutions: testSubstitutions,
    homework: testHomework,
    exams: testExams,
    subjects: testSubjects,
    rooms: testRooms,
    teachers: testTeachers,
    preferences: prefs,
    currentDate: morningAlertTime,
  });

  assert(pendingAlerts.length > 0, 'Evaluates pending notifications for morning');
  const lessonAlert = pendingAlerts.find((a) => a.type === 'lesson');
  assert(Boolean(lessonAlert && lessonAlert.title.includes('Deutsch')), 'Triggers Deutsch lesson reminder 5 min before start');
  const substAlert = pendingAlerts.find((a) => a.type === 'substitution');
  assert(Boolean(substAlert && substAlert.title.includes('Raumänderung')), 'Triggers substitution room change notification');

  // ----------------------------------------------------
  // TEST GROUP 4: 🤖 AI Context & Action Handler
  // ----------------------------------------------------
  console.log('\n--- 4. AI Assistant Context & Action Handler Tests ---');

  const mockSettings: UserSettings = {
    theme: 'dark',
    accentColor: '#007AFF',
    state: 'BY',
    schoolName: 'Gymnasium München',
    gradeLevel: 'Klasse 10b',
    periodTimes: [],
    defaultCalendarView: 'week',
    notificationsEnabled: true,
    dailySummaryTime: '07:15',
    activeTimetableVersion: 'default',
  };

  const aiContext = buildSafeAISchoolContext({
    currentDate: tuesdayMorning,
    userName: 'Paul',
    settings: mockSettings,
    subjects: testSubjects,
    teachers: testTeachers,
    rooms: testRooms,
    scheduleEntries: testSchedule,
    homework: testHomework,
    exams: testExams,
    grades: testGrades,
  });

  assert(aiContext.userName === 'Paul', 'Context contains student user name');
  assert(aiContext.todaySchedule.length === 4, 'Context contains 4 schedule entries for today');
  assert(aiContext.openHomework.length === 2, 'Context contains ONLY open homework (done tasks excluded)');
  assert(aiContext.upcomingExams.length === 1, 'Context contains upcoming exams');
  assert(aiContext.gradesSummary?.overallAverage !== undefined, 'Context contains grade average');

  // Test AI Action execution upon explicit confirmation
  let addedTasksCount = 0;
  const mockDeps = {
    addHomework: async (_uid: string, hw: any) => {
      addedTasksCount++;
      return hw;
    },
  };

  const studyPlanAction = {
    type: 'CREATE_STUDY_PLAN' as const,
    title: 'Physik Klausur Vorbereitung',
    requiresConfirmation: true,
    data: {
      units: [
        { title: 'Physik: Optik Formeln', subjectId: 'sub-physik', date: '2026-09-16' },
        { title: 'Physik: Mechanik Altklausur', subjectId: 'sub-physik', date: '2026-09-17' },
      ],
    },
  };

  const actionResult = await executeConfirmedAIAction(studyPlanAction, 'user-123', mockDeps);
  assert(actionResult.success === true, 'Confirmed AI Action executes successfully');
  assert(addedTasksCount === 2, 'AI action created exactly 2 task units in user store');

  // ----------------------------------------------------
  // TEST GROUP 5: 🔒 Feature Gates
  // ----------------------------------------------------
  console.log('\n--- 5. Feature Gate & Licensing Tests ---');

  assert(isPlanEligible('STANDARD', 'STANDARD') === true, 'Standard has Standard');
  assert(isPlanEligible('STANDARD', 'PLUS') === false, 'Standard does not have Plus');
  assert(isPlanEligible('STANDARD', 'PRO') === false, 'Standard does not have Pro');

  assert(getRequiredPlanForFeature('smartDayBasic') === 'STANDARD', 'smartDayBasic requires Standard');
  assert(getRequiredPlanForFeature('smartDayAdvanced') === 'PLUS', 'smartDayAdvanced requires Plus');
  assert(getRequiredPlanForFeature('aiSchoolAssistant') === 'PRO', 'aiSchoolAssistant requires Pro');
  assert(getRequiredPlanForFeature('aiSmartDay') === 'PRO', 'aiSmartDay requires Pro');
  assert(getRequiredPlanForFeature('basicStats') === 'STANDARD', 'basicStats requires Standard');
  assert(getRequiredPlanForFeature('advancedStats') === 'PLUS', 'advancedStats requires Plus');
  assert(getRequiredPlanForFeature('proStats') === 'PRO', 'proStats requires Pro');
  assert(getRequiredPlanForFeature('basicNotifications') === 'STANDARD', 'basicNotifications requires Standard');
  assert(getRequiredPlanForFeature('advancedNotifications') === 'PLUS', 'advancedNotifications requires Plus');

  console.log('\n====================================================');
  console.log(`Test Results: ${passed} passed, ${failed} failed.`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSmartFeaturesTests().catch((err) => {
  console.error('Test Suite Exception:', err);
  process.exit(1);
});
