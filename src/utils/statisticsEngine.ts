import {
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  getISOWeek,
  format,
} from 'date-fns';
import type {
  ScheduleEntry,
  SchedulePeriodTime,
  Subject,
  Homework,
  Exam,
  Grade,
  StatisticsPeriod,
  SchoolStatistics,
  SubjectStat,
  WeeklyTrendPoint,
} from '../types';

export interface StatisticsParams {
  period: StatisticsPeriod;
  scheduleEntries: ScheduleEntry[];
  periodTimes: SchedulePeriodTime[];
  subjects: Subject[];
  homework: Homework[];
  exams: Exam[];
  grades: Grade[];
  currentDate?: Date;
}

function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 45; // default 45 min lesson
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function getPeriodInterval(period: StatisticsPeriod, refDate: Date): { start: Date; end: Date; label: string } {
  const today = new Date(refDate);

  switch (period) {
    case 'today': {
      const start = new Date(today);
      start.setHours(0, 0, 0, 0);
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      return { start, end, label: 'Heute' };
    }
    case 'this_week': {
      const start = startOfWeek(today, { weekStartsOn: 1 });
      const end = endOfWeek(today, { weekStartsOn: 1 });
      return { start, end, label: 'Diese Woche' };
    }
    case 'last_week': {
      const prevWeek = subWeeks(today, 1);
      const start = startOfWeek(prevWeek, { weekStartsOn: 1 });
      const end = endOfWeek(prevWeek, { weekStartsOn: 1 });
      return { start, end, label: 'Letzte Woche' };
    }
    case 'this_month': {
      const start = startOfMonth(today);
      const end = endOfMonth(today);
      return { start, end, label: 'Dieser Monat' };
    }
    case 'last_month': {
      const prevMonth = subMonths(today, 1);
      const start = startOfMonth(prevMonth);
      const end = endOfMonth(prevMonth);
      return { start, end, label: 'Letzter Monat' };
    }
    case 'school_year': {
      // German school year starts ~August/September
      const curYear = today.getFullYear();
      const curMonth = today.getMonth(); // 0-indexed (7 = Aug, 8 = Sep)
      const startYear = curMonth >= 7 ? curYear : curYear - 1;
      const start = new Date(startYear, 7, 1); // Aug 1st
      const end = new Date(startYear + 1, 6, 31, 23, 59, 59); // July 31st
      return { start, end, label: `Schuljahr ${startYear}/${startYear + 1}` };
    }
  }
}

