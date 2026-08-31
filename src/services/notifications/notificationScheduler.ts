import { format, parseISO, differenceInDays } from 'date-fns';
import type {
  ScheduleEntry,
  Substitution,
  Homework,
  Exam,
  Subject,
  Room,
  Teacher,
  NotificationPreferences,
} from '../../types';
import { sendLocalNotification, isWithinQuietHours } from './notificationService';

export interface SchedulerContext {
  scheduleEntries: ScheduleEntry[];
  substitutions: Substitution[];
  homework: Homework[];
  exams: Exam[];
  subjects: Subject[];
  rooms: Room[];
  teachers: Teacher[];
  preferences: NotificationPreferences;
  userName?: string;
  currentDate?: Date;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'lesson' | 'substitution' | 'homework' | 'exam' | 'smart_summary';
  isCritical?: boolean;
}

export function evaluatePendingNotifications({
  scheduleEntries = [],
  substitutions = [],
  homework = [],
  exams = [],
  subjects = [],
  rooms = [],
  teachers = [],
  preferences,
  userName = 'Schüler',
  currentDate = new Date(),
}: SchedulerContext): NotificationItem[] {
  if (!preferences || !preferences.enabled) return [];

  const items: NotificationItem[] = [];
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));

  const todayIso = format(currentDate, 'yyyy-MM-dd');
  const jsDay = currentDate.getDay();
  const dayOfWeek = jsDay === 0 ? 7 : jsDay;
  const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

  // 1. Substitutions & Changes
  if (preferences.substitutions || preferences.cancellations || preferences.roomChanges) {
    const todaySubs = substitutions.filter((s) => s.date === todayIso);
    todaySubs.forEach((sub) => {
      const entry = scheduleEntries.find((e) => e.id === sub.scheduleEntryId);
      const subSubject = entry ? subjectMap.get(entry.subjectId) : undefined;
      const room = sub.newRoomId ? roomMap.get(sub.newRoomId) : undefined;
      const teacher = sub.newTeacherId ? teacherMap.get(sub.newTeacherId) : undefined;

      if (sub.type === 'cancelled' && preferences.cancellations) {
        items.push({
          id: `sub-canc-${sub.id}`,
          title: `🔴 Ausfall: ${subSubject?.name || 'Unterricht'}`,
          body: `${subSubject?.name || 'Unterricht'} in der ${entry?.period || 1}. Stunde fällt heute aus.`,
          type: 'substitution',
          isCritical: true,
        });
      } else if (sub.type === 'room_change' && preferences.roomChanges) {
        items.push({
          id: `sub-room-${sub.id}`,
          title: `📍 Raumänderung: ${subSubject?.name || 'Fach'}`,
          body: `${subSubject?.name || 'Unterricht'} findet heute in Raum ${room?.name || 'neu'} statt.`,
          type: 'substitution',
          isCritical: true,
        });
      } else if (sub.type === 'teacher_change' && preferences.teacherChanges) {
        items.push({
          id: `sub-teach-${sub.id}`,
          title: `👤 Vertretung: ${subSubject?.name || 'Fach'}`,
          body: `Vertretung durch ${teacher?.name || 'Lehrkraft'} in der ${entry?.period || 1}. Stunde.`,
          type: 'substitution',
          isCritical: false,
        });
      }
    });
  }

  // 2. Imminent Lessons Reminder
  if (preferences.lessonReminders) {
    const reminderOffset = preferences.lessonReminderMinutes || 10;
    const todayEntries = scheduleEntries.filter((e) => e.dayOfWeek === dayOfWeek);

    todayEntries.forEach((entry) => {
      const [h, m] = entry.startTime.split(':').map(Number);
      const startTotal = (h || 0) * 60 + (m || 0);
      const diff = startTotal - currentMinutes;

      // If lesson starts within the reminder offset window (e.g. within 1-15 min)
      if (diff > 0 && diff <= reminderOffset) {
        const sub = subjectMap.get(entry.subjectId);
        const room = entry.roomId ? roomMap.get(entry.roomId) : undefined;
        items.push({
          id: `les-${entry.id}-${startTotal}`,
          title: `🏫 Gleich: ${sub?.name || 'Unterricht'}`,
          body: `In ${diff} Minuten beginnt ${sub?.name || 'Unterricht'}${room ? ` in Raum ${room.name}` : ''}.`,
          type: 'lesson',
        });
      }
    });
  }

  // 3. Homework Due Reminders & Shift Notifications
  if (preferences.homeworkDueDayBefore || preferences.homeworkDue2HoursBefore || preferences.cancellations) {
    const openHw = homework.filter((h) => h.status !== 'done');
    openHw.forEach((h) => {
      const sub = subjectMap.get(h.subjectId);

      // A. Shift notification if postponed due to cancellation
      if (h.dueDateSource?.isShifted && preferences.cancellations) {
        items.push({
          id: `hw-shifted-${h.id}-${h.dueDate}`,
          title: `📝 Frist angepasst: ${sub?.name || 'Hausaufgabe'}`,
          body: `Der Unterricht entfällt. Die Frist für "${h.title}" wurde automatisch auf ${h.dueDate} verschoben.`,
          type: 'homework',
        });
      }

      // B. Normal due reminder
      if (h.dueDate === todayIso && preferences.homeworkDueDayBefore) {
        items.push({
          id: `hw-today-${h.id}`,
          title: `📝 Heute fällig: ${h.title}`,
          body: `Fach: ${sub?.name || 'Aufgabe'}${h.dueTime ? ` bis ${h.dueTime} Uhr` : ''}`,
          type: 'homework',
        });
      }
    });
  }

  // 4. Exam Reminders
  if (preferences.examReminderDayOf || preferences.examReminder1Day || preferences.examReminder3Days || preferences.examReminder7Days) {
    exams.forEach((ex) => {
      if (ex.date >= todayIso) {
        const exDate = parseISO(ex.date);
        const daysLeft = differenceInDays(exDate, currentDate);
        const sub = subjectMap.get(ex.subjectId);

        if (daysLeft === 0 && preferences.examReminderDayOf) {
          items.push({
            id: `ex-0-${ex.id}`,
            title: `🧪 Heute Klausur: ${ex.title}`,
            body: `${sub?.name || 'Prüfung'}${ex.startTime ? ` um ${ex.startTime} Uhr` : ''}. Viel Erfolg!`,
            type: 'exam',
            isCritical: true,
          });
        } else if (daysLeft === 1 && preferences.examReminder1Day) {
          items.push({
            id: `ex-1-${ex.id}`,
            title: `🧪 Morgen Klausur: ${ex.title}`,
            body: `${sub?.name || 'Prüfung'} findet morgen statt. Zeit für die letzte Wiederholung!`,
            type: 'exam',
          });
        } else if (daysLeft === 3 && preferences.examReminder3Days) {
          items.push({
            id: `ex-3-${ex.id}`,
            title: `🧪 In 3 Tagen: ${ex.title}`,
            body: `Klausur in ${sub?.name || 'Fach'} steht bevor.`,
            type: 'exam',
          });
        }
      }
    });
  }

  return items;
}
