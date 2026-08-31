import {
  format,
  addDays,
  parseISO,
  isBefore,
} from 'date-fns';
import { de } from 'date-fns/locale';
import type {
  ScheduleEntry,
  Substitution,
  Holiday,
  UserSettings,
  Homework,
  DueDateMode,
  DueDateSource,
  AutoDueDateRule,
} from '../types';
import { getHolidaysForState } from '../data/holidays';

export interface CalculateAutoDueDateParams {
  subjectId: string;
  referenceDate?: Date;
  scheduleEntries: ScheduleEntry[];
  substitutions?: Substitution[];
  holidays?: Holiday[];
  holidayState?: string;
  activeTimetableVersion?: string;
  settings?: Partial<UserSettings>;
  options?: {
    targetOccurrence?: number;
    rule?: AutoDueDateRule;
    allowSameDayIfBeforeLesson?: boolean;
  };
}

export interface AutoDueDateResult {
  found: boolean;
  dueDate: string;
  dueTime: string;
  dayOfWeek: number;
  dayName: string;
  formattedDate: string;
  shortFormattedDate: string;
  scheduleEntryId?: string;
  lessonPeriod?: number;
  isPostponedDueToCancellation?: boolean;
  postponedFromDate?: string;
  reason?: string;
}

export interface HomeworkShiftNotice {
  homeworkId: string;
  homeworkTitle: string;
  subjectId: string;
  subjectName?: string;
  previousDueDate: string;
  newDueDate: string;
  previousFormatted: string;
  newFormatted: string;
  reason: string;
}

export interface RecalculateResult {
  updatedHomework: Homework[];
  hasChanges: boolean;
  notices: HomeworkShiftNotice[];
}

export function isDateInHoliday(
  dateIso: string,
  holidays: Holiday[] = []
): { isHoliday: boolean; holiday?: Holiday } {
  const matching = holidays.find(
    (h) => dateIso >= h.startDate && dateIso <= h.endDate
  );
  return {
    isHoliday: Boolean(matching),
    holiday: matching,
  };
}

