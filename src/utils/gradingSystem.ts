import type { Grade, GradingSystem } from '../types';

export function getGradingSystem(gradeLevel: string | undefined): GradingSystem {
  const normalized = (gradeLevel || '').trim().toLowerCase();
  const numericGrade = normalized.match(/\d+/)?.[0];

  if (numericGrade && Number(numericGrade) >= 11) {
    return 'points';
  }

  if (/^(q\d|ef\b)|oberstufe|qualifikationsphase|einführungsphase/.test(normalized)) {
    return 'points';
  }

  return 'grade';
}

export function getRecordedGradingSystem(grade: Grade): GradingSystem {
  // Entries created before the point system existed were always entered as grades.
  return grade.gradingSystem || 'grade';
}

export function formatRecordedResult(grade: Grade): string {
  if (getRecordedGradingSystem(grade) === 'points') {
    return `${grade.value} ${grade.value === 1 ? 'Punkt' : 'Punkte'}`;
  }

  return `Note ${grade.value.toLocaleString('de-DE', { maximumFractionDigits: 2 })}`;
}