export function calculateSchoolStatistics({
  period = 'this_week',
  scheduleEntries = [],
  periodTimes = [],
  subjects = [],
  homework = [],
  exams = [],
  grades = [],
  currentDate = new Date(),
}: StatisticsParams): SchoolStatistics {
  const { start, end, label: periodLabel } = getPeriodInterval(period, currentDate);
  const startIso = format(start, 'yyyy-MM-dd');
  const endIso = format(end, 'yyyy-MM-dd');
  const todayIso = format(currentDate, 'yyyy-MM-dd');

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  // 1. Calculate Timetable Lesson Minutes per week & in period
  const subjectLessonMinutesMap = new Map<string, number>();
  let weeklyTotalLessonMinutes = 0;

  scheduleEntries.forEach((entry) => {
    const startM = timeToMinutes(entry.startTime);
    const endM = timeToMinutes(entry.endTime);
    const duration = Math.max(0, endM - startM) || 45;

    weeklyTotalLessonMinutes += duration;
    const prev = subjectLessonMinutesMap.get(entry.subjectId) || 0;
    subjectLessonMinutesMap.set(entry.subjectId, prev + duration);
  });

  // Scale total lesson minutes based on period
  let totalLessonMinutes = 0;
  if (period === 'today') {
    const jsDay = currentDate.getDay();
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;
    const todayEntries = scheduleEntries.filter((e) => e.dayOfWeek === dayOfWeek);
    totalLessonMinutes = todayEntries.reduce((sum, e) => {
      const dur = Math.max(0, timeToMinutes(e.endTime) - timeToMinutes(e.startTime)) || 45;
      return sum + dur;
    }, 0);
  } else if (period === 'this_week' || period === 'last_week') {
    totalLessonMinutes = weeklyTotalLessonMinutes;
  } else if (period === 'this_month' || period === 'last_month') {
    totalLessonMinutes = Math.round(weeklyTotalLessonMinutes * 4.2); // ~4.2 school weeks per month
  } else if (period === 'school_year') {
    totalLessonMinutes = Math.round(weeklyTotalLessonMinutes * 38); // ~38 school weeks per year
  }

  const hours = Math.floor(totalLessonMinutes / 60);
  const mins = totalLessonMinutes % 60;
  const totalLessonHoursFormatted = mins > 0 ? `${hours} h ${mins} min` : `${hours} h`;

  // 2. Calculate Homework Stats
  // Filter homework created or due within the interval
  const periodHomework = homework.filter((h) => {
    const targetDate = h.dueDate || h.createdAt?.slice(0, 10) || todayIso;
    return targetDate >= startIso && targetDate <= endIso;
  });

  const relevantHomework = period === 'school_year' || periodHomework.length > 0 ? periodHomework : homework;

  const completedHomeworkCount = relevantHomework.filter((h) => h.status === 'done').length;
  const openHomeworkCount = relevantHomework.filter((h) => h.status !== 'done').length;
  const overdueHomeworkCount = relevantHomework.filter(
    (h) => h.status !== 'done' && h.dueDate < todayIso
  ).length;
  const totalHomeworkCount = relevantHomework.length;
  const overallCompletionRate = totalHomeworkCount > 0
    ? Math.round((completedHomeworkCount / totalHomeworkCount) * 100)
    : 0;

  // 3. Exams Stats
  const upcomingExamsCount = exams.filter((ex) => ex.date >= todayIso).length;
  const completedExamsCount = exams.filter((ex) => ex.date < todayIso).length;

  // 4. Per Subject Stats
  const subjectHomeworkMap = new Map<string, Homework[]>();
  relevantHomework.forEach((h) => {
    const list = subjectHomeworkMap.get(h.subjectId) || [];
    list.push(h);
    subjectHomeworkMap.set(h.subjectId, list);
  });

  const subjectGradesMap = new Map<string, Grade[]>();
  grades.forEach((g) => {
    const list = subjectGradesMap.get(g.subjectId) || [];
    list.push(g);
    subjectGradesMap.set(g.subjectId, list);
  });

  const subjectStats: SubjectStat[] = subjects.map((sub) => {
    const subHw = subjectHomeworkMap.get(sub.id) || [];
    const totalTasks = subHw.length;
    const completedTasks = subHw.filter((h) => h.status === 'done').length;
    const openTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

    const subLessonMin = subjectLessonMinutesMap.get(sub.id) || 0;
    const subH = Math.floor(subLessonMin / 60);
    const subM = subLessonMin % 60;
    const lessonHoursFormatted = subM > 0 ? `${subH}h ${subM}m` : `${subH}h`;

    const subGrades = subjectGradesMap.get(sub.id) || [];
    const sumVal = subGrades.reduce((acc, g) => acc + g.value * g.weight, 0);
    const sumW = subGrades.reduce((acc, g) => acc + g.weight, 0);
    const averageGrade = sumW > 0 ? Number((sumVal / sumW).toFixed(2)) : undefined;

    return {
      subjectId: sub.id,
      subjectName: sub.name,
      shortName: sub.shortName,
      color: sub.color,
      lessonMinutes: subLessonMin,
      lessonHoursFormatted,
      totalTasks,
      completedTasks,
      openTasks,
      completionRate,
      averageGrade,
    };
  });

  // Sort subject stats by total lessons / total tasks
  subjectStats.sort((a, b) => b.lessonMinutes - a.lessonMinutes || b.totalTasks - a.totalTasks);

  // 5. Weekly Trends Calculation (real historical data grouping)
  const weekMap = new Map<string, { completed: number; total: number }>();

  homework.forEach((h) => {
    if (h.dueDate) {
      try {
        const d = parseISO(h.dueDate);
        const weekNum = getISOWeek(d);
        const key = `KW ${weekNum}`;
        const cur = weekMap.get(key) || { completed: 0, total: 0 };
        cur.total += 1;
        if (h.status === 'done') cur.completed += 1;
        weekMap.set(key, cur);
      } catch {
        // ignore invalid dates
      }
    }
  });

  const weeklyTrends: WeeklyTrendPoint[] = Array.from(weekMap.entries()).map(([weekLabel, val]) => ({
    weekLabel,
    completedTasks: val.completed,
    totalTasks: val.total,
    lessonHours: Math.round(weeklyTotalLessonMinutes / 60),
  }));

  // Has enough data for trends only if there are at least 2 weeks recorded
  const hasEnoughDataForTrends = weeklyTrends.length >= 2;

  return {
    period,
    periodLabel,
    totalLessonMinutes,
    totalLessonHoursFormatted,
    completedHomeworkCount,
    openHomeworkCount,
    overdueHomeworkCount,
    totalHomeworkCount,
    overallCompletionRate,
    upcomingExamsCount,
    completedExamsCount,
    subjectStats,
    weeklyTrends,
    hasEnoughDataForTrends,
  };
}