export function calculateAutoDueDate({
  subjectId,
  referenceDate = new Date(),
  scheduleEntries = [],
  substitutions = [],
  holidays,
  holidayState = 'BY',
  activeTimetableVersion = 'default',
  settings,
  options,
}: CalculateAutoDueDateParams): AutoDueDateResult {
  if (!subjectId) {
    return {
      found: false,
      dueDate: '',
      dueTime: '08:00',
      dayOfWeek: 0,
      dayName: '',
      formattedDate: 'Kein Fach ausgewählt',
      shortFormattedDate: '–',
      reason: 'no_subject_selected',
    };
  }

  const activeHolidays = holidays || getHolidaysForState(settings?.state || holidayState);

  const relevantSchedule = scheduleEntries.filter((e) => {
    if (activeTimetableVersion && e.versionId && e.versionId !== activeTimetableVersion && e.versionId !== 'default') {
      return false;
    }
    return true;
  });

  const hasSubjectInSchedule = relevantSchedule.some((e) => e.subjectId === subjectId);
  const hasSubjectInSubstitutions = substitutions.some((s) => s.newSubjectId === subjectId);

  if (!hasSubjectInSchedule && !hasSubjectInSubstitutions) {
    return {
      found: false,
      dueDate: '',
      dueTime: '08:00',
      dayOfWeek: 0,
      dayName: '',
      formattedDate: 'Keine Termine im Stundenplan gefunden',
      shortFormattedDate: '–',
      reason: 'no_schedule_entry',
    };
  }

  const rule =
    options?.rule ||
    settings?.subjectDueDateRules?.[subjectId] ||
    settings?.autoDueDateRule ||
    'next_lesson';

  let targetOccurrence = options?.targetOccurrence || (rule === 'second_next_lesson' ? 2 : 1);
  if (targetOccurrence < 1) targetOccurrence = 1;

  const refTime = format(referenceDate, 'HH:mm');

  let matchedOccurrences = 0;
  let encounteredCancellation = false;
  let firstCancelledDate: string | undefined;

  const MAX_DAYS_SEARCH = 120;

  for (let offset = 0; offset <= MAX_DAYS_SEARCH; offset++) {
    const currentTargetDate = addDays(referenceDate, offset);
    const targetIso = format(currentTargetDate, 'yyyy-MM-dd');
    const jsDay = currentTargetDate.getDay();
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;

    if (dayOfWeek === 6 || dayOfWeek === 7) {
      continue;
    }

    const { isHoliday } = isDateInHoliday(targetIso, activeHolidays);
    if (isHoliday) {
      continue;
    }

    const dayEntries = relevantSchedule
      .filter((e) => e.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.period - b.period);

    const daySubs = substitutions.filter((s) => s.date === targetIso);
    const substMap = new Map(daySubs.map((s) => [s.scheduleEntryId, s]));

    interface EffectiveLesson {
      entry: ScheduleEntry;
      startTime: string;
      endTime: string;
      period: number;
      isSubstitutedIn: boolean;
    }

    const effectiveLessons: EffectiveLesson[] = [];
    let hadCancellationToday = false;

    for (const entry of dayEntries) {
      const sub = substMap.get(entry.id);

      if (entry.subjectId === subjectId) {
        if (sub?.type === 'cancelled') {
          hadCancellationToday = true;
          if (!firstCancelledDate) firstCancelledDate = targetIso;
          continue;
        }
        if (sub?.type === 'subject_change' && sub.newSubjectId && sub.newSubjectId !== subjectId) {
          hadCancellationToday = true;
          if (!firstCancelledDate) firstCancelledDate = targetIso;
          continue;
        }
        effectiveLessons.push({
          entry,
          startTime: entry.startTime,
          endTime: entry.endTime,
          period: entry.period,
          isSubstitutedIn: false,
        });
      } else {
        if (sub?.type === 'subject_change' && sub.newSubjectId === subjectId) {
          effectiveLessons.push({
            entry,
            startTime: entry.startTime,
            endTime: entry.endTime,
            period: entry.period,
            isSubstitutedIn: true,
          });
        }
      }
    }

    if (hadCancellationToday) {
      encounteredCancellation = true;
    }

    if (effectiveLessons.length === 0) {
      continue;
    }

    if (offset === 0) {
      if (!options?.allowSameDayIfBeforeLesson) {
        continue;
      } else {
        const futureLessonsToday = effectiveLessons.filter((l) => l.startTime > refTime);
        if (futureLessonsToday.length === 0) {
          continue;
        }
      }
    }

    matchedOccurrences++;

    if (matchedOccurrences >= targetOccurrence) {
      const primaryLesson = effectiveLessons[0];
      const parsedDate = parseISO(targetIso);

      return {
        found: true,
        dueDate: targetIso,
        dueTime: primaryLesson.startTime || '08:00',
        dayOfWeek,
        dayName: format(parsedDate, 'EEEE', { locale: de }),
        formattedDate: format(parsedDate, 'EEEE, d. MMMM', { locale: de }),
        shortFormattedDate: format(parsedDate, 'EEE, dd.MM.', { locale: de }),
        scheduleEntryId: primaryLesson.entry.id,
        lessonPeriod: primaryLesson.period,
        isPostponedDueToCancellation: encounteredCancellation,
        postponedFromDate: firstCancelledDate,
        reason: encounteredCancellation
          ? 'postponed_due_to_cancellation'
          : rule === 'second_next_lesson'
          ? 'second_next_lesson'
          : 'next_lesson',
      };
    }
  }

  return {
    found: false,
    dueDate: '',
    dueTime: '08:00',
    dayOfWeek: 0,
    dayName: '',
    formattedDate: 'Keine zukünftige Unterrichtsstunde gefunden',
    shortFormattedDate: '–',
    reason: 'no_upcoming_lesson',
  };
}

