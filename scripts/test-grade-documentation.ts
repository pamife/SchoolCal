import { formatRecordedResult, getGradingSystem, getRecordedGradingSystem } from '../src/utils/gradingSystem';
import type { Grade } from '../src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

console.log('Running grade documentation tests');

assert(getGradingSystem('10a') === 'grade', 'Class 10 uses grades');
assert(getGradingSystem('Klasse 11') === 'points', 'Class 11 uses points');
assert(getGradingSystem('12') === 'points', 'Class 12 uses points');
assert(getGradingSystem('Q1') === 'points', 'Qualification phase uses points');
assert(getGradingSystem('EF') === 'points', 'Introductory upper-secondary phase uses points');

const legacyGrade: Grade = {
  id: 'legacy',
  subjectId: 'math',
  title: 'Klassenarbeit',
  value: 2.3,
  weight: 2,
  type: 'exam',
  date: '2026-09-01',
};

const pointResult: Grade = {
  id: 'points',
  subjectId: 'math',
  title: 'Klausur',
  value: 11,
  weight: 1,
  gradingSystem: 'points',
  type: 'exam',
  date: '2026-09-02',
};

assert(getRecordedGradingSystem(legacyGrade) === 'grade', 'Legacy records remain regular grades');
assert(formatRecordedResult(legacyGrade) === 'Note 2,3', 'Legacy grade is displayed without recalculation');
assert(formatRecordedResult(pointResult) === '11 Punkte', 'Upper-secondary points are displayed as recorded');
assert(!('average' in pointResult), 'Grade records contain no calculated average');

console.log('All grade documentation tests passed');
