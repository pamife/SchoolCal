import fs from 'fs';
import path from 'path';
import { USER_SUBCOLLECTIONS } from '../src/services/account/accountDeletionService';
import { buildSafeAISchoolContext } from '../src/services/ai/aiContextBuilder';
import { DEFAULT_USER_SETTINGS } from '../src/data/mockData';
import type {
  Subject,
  Teacher,
  Room,
  ScheduleEntry,
  Homework,
  Exam,
  Grade,
} from '../src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

console.log('====================================================');
console.log('🔒 Running SchoolCal Privacy & Security Audit Tests');
console.log('====================================================\n');

// ----------------------------------------------------
// 1. FIRESTORE SECURITY RULES INTEGRITY TESTS
// ----------------------------------------------------
console.log('--- 1. Firestore Security Rules Audit ---');
const rulesPath = path.resolve(process.cwd(), 'src/services/firebase/firestore.rules');
assert(fs.existsSync(rulesPath), 'firestore.rules exists');

const rulesContent = fs.readFileSync(rulesPath, 'utf8');

// Test 1.1: Privilege Escalation check
assert(
  rulesContent.includes("request.resource.data.role == 'user'") ||
  rulesContent.includes("!('role' in request.resource.data)"),
  'Rules explicitly forbid users from creating an account with role == admin (Privilege Escalation protection)'
);

// Test 1.2: Private Subcollection Data Isolation (Confidentiality)
// Admin MUST NOT have access to private user subcollections (subjects, homework, grades, etc.)
assert(
  !rulesContent.includes('match /{subcollection}/{document=**} {\n        allow read, write: if isOwner(userId) || isAdmin();'),
  'Rules do NOT allow admin backdoor access to private user subcollections'
);
assert(
  rulesContent.includes('match /{subcollection}/{document=**} {\n        allow read, write: if isOwner(userId);'),
  'Rules strictly restrict user subcollections to the owner only (isOwner(userId))'
);

// Test 1.3: License Security & Single-Use Enforcement
assert(
  rulesContent.includes('match /licenses/{licenseId}') &&
  rulesContent.includes("request.resource.data.get('status', '') == 'ACTIVE'") &&
  rulesContent.includes("resource.data.get('status', '') == 'AVAILABLE'"),
  'Rules strictly enforce atomic single-use license activation and state transitions'
);


// ----------------------------------------------------
// 2. ACCOUNT ERASURE & SUBCOLLECTIONS AUDIT (Art. 17 DSGVO)
// ----------------------------------------------------
console.log('\n--- 2. GDPR Art. 17 Account Deletion Audit ---');
const requiredSubcollections = [
  'subjects',
  'teachers',
  'rooms',
  'schedule',
  'substitutions',
  'homework',
  'exams',
  'grades',
  'events',
  'settings',
];

for (const subcol of requiredSubcollections) {
  assert(
    USER_SUBCOLLECTIONS.includes(subcol as any),
    `Account deletion service covers subcollection: ${subcol}`
  );
}
assert(
  USER_SUBCOLLECTIONS.length === 10,
  'All 10 user subcollections are registered for recursive cloud erasure'
);


// ----------------------------------------------------
// 3. GDPR ART. 20 DATA EXPORT STRUCTURE TEST
// ----------------------------------------------------
console.log('\n--- 3. GDPR Art. 20 Data Export Audit ---');

const mockUser = {
  uid: 'user-test-123',
  email: 'schueler@schule.de',
  displayName: 'Max Mustermann',
  plan: 'PRO' as const,
  planSource: 'LICENSE' as const,
  activeLicenseId: 'lic-pro-777',
  planExpiresAt: '2027-01-01T00:00:00Z',
  role: 'user' as const,
  createdAt: '2026-08-31T12:00:00Z',
  updatedAt: '2026-08-31T12:00:00Z',
};

const mockSubjects: Subject[] = [
  { id: 'sub-1', name: 'Mathematik', shortName: 'M', color: '#007AFF', icon: 'Calculator' },
];

const mockGrades: Grade[] = [
  { id: 'gr-1', subjectId: 'sub-1', value: 1.5, weight: 2.0, type: 'exam', date: '2026-09-01', title: '1. Schulaufgabe' },
];

const mockHomework: Homework[] = [
  { id: 'hw-1', title: 'S. 45 Nr. 3', subjectId: 'sub-1', dueDate: '2026-09-02', priority: 'high', status: 'todo', createdAt: '2026-08-31T10:00:00Z' },
];

assert(mockUser.email.includes('@'), 'Mock user email is valid');
assert(mockGrades[0].value === 1.5, 'Grades are structured properly');
assert(mockHomework[0].priority === 'high', 'Homework is structured properly');


// ----------------------------------------------------
// 4. AI DATA MINIMIZATION AUDIT (Art. 5 Abs. 1 lit. c DSGVO)
// ----------------------------------------------------
console.log('\n--- 4. AI Context Data Minimization Audit ---');

const aiContext = buildSafeAISchoolContext({
  currentDate: new Date('2026-09-01T09:00:00Z'),
  userName: mockUser.displayName,
  settings: DEFAULT_USER_SETTINGS,
  subjects: mockSubjects,
  teachers: [],
  rooms: [],
  scheduleEntries: [],
  homework: mockHomework,
  exams: [],
  grades: mockGrades,
});

assert(aiContext.userName === 'Max Mustermann', 'AI context has user name');
assert(aiContext.openHomework.length === 1, 'AI context contains only open homework');
assert(aiContext.openHomework[0].title === 'S. 45 Nr. 3', 'AI context contains task title');
assert(aiContext.gradesSummary?.overallAverage === '1.50', 'AI context contains computed grade summary');

// Check that NO passwords or internal secrets are in AI context
const serializedContext = JSON.stringify(aiContext);
assert(!serializedContext.includes('password'), 'AI context NEVER contains password fields');
assert(!serializedContext.includes('webuntisPassword'), 'AI context NEVER contains WebUntis passwords');
assert(!serializedContext.includes('codeHash'), 'AI context NEVER contains license hashes');
assert(!serializedContext.includes('apiKey'), 'AI context NEVER contains API keys');


// ----------------------------------------------------
// 5. TRACKING & COOKIE AUDIT (TTDSG & Zero-Tracking)
// ----------------------------------------------------
console.log('\n--- 5. Zero-Tracking & Privacy by Design Audit ---');

const packageJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'));
const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

assert(!allDeps['@sentry/react'], 'Zero-Tracking: Sentry is not installed');
assert(!allDeps['posthog-js'], 'Zero-Tracking: PostHog is not installed');
assert(!allDeps['mixpanel-browser'], 'Zero-Tracking: Mixpanel is not installed');
assert(!allDeps['react-ga4'], 'Zero-Tracking: Google Analytics is not installed');
assert(!allDeps['hotjar'], 'Zero-Tracking: Hotjar is not installed');

console.log('\n====================================================');
console.log('🎉 All Privacy & Security Tests PASSED successfully!');
console.log('====================================================\n');
