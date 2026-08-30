import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  differenceInDays,
  parseISO,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from 'date-fns';
import { de } from 'date-fns/locale';
import type { ScheduleEntry, SchedulePeriodTime } from '../types';

export function formatGermanDate(date: Date | string, formatPattern: string = 'dd. MMMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatPattern, { locale: de });
}

export function formatGermanWeekday(date: Date | string, length: 'long' | 'short' = 'long'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, length === 'long' ? 'EEEE' : 'EEE', { locale: de });
}

export function getRelativeDateLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  if (isToday(target)) return 'Heute';
  if (isTomorrow(target)) return 'Morgen';
  if (isYesterday(target)) return 'Gestern';

  const diff = differenceInDays(target, today);
  if (diff > 0) {
    if (diff <= 7) return `In ${diff} Tagen`;
    return formatGermanDate(date, 'dd. MMM');
  } else {
    return `${Math.abs(diff)} Tage überfällig`;
  }
}

export function getExamCountdownText(dateStr: string): { label: string; urgency: 'today' | 'tomorrow' | 'urgent' | 'normal' } {
  const date = parseISO(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  if (isToday(target)) return { label: 'Heute', urgency: 'today' };
  if (isTomorrow(target)) return { label: 'Morgen', urgency: 'tomorrow' };

  const diff = differenceInDays(target, today);
  if (diff < 0) {
    return { label: 'Vorbei', urgency: 'normal' };
  }
  if (diff === 2) return { label: 'Übermorgen', urgency: 'urgent' };
  if (diff <= 5) return { label: `Noch ${diff} Tage`, urgency: 'urgent' };
  return { label: `Noch ${diff} Tage`, urgency: 'normal' };
}

export function getWeekDays(referenceDate: Date, startOnMonday: boolean = true): Date[] {
  const start = startOfWeek(referenceDate, { weekStartsOn: startOnMonday ? 1 : 0 });
  const end = endOfWeek(referenceDate, { weekStartsOn: startOnMonday ? 1 : 0 });
  return eachDayOfInterval({ start, end });
}

/**
 * Returns current period status (e.g. active period, next period, break, or school ended)
 */
export function getCurrentSchoolPeriod(
  scheduleEntries: ScheduleEntry[],
  _periodTimes: SchedulePeriodTime[],
  currentDate: Date = new Date()
): {
  currentEntry: ScheduleEntry | null;
  nextEntry: ScheduleEntry | null;
  isSchoolHours: boolean;
  minutesRemainingInCurrent?: number;
  minutesUntilNext?: number;
  statusText: string;
} {
  const jsDay = currentDate.getDay();
  const dayOfWeek = jsDay === 0 ? 7 : jsDay;

  const todayEntries = scheduleEntries
    .filter(e => e.dayOfWeek === dayOfWeek)
    .sort((a, b) => a.period - b.period);

  if (todayEntries.length === 0) {
    return {
      currentEntry: null,
      nextEntry: null,
      isSchoolHours: false,
      statusText: 'Kein Unterricht heute',
    };
  }

  const currentHours = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  function timeToMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  let currentEntry: ScheduleEntry | null = null;
  let nextEntry: ScheduleEntry | null = null;
  let minutesRemainingInCurrent: number | undefined;
  let minutesUntilNext: number | undefined;

  for (let i = 0; i < todayEntries.length; i++) {
    const entry = todayEntries[i];
    const startMin = timeToMinutes(entry.startTime);
    const endMin = timeToMinutes(entry.endTime);

    if (currentTotalMinutes >= startMin && currentTotalMinutes < endMin) {
      currentEntry = entry;
      minutesRemainingInCurrent = endMin - currentTotalMinutes;
      nextEntry = todayEntries[i + 1] || null;
      if (nextEntry) {
        minutesUntilNext = timeToMinutes(nextEntry.startTime) - endMin;
      }
      break;
    }

    if (currentTotalMinutes < startMin) {
      nextEntry = entry;
      minutesUntilNext = startMin - currentTotalMinutes;
      break;
    }
  }

  let statusText = 'Unterrichtsfrei';
  if (currentEntry) {
    statusText = `Läuft gerade (noch ${minutesRemainingInCurrent} Min)`;
  } else if (nextEntry) {
    if (minutesUntilNext && minutesUntilNext <= 30) {
      statusText = `Nächste Stunde in ${minutesUntilNext} Min`;
    } else {
      statusText = `Nächste Stunde um ${nextEntry.startTime}`;
    }
  } else {
    statusText = 'Schultag beendet';
  }

  return {
    currentEntry,
    nextEntry,
    isSchoolHours: Boolean(currentEntry || (nextEntry && minutesUntilNext && minutesUntilNext <= 60)),
    minutesRemainingInCurrent,
    minutesUntilNext,
    statusText,
  };
}
