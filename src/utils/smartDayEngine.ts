import {
  differenceInDays,
  parseISO,
  isToday,
  isTomorrow,
  format,
} from 'date-fns';
import { de } from 'date-fns/locale';
import type {
  ScheduleEntry,
  SchedulePeriodTime,
  Subject,
  Teacher,
  Room,
  Substitution,
  Homework,
  Exam,
  CalendarEvent,
  SmartDayData,
  SmartDayTimeContext,
  SmartDayChangeInfo,
  Holiday,
} from '../types';
import { getHolidaysForState } from '../data/holidays';
import type { ScheduleBreak } from '../types';
import { formatGermanDate, formatGermanWeekday } from './dateUtils';

export interface SmartDayParams {
  currentDate?: Date;
  scheduleEntries: ScheduleEntry[];
  periodTimes: SchedulePeriodTime[];
  breaks?: ScheduleBreak[];
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  substitutions: Substitution[];
  homework: Homework[];
  exams: Exam[];
  calendarEvents: CalendarEvent[];
  holidayState?: string;
  userName?: string;
}

function timeStringToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function calculateSmartDayData({
  currentDate = new Date(),
  scheduleEntries = [],
  periodTimes = [],
  breaks = [],
  subjects = [],
  teachers = [],
  rooms = [],
  substitutions = [],
  homework = [],
  exams = [],
  calendarEvents = [],
  holidayState = 'BB',
  userName = 'Schüler',
}: SmartDayParams): SmartDayData {
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  const todayIso = format(currentDate, 'yyyy-MM-dd');
  const jsDay = currentDate.getDay();
  const todayDayOfWeek = jsDay === 0 ? 7 : jsDay;
  const isWeekend = jsDay === 0 || jsDay === 6;

  // 1. Holiday check
  const stateHolidays = getHolidaysForState(holidayState);
  const activeHoliday: Holiday | undefined = stateHolidays.find(
    (h) => todayIso >= h.startDate && todayIso <= h.endDate
  );

  // 2. Filter schedule entries for today
  const todayEntries = scheduleEntries
    .filter((e) => e.dayOfWeek === todayDayOfWeek)
    .sort((a, b) => a.period - b.period);

  const todayLessonsCount = todayEntries.length;

  // 3. Substitutions for today
  const todaySubstitutions = substitutions.filter((s) => s.date === todayIso);
  const substMap = new Map(todaySubstitutions.map((s) => [s.scheduleEntryId, s]));

  const activeChanges: SmartDayChangeInfo[] = [];
  todaySubstitutions.forEach((sub) => {
    const entry = scheduleEntries.find((e) => e.id === sub.scheduleEntryId);
    const subSubject = entry ? subjectMap.get(entry.subjectId) : undefined;
    const origRoom = entry?.roomId ? roomMap.get(entry.roomId)?.name : undefined;
    const origTeacher = entry?.teacherId ? teacherMap.get(entry.teacherId)?.name : undefined;
    const newRoomName = sub.newRoomId ? roomMap.get(sub.newRoomId)?.name : undefined;
    const newTeacherName = sub.newTeacherId ? teacherMap.get(sub.newTeacherId)?.name : undefined;
    const newSubjectName = sub.newSubjectId ? subjectMap.get(sub.newSubjectId)?.name : undefined;

    let details = '';
    switch (sub.type) {
      case 'cancelled':
        details = `${subSubject?.name || 'Unterricht'} (${entry ? `${entry.period}. Std` : 'Heute'}) entfällt.`;
        break;
      case 'room_change':
        details = `${subSubject?.name || 'Fach'}: Raum geändert auf ${newRoomName || 'neu'}${origRoom ? ` (statt ${origRoom})` : ''}.`;
        break;
      case 'teacher_change':
        details = `${subSubject?.name || 'Fach'}: Vertretung durch ${newTeacherName || 'Vertretungslehrer'}${origTeacher ? ` (statt ${origTeacher})` : ''}.`;
        break;
      case 'subject_change':
        details = `Fachänderung: Stattdessen findet ${newSubjectName || 'ein anderes Fach'} statt.`;
        break;
      default:
        details = sub.note || 'Stundenplan-Änderung';
    }

    activeChanges.push({
      id: sub.id,
      scheduleEntryId: sub.scheduleEntryId,
      period: entry?.period || 1,
      subjectName: subSubject?.name || 'Unterricht',
      type: sub.type,
      details,
      originalRoom: origRoom,
      newRoom: newRoomName,
      originalTeacher: origTeacher,
      newTeacher: newTeacherName,
      note: sub.note,
    });
  });

  // 4. Homework & Tasks for today and overdue
  const openHomework = homework.filter((h) => h.status !== 'done');
  const todayHomework = openHomework
    .filter((h) => h.dueDate === todayIso)
    .sort((a, b) => {
      const pMap = { high: 0, normal: 1, low: 2 };
      return (pMap[a.priority] || 1) - (pMap[b.priority] || 1);
    });

  const overdueHomework = openHomework
    .filter((h) => h.dueDate < todayIso)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  // 5. Upcoming exams within next 7 days
  const upcomingExams = exams
    .filter((ex) => {
      if (ex.date < todayIso) return false;
      const exDate = parseISO(ex.date);
      const days = differenceInDays(exDate, currentDate);
      return days >= 0 && days <= 7;
    })
    .map((ex) => {
      const exDate = parseISO(ex.date);
      const daysRemaining = Math.max(0, differenceInDays(exDate, currentDate));
      return {
        exam: ex,
        subject: subjectMap.get(ex.subjectId),
        daysRemaining,
      };
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  // 6. Calculate Time Context & Current / Next Lesson
  const currentTotalMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();
  const currentHour = currentDate.getHours();

  let timeContext: SmartDayTimeContext = 'free_day';
  let currentLesson: SmartDayData['currentLesson'] = null;
  let nextLesson: SmartDayData['nextLesson'] = null;
  let remainingLessonsCount = 0;

  if (activeHoliday) {
    timeContext = 'holiday';
  } else if (isWeekend) {
    timeContext = 'weekend';
  } else if (todayLessonsCount === 0) {
    timeContext = 'free_day';
  } else {
    const firstEntry = todayEntries[0];
    const lastEntry = todayEntries[todayEntries.length - 1];
    const firstStartMin = timeStringToMinutes(firstEntry.startTime);
    const lastEndMin = timeStringToMinutes(lastEntry.endTime);

    if (currentTotalMinutes < firstStartMin) {
      if (currentHour < 7 || firstStartMin - currentTotalMinutes > 90) {
        timeContext = 'early_morning';
      } else {
        timeContext = 'before_school';
      }
      nextLesson = {
        entry: firstEntry,
        subject: subjectMap.get(firstEntry.subjectId),
        teacher: firstEntry.teacherId ? teacherMap.get(firstEntry.teacherId) : undefined,
        room: firstEntry.roomId ? roomMap.get(firstEntry.roomId) : undefined,
        substitution: substMap.get(firstEntry.id),
        minutesUntil: firstStartMin - currentTotalMinutes,
      };
      remainingLessonsCount = todayLessonsCount;
    } else if (currentTotalMinutes >= lastEndMin) {
      if (currentHour >= 18) {
        timeContext = 'evening';
      } else {
        timeContext = 'after_school';
      }
      remainingLessonsCount = 0;
    } else {
      // During the school day
      for (let i = 0; i < todayEntries.length; i++) {
        const entry = todayEntries[i];
        const startMin = timeStringToMinutes(entry.startTime);
        const endMin = timeStringToMinutes(entry.endTime);

        if (currentTotalMinutes >= startMin && currentTotalMinutes < endMin) {
          timeContext = 'in_lesson';
          const sub = substMap.get(entry.id);
          const effTeacherId = sub?.newTeacherId || entry.teacherId;
          const effRoomId = sub?.newRoomId || entry.roomId;

          currentLesson = {
            entry,
            subject: subjectMap.get(entry.subjectId),
            teacher: effTeacherId ? teacherMap.get(effTeacherId) : undefined,
            room: effRoomId ? roomMap.get(effRoomId) : undefined,
            substitution: sub,
            minutesRemaining: endMin - currentTotalMinutes,
          };

          const nextEntry = todayEntries[i + 1];
          if (nextEntry) {
            const nextSub = substMap.get(nextEntry.id);
            const nextEffTeacherId = nextSub?.newTeacherId || nextEntry.teacherId;
            const nextEffRoomId = nextSub?.newRoomId || nextEntry.roomId;

            nextLesson = {
              entry: nextEntry,
              subject: subjectMap.get(nextEntry.subjectId),
              teacher: nextEffTeacherId ? teacherMap.get(nextEffTeacherId) : undefined,
              room: nextEffRoomId ? roomMap.get(nextEffRoomId) : undefined,
              substitution: nextSub,
              minutesUntil: timeStringToMinutes(nextEntry.startTime) - currentTotalMinutes,
            };
          }
          remainingLessonsCount = todayEntries.length - i - 1;
          break;
        }

        if (currentTotalMinutes < startMin) {
          // In a break before this entry
          timeContext = 'in_break';
          const sub = substMap.get(entry.id);
          const effTeacherId = sub?.newTeacherId || entry.teacherId;
          const effRoomId = sub?.newRoomId || entry.roomId;

          nextLesson = {
            entry,
            subject: subjectMap.get(entry.subjectId),
            teacher: effTeacherId ? teacherMap.get(effTeacherId) : undefined,
            room: effRoomId ? roomMap.get(effRoomId) : undefined,
            substitution: sub,
            minutesUntil: startMin - currentTotalMinutes,
          };
          remainingLessonsCount = todayEntries.length - i;
          break;
        }
      }
    }
  }

  // Detect active named break (e.g. 1. Hofpause, 2. Hofpause, Mittagspause)
  let activeBreak: ScheduleBreak | null = null;
  if (timeContext === 'in_break') {
    activeBreak =
      breaks.find((b) => {
        const bStart = timeStringToMinutes(b.startTime);
        const bEnd = timeStringToMinutes(b.endTime);
        return currentTotalMinutes >= bStart && currentTotalMinutes < bEnd;
      }) || null;
  }

  // 7. Greeting & Dynamic Text Generation
  const firstName = userName ? userName.split(' ')[0] : 'Schüler';
  let greeting = 'Guten Tag';
  if (currentHour < 11) greeting = 'Guten Morgen';
  else if (currentHour < 14) greeting = 'Guten Tag';
  else if (currentHour < 18) greeting = 'Guten Nachmittag';
  else greeting = 'Guten Abend';

  let headline = `${greeting}, ${firstName} 👋`;
  let subheadline = '';

  switch (timeContext) {
    case 'early_morning':
    case 'before_school': {
      headline = `${greeting}! Heute hast du ${todayLessonsCount} ${todayLessonsCount === 1 ? 'Stunde' : 'Stunden'}.`;
      if (nextLesson?.subject) {
        const cancelNote = nextLesson.substitution?.type === 'cancelled' ? ' (Fällt aus!)' : '';
        subheadline = `Erste Stunde: ${nextLesson.subject.name} um ${nextLesson.entry.startTime}${cancelNote}.`;
      } else {
        subheadline = 'Hab einen erfolgreichen Schultag!';
      }
      break;
    }
    case 'in_lesson': {
      const subName = currentLesson?.subject?.name || 'Unterricht';
      const isCancelled = currentLesson?.substitution?.type === 'cancelled';
      headline = isCancelled ? `${subName} fällt heute aus.` : `Du bist gerade in ${subName}.`;
      if (currentLesson) {
        subheadline = `Noch ${currentLesson.minutesRemaining} Min. bis zum Stundenende.`;
      }
      break;
    }
    case 'in_break': {
      const nextSubName = nextLesson?.subject?.name || 'die nächste Stunde';
      headline = activeBreak
        ? `☕ ${activeBreak.name}: Noch ${nextLesson?.minutesUntil || 10} Min. bis ${nextSubName}`
        : `In ${nextLesson?.minutesUntil || 10} Minuten beginnt ${nextSubName}.`;
      const roomText = nextLesson?.room ? ` in Raum ${nextLesson.room.name}` : '';
      subheadline = `Bereite dich auf ${nextSubName}${roomText} vor.`;
      break;
    }
    case 'after_school': {
      headline = 'Schule geschafft 🎉';
      if (todayHomework.length > 0) {
        subheadline = `Du hast heute noch ${todayHomework.length} offene ${todayHomework.length === 1 ? 'Aufgabe' : 'Aufgaben'}.`;
      } else if (overdueHomework.length > 0) {
        subheadline = `Du hast ${overdueHomework.length} überfällige ${overdueHomework.length === 1 ? 'Aufgabe' : 'Aufgaben'}.`;
      } else {
        subheadline = 'Keine Aufgaben mehr für heute – genieße deinen Nachmittag!';
      }
      break;
    }
    case 'evening': {
      headline = `Guten Abend, ${firstName} 🌙`;
      const openCount = todayHomework.length + overdueHomework.length;
      if (openCount > 0) {
        subheadline = `Noch ${openCount} ${openCount === 1 ? 'Aufgabe ist' : 'Aufgaben sind'} offen.`;
      } else if (upcomingExams.length > 0) {
        const nextEx = upcomingExams[0];
        subheadline = `Bald anstehend: ${nextEx.exam.title} in ${nextEx.daysRemaining} Tagen.`;
      } else {
        subheadline = 'Alles erledigt. Ruh dich für morgen aus!';
      }
      break;
    }
    case 'weekend': {
      headline = `Schönes Wochenende, ${firstName} ☀️`;
      const openTasksCount = openHomework.length;
      if (openTasksCount > 0) {
        subheadline = `${openTasksCount} offene ${openTasksCount === 1 ? 'Aufgabe' : 'Aufgaben'} für die kommende Woche.`;
      } else {
        subheadline = 'Keine offenen Schulaufgaben. Zeit zum Entspannen!';
      }
      break;
    }
    case 'holiday': {
      headline = `${activeHoliday?.name || 'Ferienzeit'} 🏖️`;
      subheadline = activeHoliday?.type === 'vacation'
        ? 'Genieße deine Ferien! Kalender und Notizen stehen dir weiterhin zur Verfügung.'
        : 'Heute ist gesetzlicher Feiertag oder schulfrei.';
      break;
    }
    case 'free_day': {
      headline = `Heute ist unterrichtsfrei ☕`;
      const openCount = openHomework.length;
      if (openCount > 0) {
        subheadline = `Du hast ${openCount} offene ${openCount === 1 ? 'Aufgabe' : 'Aufgaben'}.`;
      } else {
        subheadline = 'Keine Termine oder Stunden für heute eingetragen.';
      }
      break;
    }
  }

  return {
    timeContext,
    greeting,
    headline,
    subheadline,
    currentLesson,
    nextLesson,
    todayLessonsCount,
    remainingLessonsCount,
    todayHomework,
    overdueHomework,
    upcomingExams,
    activeChanges,
    activeHoliday,
    activeBreak,
  };
}