export function recalculateAutoDueDates({
  homeworkList = [],
  scheduleEntries = [],
  substitutions = [],
  holidays,
  holidayState = 'BY',
  activeTimetableVersion = 'default',
  settings,
  referenceDate = new Date(),
  subjectNames = new Map<string, string>(),
}: {
  homeworkList: Homework[];
  scheduleEntries: ScheduleEntry[];
  substitutions: Substitution[];
  holidays?: Holiday[];
  holidayState?: string;
  activeTimetableVersion?: string;
  settings?: Partial<UserSettings>;
  referenceDate?: Date;
  subjectNames?: Map<string, string>;
}): RecalculateResult {
  const updatedHomework: Homework[] = [];
  const notices: HomeworkShiftNotice[] = [];
  let hasChanges = false;

  for (const hw of homeworkList) {
    if (hw.status === 'done') {
      updatedHomework.push(hw);
      continue;
    }

    if (hw.dueDateMode === 'MANUAL') {
      updatedHomework.push(hw);
      continue;
    }

    let hwRefDate = referenceDate;
    if (hw.createdAt) {
      try {
        const createdDate = parseISO(hw.createdAt);
        if (isBefore(createdDate, referenceDate)) {
          hwRefDate = createdDate;
        }
      } catch {
        // fallback
      }
    }

    const calcResult = calculateAutoDueDate({
      subjectId: hw.subjectId,
      referenceDate: hwRefDate,
      scheduleEntries,
      substitutions,
      holidays,
      holidayState,
      activeTimetableVersion,
      settings,
    });

    if (!calcResult.found) {
      updatedHomework.push(hw);
      continue;
    }

    const dateChanged = hw.dueDate !== calcResult.dueDate;
    const timeChanged = hw.dueTime !== calcResult.dueTime;

    if (dateChanged || timeChanged) {
      hasChanges = true;

      const previousFormatted = hw.dueDate
        ? format(parseISO(hw.dueDate), 'EEEE, d. MMMM', { locale: de })
        : '–';
      const newFormatted = calcResult.formattedDate;
      const subName = subjectNames.get(hw.subjectId) || 'Fach';

      let reason = 'Der Stundenplan wurde aktualisiert.';
      if (calcResult.isPostponedDueToCancellation) {
        reason = `Der nächste ${subName}-Unterricht fällt aus. Die Hausaufgabenfrist wurde automatisch auf ${calcResult.dayName} verschoben.`;
      }

      const updatedSource: DueDateSource = {
        scheduleEntryId: calcResult.scheduleEntryId || hw.dueDateSource?.scheduleEntryId,
        lessonDate: calcResult.dueDate,
        lessonStartTime: calcResult.dueTime,
        lessonPeriod: calcResult.lessonPeriod,
        calculatedAt: new Date().toISOString(),
        reason: calcResult.reason,
        isShifted: calcResult.isPostponedDueToCancellation,
        previousDueDate: hw.dueDate,
      };

      const updatedItem: Homework = {
        ...hw,
        dueDate: calcResult.dueDate,
        dueTime: calcResult.dueTime,
        dueDateMode: 'AUTO',
        dueDateSource: updatedSource,
      };

      updatedHomework.push(updatedItem);

      notices.push({
        homeworkId: hw.id,
        homeworkTitle: hw.title,
        subjectId: hw.subjectId,
        subjectName: subName,
        previousDueDate: hw.dueDate,
        newDueDate: calcResult.dueDate,
        previousFormatted,
        newFormatted,
        reason,
      });
    } else {
      updatedHomework.push(hw);
    }
  }

  return {
    updatedHomework,
    hasChanges,
    notices,
  };
}

export function formatDueDateBadgeInfo(
  dueDate: string,
  dueTime?: string,
  mode: DueDateMode = 'AUTO',
  source?: DueDateSource
): {
  badgeLabel: string;
  badgeVariant: 'blue' | 'gray' | 'purple' | 'amber';
  iconType: 'auto' | 'manual' | 'shifted';
  formattedText: string;
  tooltip: string;
} {
  const isShifted = Boolean(source?.isShifted);

  if (mode === 'MANUAL') {
    return {
      badgeLabel: 'Manuell',
      badgeVariant: 'gray',
      iconType: 'manual',
      formattedText: '✏️ Manuell festgelegt',
      tooltip: 'Diese Frist wurde von dir manuell festgelegt und wird nicht automatisch verändert.',
    };
  }

  if (isShifted) {
    return {
      badgeLabel: 'Verschoben (Ausfall)',
      badgeVariant: 'amber',
      iconType: 'shifted',
      formattedText: '⚡ Automatisch verschoben (Ausfall)',
      tooltip: 'Frist wurde automatisch verschoben, da der ursprüngliche Unterrichtstermin entfällt.',
    };
  }

  return {
    badgeLabel: 'Automatisch',
    badgeVariant: 'blue',
    iconType: 'auto',
    formattedText: '⚡ Automatisch bestimmt',
    tooltip: 'Frist orientiert sich automatisch am nächsten regulären Unterricht dieses Fachs.',
  };
}
