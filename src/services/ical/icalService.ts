import type { CalendarEvent, Exam, Homework, Subject, ScheduleEntry, Teacher, Room } from '../../types';
import { format, parseISO } from 'date-fns';

function formatIcsDate(dateStr: string, isAllDay: boolean = false): string {
  const date = parseISO(dateStr);
  if (isAllDay) {
    return format(date, 'yyyyMMdd');
  }
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function generateIcsCalendar(params: {
  events?: CalendarEvent[];
  exams?: Exam[];
  homework?: Homework[];
  subjects?: Subject[];
  scheduleEntries?: ScheduleEntry[];
  teachers?: Teacher[];
  rooms?: Room[];
}): string {
  const { events = [], exams = [], homework = [], subjects = [], teachers = [], rooms = [] } = params;

  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const roomMap = new Map(rooms.map(r => [r.id, r]));

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SchoolCal//Schulkalender App//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:SchoolCal Stundenplan & Termine',
    'X-WR-TIMEZONE:Europe/Berlin',
  ];

  const nowStr = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");

  // 1. Calendar Events
  for (const evt of events) {
    const isAllDay = Boolean(evt.allDay);
    const startProp = isAllDay ? `DTSTART;VALUE=DATE:${formatIcsDate(evt.startDate, true)}` : `DTSTART:${formatIcsDate(evt.startDate)}`;
    const endProp = isAllDay ? `DTEND;VALUE=DATE:${formatIcsDate(evt.endDate, true)}` : `DTEND:${formatIcsDate(evt.endDate)}`;

    ics.push('BEGIN:VEVENT');
    ics.push(`UID:event-${evt.id}@schoolcal.app`);
    ics.push(`DTSTAMP:${nowStr}`);
    ics.push(startProp);
    ics.push(endProp);
    ics.push(`SUMMARY:${escapeIcsText(evt.title)}`);
    if (evt.description) ics.push(`DESCRIPTION:${escapeIcsText(evt.description)}`);
    if (evt.location) ics.push(`LOCATION:${escapeIcsText(evt.location)}`);
    ics.push(`CATEGORIES:${evt.type.toUpperCase()}`);
    ics.push('END:VEVENT');
  }

  // 2. Exams
  for (const exam of exams) {
    const subject = subjectMap.get(exam.subjectId);
    const subjectName = subject?.name || 'Fach';
    const room = exam.roomId ? roomMap.get(exam.roomId)?.name : '';
    const teacher = exam.teacherId ? teacherMap.get(exam.teacherId)?.name : '';

    const startTime = exam.startTime || '08:00';
    const endTime = exam.endTime || '09:35';
    const startIso = `${exam.date}T${startTime}:00`;
    const endIso = `${exam.date}T${endTime}:00`;

    const topicList = exam.topics.map(t => `- ${t.title} (${t.completed ? 'Gelernt' : 'Offen'})`).join('\\n');
    const desc = `Klausur/Test in ${subjectName}\\nFortschritt: ${exam.studyProgress}%\\n\\nThemen:\\n${topicList}${exam.notes ? `\\n\\nNotizen: ${exam.notes}` : ''}`;

    ics.push('BEGIN:VEVENT');
    ics.push(`UID:exam-${exam.id}@schoolcal.app`);
    ics.push(`DTSTAMP:${nowStr}`);
    ics.push(`DTSTART:${formatIcsDate(startIso)}`);
    ics.push(`DTEND:${formatIcsDate(endIso)}`);
    ics.push(`SUMMARY:${escapeIcsText(`[Klausur] ${subjectName}: ${exam.title}`)}`);
    ics.push(`DESCRIPTION:${escapeIcsText(desc)}`);
    if (room) ics.push(`LOCATION:${escapeIcsText(room)}`);
    if (teacher) ics.push(`ORGANIZER;CN=${escapeIcsText(teacher)}:mailto:noreply@schoolcal.app`);
    ics.push('CATEGORIES:KLAUSUR,SCHULE');
    ics.push('END:VEVENT');
  }

  // 3. Homework Deadlines
  for (const hw of homework) {
    if (hw.status === 'done') continue;
    const subject = subjectMap.get(hw.subjectId);
    const dueTime = hw.dueTime || '08:00';
    const startIso = `${hw.dueDate}T${dueTime}:00`;

    ics.push('BEGIN:VEVENT');
    ics.push(`UID:homework-${hw.id}@schoolcal.app`);
    ics.push(`DTSTAMP:${nowStr}`);
    ics.push(`DTSTART:${formatIcsDate(startIso)}`);
    ics.push(`DTEND:${formatIcsDate(startIso)}`);
    ics.push(`SUMMARY:${escapeIcsText(`[Hausaufgabe] ${subject?.name || 'Aufgabe'}: ${hw.title}`)}`);
    if (hw.description) ics.push(`DESCRIPTION:${escapeIcsText(hw.description)}`);
    ics.push(`PRIORITY:${hw.priority === 'high' ? '1' : hw.priority === 'normal' ? '5' : '9'}`);
    ics.push('CATEGORIES:HAUSAUFGABE');
    ics.push('END:VEVENT');
  }

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

export function downloadIcsFile(content: string, filename: string = 'SchoolCal.ics') {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
