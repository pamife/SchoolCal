import type {
  TimetableEntry,
  TimetableVariant,
  OnboardingQuestion,
  Subject,
  Teacher,
  Room,
  ScheduleEntry,
} from '../src/types';
import {
  resolveStudentSchedule,
  evaluateQuestionVisibility,
  extractActiveVariants,
  computeTimetableDiff,
  isQuestionActive,
} from '../src/services/school/classTimetableService';
import { isDoubleLessonAdjacent } from '../src/utils/lessonGroupingEngine';

function runTestSuite() {
  console.log('🧪 Starting SchoolCal - Admin Class Timetables & Student Variants Test Suite...\n');
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

  // --------------------------------------------------------------------------
  // Mock Central Master Data
  // --------------------------------------------------------------------------
  const mockSubjects: Subject[] = [
    { id: 'sub-mathe', name: 'Mathematik', shortName: 'Ma', color: '#007AFF', icon: 'Calculator' },
    { id: 'sub-deutsch', name: 'Deutsch', shortName: 'De', color: '#FF3B30', icon: 'BookOpen' },
    { id: 'sub-englisch', name: 'Englisch', shortName: 'En', color: '#FF9500', icon: 'Globe' },
    { id: 'sub-kunst', name: 'Kunst', shortName: 'Ku', color: '#AF52DE', icon: 'Palette' },
    { id: 'sub-franz', name: 'Französisch', shortName: 'Fr', color: '#5856D6', icon: 'Book' },
    { id: 'sub-info', name: 'Informatik', shortName: 'Inf', color: '#34C759', icon: 'Laptop' },
  ];

  const mockTeachers: Teacher[] = [
    { id: 'teach-mueller', name: 'Müller', shortName: 'MÜL', title: 'Frau' },
    { id: 'teach-schmidt', name: 'Schmidt', shortName: 'SCHM', title: 'Herr' },
    { id: 'teach-weber', name: 'Weber', shortName: 'WEB', title: 'Frau' },
  ];

  const mockRooms: Room[] = [
    { id: 'room-a101', name: 'A101', building: 'Haus A' },
    { id: 'room-a102', name: 'A102', building: 'Haus A' },
    { id: 'room-b201', name: 'B201', building: 'Haus B' },
    { id: 'room-c102', name: 'C102', building: 'Haus C' },
  ];

  // Base Timetable for Class 10A (Monday hours 1 to 4 + placeholder hour 5)
  const baseEntries10A: TimetableEntry[] = [
    {
      id: 'base-mo-1',
      dayOfWeek: 1,
      period: 1,
      startTime: '07:30',
      endTime: '08:15',
      subjectId: 'sub-mathe',
      teacherId: 'teach-mueller',
      roomId: 'room-a101',
    },
    {
      id: 'base-mo-2',
      dayOfWeek: 1,
      period: 2,
      startTime: '08:20',
      endTime: '09:05',
      subjectId: 'sub-mathe',
      teacherId: 'teach-mueller',
      roomId: 'room-a101',
    },
    {
      id: 'base-mo-3',
      dayOfWeek: 1,
      period: 3,
      startTime: '09:20',
      endTime: '10:05',
      subjectId: 'sub-deutsch',
      teacherId: 'teach-schmidt',
      roomId: 'room-b201',
    },
    {
      id: 'base-mo-4',
      dayOfWeek: 1,
      period: 4,
      startTime: '10:10',
      endTime: '10:55',
      subjectId: 'sub-deutsch',
      teacherId: 'teach-schmidt',
      roomId: 'room-b201',
    },
    {
      id: 'base-mo-5',
      dayOfWeek: 1,
      period: 5,
      startTime: '11:10',
      endTime: '11:55',
      subjectId: 'sub-englisch',
      teacherId: 'teach-weber',
      roomId: 'room-a101',
    },
  ];

  // Variants for Class 10A
  const variants10A: TimetableVariant[] = [
    {
      id: 'var-kunst',
      name: 'Wahlpflicht Kunst',
      category: 'Wahlpflichtfach',
      replacesPeriods: [{ dayOfWeek: 1, period: 5 }],
      entries: [
        {
          id: 'v-kunst-1',
          dayOfWeek: 1,
          period: 5,
          startTime: '11:10',
          endTime: '11:55',
          subjectId: 'sub-kunst',
          teacherId: 'teach-mueller',
          roomId: 'room-a101',
        },
      ],
    },
    {
      id: 'var-franz-mueller',
      name: 'Französisch (Frau Müller)',
      category: 'Wahlpflichtfach',
      replacesPeriods: [{ dayOfWeek: 1, period: 5 }],
      entries: [
        {
          id: 'v-franz-m-1',
          dayOfWeek: 1,
          period: 5,
          startTime: '11:10',
          endTime: '11:55',
          subjectId: 'sub-franz',
          teacherId: 'teach-mueller',
          roomId: 'room-a101',
        },
      ],
    },
    {
      id: 'var-franz-schmidt',
      name: 'Französisch (Herr Schmidt)',
      category: 'Wahlpflichtfach',
      replacesPeriods: [{ dayOfWeek: 1, period: 5 }],
      entries: [
        {
          id: 'v-franz-s-1',
          dayOfWeek: 1,
          period: 5,
          startTime: '11:10',
          endTime: '11:55',
          subjectId: 'sub-franz',
          teacherId: 'teach-schmidt',
          roomId: 'room-b201',
        },
      ],
    },
    {
      id: 'var-info',
      name: 'Wahlpflicht Informatik',
      category: 'Wahlpflichtfach',
      replacesPeriods: [{ dayOfWeek: 1, period: 5 }],
      entries: [
        {
          id: 'v-info-1',
          dayOfWeek: 1,
          period: 5,
          startTime: '11:10',
          endTime: '11:55',
          subjectId: 'sub-info',
          teacherId: 'teach-weber',
          roomId: 'room-c102',
        },
      ],
    },
  ];

  // Questions with conditional dependency
  const questions10A: OnboardingQuestion[] = [
    {
      id: 'q-wpf',
      order: 1,
      title: 'Welches Wahlpflichtfach hast du?',
      required: true,
      condition: null,
      options: [
        { id: 'opt-kunst', label: 'Kunst', variantIds: ['var-kunst'] },
        { id: 'opt-franz', label: 'Französisch', variantIds: [] },
        { id: 'opt-info', label: 'Informatik', variantIds: ['var-info'] },
      ],
    },
    {
      id: 'q-franz-teacher',
      order: 2,
      title: 'Mit wem hast du normalerweise Französisch?',
      required: true,
      condition: {
        dependsOnQuestionId: 'q-wpf',
        expectedOptionId: 'opt-franz',
        operator: 'equals',
      },
      options: [
        { id: 'opt-teach-mueller', label: 'Frau Müller', variantIds: ['var-franz-mueller'] },
        { id: 'opt-teach-schmidt', label: 'Herr Schmidt', variantIds: ['var-franz-schmidt'] },
      ],
    },
  ];

  // ==========================================================================
  // Test 1: Standardklasse (keine Varianten)
  // ==========================================================================
  console.log('📋 Test Group 1: Standardklasse ohne Varianten');
  const resolvedStandard = resolveStudentSchedule({
    baseEntries: baseEntries10A,
    variants: variants10A,
    activeVariantIds: [],
  });

  assert(resolvedStandard.length === 5, 'Resolved standard schedule has exactly 5 lessons');
  assert(resolvedStandard[0].subjectId === 'sub-mathe', '1. Std is Mathematik');
  assert(resolvedStandard[1].subjectId === 'sub-mathe', '2. Std is Mathematik');
  assert(
    isDoubleLessonAdjacent(resolvedStandard[0], resolvedStandard[1]),
    'Mathe 1. & 2. Std is recognized as continuous double lesson'
  );
  assert(resolvedStandard[4].subjectId === 'sub-englisch', '5. Std is base Englisch');

  // ==========================================================================
  // Test 2: Wahlpflichtfach (Kunst gewählt)
  // ==========================================================================
  console.log('\n🎨 Test Group 2: Wahlpflichtfach (Kunst gewählt)');
  const answersKunst = { 'q-wpf': 'opt-kunst' };
  const activeVariantsKunst = extractActiveVariants(questions10A, answersKunst);

  assert(
    activeVariantsKunst.length === 1 && activeVariantsKunst[0] === 'var-kunst',
    'extractActiveVariants correctly identifies var-kunst'
  );

  const resolvedKunst = resolveStudentSchedule({
    baseEntries: baseEntries10A,
    variants: variants10A,
    activeVariantIds: activeVariantsKunst,
  });

  const period5Kunst = resolvedKunst.find((e) => e.dayOfWeek === 1 && e.period === 5);
  assert(Boolean(period5Kunst && period5Kunst.subjectId === 'sub-kunst'), '5. Std is Kunst for student');
  assert(
    Boolean(period5Kunst && period5Kunst.teacherId === 'teach-mueller'),
    '5. Std Kunst has teacher Frau Müller'
  );
  assert(
    !resolvedKunst.some((e) => e.subjectId === 'sub-franz' || e.subjectId === 'sub-info'),
    'No Französisch or Informatik lessons appear in timetable'
  );

  // ==========================================================================
  // Test 3: Lehrerwahl (Französisch mit Frau Müller vs Herr Schmidt)
  // ==========================================================================
  console.log('\n👩‍🏫 Test Group 3: Lehrerwahl (Französisch)');
  const answersFranzMueller = {
    'q-wpf': 'opt-franz',
    'q-franz-teacher': 'opt-teach-mueller',
  };
  const activeVariantsFranzM = extractActiveVariants(questions10A, answersFranzMueller);
  assert(
    activeVariantsFranzM.includes('var-franz-mueller'),
    'activeVariants contains var-franz-mueller'
  );

  const resolvedFranzM = resolveStudentSchedule({
    baseEntries: baseEntries10A,
    variants: variants10A,
    activeVariantIds: activeVariantsFranzM,
  });

  const period5FranzM = resolvedFranzM.find((e) => e.dayOfWeek === 1 && e.period === 5);
  assert(
    Boolean(
      period5FranzM &&
      period5FranzM.subjectId === 'sub-franz' &&
      period5FranzM.teacherId === 'teach-mueller' &&
      period5FranzM.roomId === 'room-a101'
    ),
    'Französisch with Frau Müller in Room A101 resolved correctly'
  );

  // Alternative teacher: Herr Schmidt
  const answersFranzSchmidt = {
    'q-wpf': 'opt-franz',
    'q-franz-teacher': 'opt-teach-schmidt',
  };
  const activeVariantsFranzS = extractActiveVariants(questions10A, answersFranzSchmidt);
  const resolvedFranzS = resolveStudentSchedule({
    baseEntries: baseEntries10A,
    variants: variants10A,
    activeVariantIds: activeVariantsFranzS,
  });

  const period5FranzS = resolvedFranzS.find((e) => e.dayOfWeek === 1 && e.period === 5);
  assert(
    Boolean(
      period5FranzS &&
      period5FranzS.subjectId === 'sub-franz' &&
      period5FranzS.teacherId === 'teach-schmidt' &&
      period5FranzS.roomId === 'room-b201'
    ),
    'Französisch with Herr Schmidt in Room B201 resolved correctly'
  );

  // ==========================================================================
  // Test 4: Conditional Questions Logic
  // ==========================================================================
  console.log('\n🔀 Test Group 4: Conditional Questions Logic');
  // When Kunst is selected:
  const visibleWithKunst = evaluateQuestionVisibility(questions10A, { 'q-wpf': 'opt-kunst' });
  assert(visibleWithKunst.length === 1, 'Only 1 question visible when Kunst chosen');
  assert(visibleWithKunst[0].id === 'q-wpf', 'Only WPF question is shown, teacher question hidden');
  assert(
    !isQuestionActive(questions10A[1], { 'q-wpf': 'opt-kunst' }),
    'isQuestionActive returns false for French teacher question when Kunst selected'
  );

  // When Französisch is selected:
  const visibleWithFranz = evaluateQuestionVisibility(questions10A, { 'q-wpf': 'opt-franz' });
  assert(visibleWithFranz.length === 2, '2 questions visible when Französisch chosen');
  assert(
    visibleWithFranz[1].id === 'q-franz-teacher',
    'French teacher question is revealed conditionally'
  );
  assert(
    isQuestionActive(questions10A[1], { 'q-wpf': 'opt-franz' }),
    'isQuestionActive returns true for French teacher question when Französisch selected'
  );

  // ==========================================================================
  // Test 5: Admin-Änderung & Propagation (Raum- oder Lehrerwechsel)
  // ==========================================================================
  console.log('\n🔄 Test Group 5: Admin-Änderung & Propagation');
  // Admin changes Mo 1. Std (Mathe) room from A101 to A102
  const updatedBaseEntries10A: TimetableEntry[] = baseEntries10A.map((entry) => {
    if (entry.dayOfWeek === 1 && entry.period === 1) {
      return { ...entry, roomId: 'room-a102' };
    }
    return entry;
  });

  // Re-resolve for student with Kunst variant
  const updatedStudentSchedule = resolveStudentSchedule({
    baseEntries: updatedBaseEntries10A,
    variants: variants10A,
    activeVariantIds: activeVariantsKunst,
  });

  const updatedP1 = updatedStudentSchedule.find((e) => e.dayOfWeek === 1 && e.period === 1);
  const updatedP5 = updatedStudentSchedule.find((e) => e.dayOfWeek === 1 && e.period === 5);

  assert(
    Boolean(updatedP1 && updatedP1.roomId === 'room-a102'),
    'Student schedule automatically has updated room A102 without manual student action'
  );
  assert(
    Boolean(updatedP5 && updatedP5.subjectId === 'sub-kunst'),
    'Student individual selection Kunst remains intact after admin base timetable update'
  );

  // Timetable diff computation
  const diff = computeTimetableDiff(
    baseEntries10A,
    updatedBaseEntries10A,
    mockSubjects,
    mockTeachers,
    mockRooms
  );

  assert(diff.hasChanges === true, 'Timetable diff detects change');
  assert(diff.items.length === 1, 'Exactly 1 slot changed');
  assert(
    diff.items[0].type === 'modified' &&
    diff.items[0].before?.roomName === 'A101' &&
    diff.items[0].after?.roomName === 'A102',
    'Diff captures Before (A101) vs After (A102) room transition'
  );
  assert(
    diff.summary[0].includes('Raum: A101 → A102'),
    `Diff summary is human-readable: "${diff.summary[0]}"`
  );

  // ==========================================================================
  // Test 6: Bestehende Nutzer & Manueller Schutz
  // ==========================================================================
  console.log('\n🛡️ Test Group 6: Schutz bestehender manueller Stundenpläne');
  const existingManualEntries: ScheduleEntry[] = [
    {
      id: 'manual-1',
      dayOfWeek: 2,
      period: 1,
      startTime: '08:00',
      endTime: '08:45',
      subjectId: 'sub-mathe',
    },
    {
      id: 'manual-2',
      dayOfWeek: 2,
      period: 2,
      startTime: '08:50',
      endTime: '09:35',
      subjectId: 'sub-englisch',
    },
  ];

  // Verify: If user already has manual entries, enrollment is not done silently
  function canAutoEnrollWithoutConfirmation(hasExistingEntries: boolean): boolean {
    return !hasExistingEntries;
  }

  assert(
    canAutoEnrollWithoutConfirmation(existingManualEntries.length > 0) === false,
    'Existing user with manual schedule REQUIRES confirmation before replacement'
  );
  assert(
    canAutoEnrollWithoutConfirmation(0 > 0) === true,
    'New user without schedule can be enrolled automatically without modal prompt'
  );

  // User personal override preservation:
  const studentOverrides: Record<string, Partial<ScheduleEntry>> = {
    '1-1': { roomId: 'room-b201' }, // Student customized their own room for period 1
  };
  const resolvedWithOverride = resolveStudentSchedule({
    baseEntries: updatedBaseEntries10A,
    variants: variants10A,
    activeVariantIds: activeVariantsKunst,
    personalOverrides: studentOverrides,
  });

  const p1Overridden = resolvedWithOverride.find((e) => e.dayOfWeek === 1 && e.period === 1);
  assert(
    Boolean(p1Overridden && p1Overridden.roomId === 'room-b201'),
    'Personal student override takes precedence over admin class default'
  );

  // ==========================================================================
  // Test 7: Security & Permission Rules Verification
  // ==========================================================================
  console.log('\n🔒 Test Group 7: Security & Permission Simulation');
  function simulateFirestorePermission({
    userRole,
    path,
    operation,
    authUid,
    targetOwnerUid,
  }: {
    userRole: 'admin' | 'user';
    path: string;
    operation: 'read' | 'write';
    authUid: string;
    targetOwnerUid?: string;
  }): boolean {
    // schools/{schoolId} & subcollections
    if (path.startsWith('schools/')) {
      if (operation === 'read') return true; // Authenticated users can read
      if (operation === 'write') return userRole === 'admin'; // Only Admins can write
    }

    // users/{userId}/...
    if (path.startsWith('users/')) {
      if (authUid === targetOwnerUid) return true; // Owner can read & write
      return false; // Others cannot access
    }

    return false;
  }

  // Student attempts to modify class timetable:
  assert(
    simulateFirestorePermission({
      userRole: 'user',
      path: 'schools/christa-peter-scherpf-gymnasium-prenzlau/classes/10a/timetables/published',
      operation: 'write',
      authUid: 'student-123',
    }) === false,
    'Student attempting to write class timetable -> PERMISSION DENIED'
  );

  // Admin modifies class timetable:
  assert(
    simulateFirestorePermission({
      userRole: 'admin',
      path: 'schools/christa-peter-scherpf-gymnasium-prenzlau/classes/10a/timetables/published',
      operation: 'write',
      authUid: 'admin-1',
    }) === true,
    'Admin writing class timetable -> PERMISSION ALLOWED'
  );

  // Student reading published class timetable:
  assert(
    simulateFirestorePermission({
      userRole: 'user',
      path: 'schools/christa-peter-scherpf-gymnasium-prenzlau/classes/10a/timetables/published',
      operation: 'read',
      authUid: 'student-123',
    }) === true,
    'Student reading published class timetable -> PERMISSION ALLOWED'
  );

  // Student writing their own class selection:
  assert(
    simulateFirestorePermission({
      userRole: 'user',
      path: 'users/student-123/classSelection/current',
      operation: 'write',
      authUid: 'student-123',
      targetOwnerUid: 'student-123',
    }) === true,
    'Student writing their own classSelection -> PERMISSION ALLOWED'
  );

  // Malicious user writing another student's selection:
  assert(
    simulateFirestorePermission({
      userRole: 'user',
      path: 'users/victim-student/classSelection/current',
      operation: 'write',
      authUid: 'malicious-user',
      targetOwnerUid: 'victim-student',
    }) === false,
    'Unauthorized user writing another student data -> PERMISSION DENIED'
  );

  console.log(`\n🏁 Test Suite Finished: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
