import { format, differenceInDays, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import type {
  ScheduleEntry,
  Subject,
  Teacher,
  Room,
  Homework,
  Exam,
  Grade,
  UserSettings,
} from '../../types';
import type { AISchoolContext } from './AIServiceInterface';

export interface BuildContextParams {
  currentDate?: Date;
  userName?: string;
  settings: UserSettings;
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  scheduleEntries: ScheduleEntry[];
  homework: Homework[];
  exams: Exam[];
  grades: Grade[];
}

export function buildSafeAISchoolContext({
  currentDate = new Date(),
  userName = 'Schüler',
  settings,
  subjects = [],
  teachers = [],
  rooms = [],
  scheduleEntries = [],
  homework = [],
  exams = [],
  grades = [],
}: BuildContextParams): AISchoolContext {
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  const jsDay = currentDate.getDay();
  const todayDayOfWeek = jsDay === 0 ? 7 : jsDay;
  const todayIso = format(currentDate, 'yyyy-MM-dd');

  // Today's schedule
  const todayEntries = scheduleEntries
    .filter((e) => e.dayOfWeek === todayDayOfWeek)
    .sort((a, b) => a.period - b.period);

  const todaySchedule = todayEntries.map((e) => ({
    period: e.period,
    startTime: e.startTime,
    endTime: e.endTime,
    subjectName: subjectMap.get(e.subjectId)?.name || 'Fach',
    roomName: e.roomId ? roomMap.get(e.roomId)?.name : undefined,
    teacherName: e.teacherId ? teacherMap.get(e.teacherId)?.name : undefined,
  }));

  // Weekly schedule summary
  const dayNames = ['', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const weeklyScheduleSummary: string[] = [];
  for (let d = 1; d <= 6; d++) {
    const dayEntries = scheduleEntries
      .filter((e) => e.dayOfWeek === d)
      .sort((a, b) => a.period - b.period);

    if (dayEntries.length > 0) {
      const subjectsStr = dayEntries
        .map((e) => `${e.period}. ${subjectMap.get(e.subjectId)?.name || 'Fach'}`)
        .join(', ');
      weeklyScheduleSummary.push(`${dayNames[d]}: ${subjectsStr}`);
    }
  }

  // Open homework (only open, sorted by due date)
  const openHomework = homework
    .filter((h) => h.status !== 'done')
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    .slice(0, 15) // Limit to top 15 most urgent
    .map((h) => ({
      id: h.id,
      title: h.title,
      subjectName: subjectMap.get(h.subjectId)?.name || 'Fach',
      dueDate: h.dueDate,
      dueTime: h.dueTime,
      priority: h.priority,
      dueDateMode: h.dueDateMode || 'AUTO',
    }));

  // Upcoming exams
  const upcomingExams = exams
    .filter((ex) => ex.date >= todayIso)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8)
    .map((ex) => {
      const exDate = parseISO(ex.date);
      const daysLeft = Math.max(0, differenceInDays(exDate, currentDate));
      return {
        id: ex.id,
        title: ex.title,
        subjectName: subjectMap.get(ex.subjectId)?.name || 'Fach',
        date: ex.date,
        daysLeft,
        topics: ex.topics?.map((t) => t.title),
      };
    });

  // Grades summary
  let gradesSummary: AISchoolContext['gradesSummary'];
  if (grades.length > 0) {
    const totalWeightedSum = grades.reduce((sum, g) => sum + g.value * g.weight, 0);
    const totalWeights = grades.reduce((sum, g) => sum + g.weight, 0);
    const overallAverage = totalWeights > 0 ? (totalWeightedSum / totalWeights).toFixed(2) : undefined;

    const subjectAverages = subjects.map((sub) => {
      const subGrades = grades.filter((g) => g.subjectId === sub.id);
      const sum = subGrades.reduce((acc, g) => acc + g.value * g.weight, 0);
      const w = subGrades.reduce((acc, g) => acc + g.weight, 0);
      return {
        subjectName: sub.name,
        average: w > 0 ? (sum / w).toFixed(2) : '–',
      };
    }).filter((s) => s.average !== '–');

    gradesSummary = {
      overallAverage,
      subjectAverages,
    };
  }

  return {
    currentDate: format(currentDate, 'dd. MMMM yyyy', { locale: de }),
    weekday: format(currentDate, 'EEEE', { locale: de }),
    userName,
    schoolName: settings.schoolName,
    gradeLevel: settings.gradeLevel,
    todaySchedule,
    weeklyScheduleSummary,
    openHomework,
    upcomingExams,
    gradesSummary,
  };
}
