import { handler } from '../netlify/functions/ai-assistant';
import { buildSafeAISchoolContext } from '../src/services/ai/aiContextBuilder';
import { executeConfirmedAIAction } from '../src/services/ai/aiActionHandler';
import { getRequiredPlanForFeature, isPlanEligible } from '../src/config/features';
import type { Subject, Teacher, Room, ScheduleEntry, Homework, Exam, Grade, UserSettings } from '../src/types';

async function runAIAssistantTests() {
  console.log('====================================================');
  console.log('🧠 Running SchoolCal AI Assistant & Backend Tests');
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

  // --- 1. Netlify Function Health Check Tests ---
  console.log('--- 1. Netlify Function Health Check Tests ---');

  // Test when no API key is present
  const originalKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.AI_API_KEY;

  const healthEventNoKey: any = {
    httpMethod: 'GET',
    headers: {},
    queryStringParameters: { action: 'health_check' },
  };

  const healthResNoKey: any = await handler(healthEventNoKey, {} as any);
  assert(healthResNoKey.statusCode === 200, 'Health check returns HTTP 200');
  const healthBodyNoKey = JSON.parse(healthResNoKey.body);
  assert(healthBodyNoKey.ok === false, 'Health check indicates not ok when key missing');
  assert(healthBodyNoKey.status === 'missing_key', 'Status is missing_key when key missing');
  assert(healthBodyNoKey.configured === false, 'Configured flag is false when key missing');
  assert(!JSON.stringify(healthBodyNoKey).includes('AIzaSy'), 'No API key leaked in health response');

  // Test Chat Request when no API key is present
  const chatEventNoKey: any = {
    httpMethod: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Wann habe ich Mathe?',
      context: { userName: 'Max' },
    }),
  };

  const chatResNoKey: any = await handler(chatEventNoKey, {} as any);
  assert(chatResNoKey.statusCode === 503, 'Chat returns 503 when API key is missing');
  const chatBodyNoKey = JSON.parse(chatResNoKey.body);
  assert(chatBodyNoKey.errorType === 'MISSING_API_KEY', 'ErrorType is MISSING_API_KEY');
  assert(!chatBodyNoKey.text, 'No canned successful text returned when key is missing');

  // --- 2. CORS and HTTP Method Tests ---
  console.log('\n--- 2. CORS and HTTP Method Tests ---');
  const optionsEvent: any = {
    httpMethod: 'OPTIONS',
    headers: {},
  };
  const optionsRes: any = await handler(optionsEvent, {} as any);
  assert(optionsRes.statusCode === 200, 'OPTIONS returns 200 for CORS preflight');
  assert(optionsRes.headers['Access-Control-Allow-Origin'] === '*', 'CORS allows all origins');

  const invalidMethodEvent: any = {
    httpMethod: 'PUT',
    headers: {},
  };
  const invalidMethodRes: any = await handler(invalidMethodEvent, {} as any);
  assert(invalidMethodRes.statusCode === 405, 'Non-POST/GET method returns 405 Method Not Allowed');

  // --- 3. Rate Limiting Tests ---
  console.log('\n--- 3. Rate Limiting Tests ---');
  const testIp = '192.168.1.99';
  let rateLimited = false;
  for (let i = 0; i < 35; i++) {
    const res: any = await handler({
      httpMethod: 'POST',
      headers: { 'client-ip': testIp, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Test rate limit' }),
    }, {} as any);

    if (res.statusCode === 429) {
      rateLimited = true;
      const body = JSON.parse(res.body);
      assert(body.errorType === 'RATE_LIMITED', 'Rate limit returns RATE_LIMITED errorType');
      break;
    }
  }
  assert(rateLimited, 'Rate limiter activates after excessive requests from same IP');

  // --- 4. Context Builder & Privacy Tests ---
  console.log('\n--- 4. Context Builder & Privacy Tests ---');
  const testSettings: UserSettings = {
    schoolName: 'Gymnasium Test',
    gradeLevel: '10b',
    theme: 'system',
    accentColor: 'blue',
    periodDuration: 45,
    breakDuration: 15,
  };

  const testSubjects: Subject[] = [
    { id: 'sub-1', name: 'Mathematik', shortName: 'M', color: '#ef4444' },
    { id: 'sub-2', name: 'Deutsch', shortName: 'D', color: '#3b82f6' },
  ];

  const testEntries: ScheduleEntry[] = [
    { id: 'e-1', subjectId: 'sub-1', dayOfWeek: 1, period: 1, startTime: '08:00', endTime: '08:45' },
    { id: 'e-2', subjectId: 'sub-2', dayOfWeek: 1, period: 2, startTime: '08:50', endTime: '09:35' },
  ];

  const testHomework: Homework[] = [
    {
      id: 'hw-1',
      title: 'Buch S. 42 Nr. 1-4',
      subjectId: 'sub-1',
      dueDate: '2026-09-02',
      dueTime: '08:00',
      dueDateMode: 'AUTO',
      priority: 'high',
      status: 'todo',
      createdAt: '2026-08-31T00:00:00.000Z',
    },
    {
      id: 'hw-2',
      title: 'Erledigte Aufgabe',
      subjectId: 'sub-2',
      dueDate: '2026-08-30',
      dueDateMode: 'MANUAL',
      priority: 'normal',
      status: 'done',
      createdAt: '2026-08-30T00:00:00.000Z',
    },
  ];

  const testExams: Exam[] = [
    {
      id: 'ex-1',
      title: '1. Schulaufgabe Analysis',
      subjectId: 'sub-1',
      date: '2026-09-15',
      weight: 2,
      topics: [{ id: 't-1', title: 'Ableitungsregeln' }],
    },
  ];

  const testGrades: Grade[] = [
    { id: 'g-1', subjectId: 'sub-1', value: 2.0, weight: 1, type: 'oral', date: '2026-08-20' },
    { id: 'g-2', subjectId: 'sub-1', value: 1.0, weight: 2, type: 'exam', date: '2026-08-25' },
  ];

  const context = buildSafeAISchoolContext({
    currentDate: new Date('2026-08-31T10:00:00Z'),
    userName: 'Anna',
    settings: testSettings,
    subjects: testSubjects,
    teachers: [],
    rooms: [],
    scheduleEntries: testEntries,
    homework: testHomework,
    exams: testExams,
    grades: testGrades,
  });

  assert(context.userName === 'Anna', 'Context has correct student name');
  assert(context.schoolName === 'Gymnasium Test', 'Context has school name');
  assert(context.openHomework.length === 1, 'Only open homework is included');
  assert(context.openHomework[0].title === 'Buch S. 42 Nr. 1-4', 'Homework title matches');
  assert(context.upcomingExams.length === 1, 'Upcoming exams included');
  assert(context.upcomingExams[0].topics?.[0] === 'Ableitungsregeln', 'Exam topics included');
  assert(context.gradesSummary?.overallAverage !== undefined, 'Grade average calculated');

  // --- 5. AI Action Execution Tests ---
  console.log('\n--- 5. AI Action Execution Tests ---');
  const mockStore: any[] = [];
  const addHomeworkMock = async (_uid: string, hw: any) => {
    mockStore.push(hw);
    return hw;
  };

  const studyPlanAction = {
    type: 'CREATE_STUDY_PLAN',
    title: 'Lernplan für Klausur',
    requiresConfirmation: true,
    data: {
      units: [
        {
          title: 'Mathe Analysis Vorbereitung',
          description: 'Ableitungsregeln üben',
          subjectName: 'Mathematik',
          date: '2026-09-05',
          time: '16:00',
        },
        {
          title: 'Mathe Kurvendiskussion',
          description: 'Nullstellen & Extrempunkte',
          subjectName: 'Mathematik',
          date: '2026-09-06',
          time: '16:00',
        },
      ],
    },
  };

  const actionResult = await executeConfirmedAIAction(studyPlanAction, 'user-123', {
    addHomework: addHomeworkMock,
  });

  assert(actionResult.success, 'AI Study Plan action executed successfully');
  assert(mockStore.length === 2, 'Created 2 homework units from AI study plan');
  assert(mockStore[0].title === 'Mathe Analysis Vorbereitung', 'First study plan unit title matches');
  assert(mockStore[1].dueDateMode === 'MANUAL', 'Study plan homework is created with MANUAL dueDateMode');

  // --- 6. Feature Gate Tests ---
  console.log('\n--- 6. Feature Gate Tests ---');
  assert(getRequiredPlanForFeature('aiSchoolAssistant') === 'PRO', 'aiSchoolAssistant requires PRO tier');
  assert(!isPlanEligible('STANDARD', 'PRO'), 'Standard user is blocked by AI Feature Gate');
  assert(!isPlanEligible('PLUS', 'PRO'), 'Plus user is blocked by AI Feature Gate');
  assert(isPlanEligible('PRO', 'PRO'), 'Pro user has access to AI Assistant');

  // Cleanup
  if (originalKey) {
    process.env.GEMINI_API_KEY = originalKey;
  }

  console.log('\n====================================================');
  console.log(`Test Results: ${passed} passed, ${failed} failed.`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAIAssistantTests().catch((err) => {
  console.error('Fatal error during AI tests:', err);
  process.exit(1);
});
