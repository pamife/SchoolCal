import type {
  Subject,
  Teacher,
  Room,
  ScheduleEntry,
  Substitution,
  CalendarEvent,
  Homework,
  Exam,
  Grade,
  UserProfile,
  UserSettings,
} from '../../types';

export interface GdprExportData {
  schemaVersion: string;
  gdprArticle: string;
  application: string;
  exportedAt: string;
  user: {
    uid: string;
    email: string;
    displayName: string;
    plan: string;
    planSource: string;
    role: string;
    createdAt?: string;
    updatedAt?: string;
  };
  userSettings: UserSettings;
  data: {
    subjects: Subject[];
    teachers: Teacher[];
    rooms: Room[];
    scheduleEntries: ScheduleEntry[];
    substitutions: Substitution[];
    calendarEvents: CalendarEvent[];
    homework: Homework[];
    exams: Exam[];
    grades: Grade[];
  };
  statistics: {
    totalSubjects: number;
    totalTeachers: number;
    totalRooms: number;
    totalScheduleEntries: number;
    totalHomework: number;
    totalExams: number;
    totalGrades: number;
    totalCalendarEvents: number;
  };
}

export interface FullBackupData {
  version: string;
  exportedAt: string;
  userSettings: UserSettings;
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  scheduleEntries: ScheduleEntry[];
  substitutions: Substitution[];
  events: CalendarEvent[];
  homework: Homework[];
  exams: Exam[];
  grades?: Grade[];
}

export interface ExportGdprParams {
  user: UserProfile | null;
  settings: UserSettings;
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  scheduleEntries: ScheduleEntry[];
  substitutions: Substitution[];
  events: CalendarEvent[];
  homework: Homework[];
  exams: Exam[];
  grades: Grade[];
}

/**
 * Generates and downloads a complete, GDPR Art. 20 compliant JSON data export.
 * Contains every single piece of personal and school data stored for the active user.
 */
export function exportGdprUserDataJson(params: ExportGdprParams): void {
  const now = new Date();
  const exportedAtIso = now.toISOString();

  const exportPayload: GdprExportData = {
    schemaVersion: '2.0.0',
    gdprArticle: 'Art. 20 DSGVO (Recht auf Datenübertragbarkeit / Right to data portability)',
    application: 'SchoolCal WebApp (https://github.com/pamife/SchoolCal)',
    exportedAt: exportedAtIso,
    user: {
      uid: params.user?.uid || 'unknown',
      email: params.user?.email || '',
      displayName: params.user?.displayName || '',
      plan: params.user?.plan || 'STANDARD',
      planSource: params.user?.planSource || 'FREE',
      role: params.user?.role || 'user',
      createdAt: params.user?.createdAt,
      updatedAt: params.user?.updatedAt,
    },
    userSettings: params.settings,
    data: {
      subjects: params.subjects,
      teachers: params.teachers,
      rooms: params.rooms,
      scheduleEntries: params.scheduleEntries,
      substitutions: params.substitutions,
      calendarEvents: params.events,
      homework: params.homework,
      exams: params.exams,
      grades: params.grades,
    },
    statistics: {
      totalSubjects: params.subjects.length,
      totalTeachers: params.teachers.length,
      totalRooms: params.rooms.length,
      totalScheduleEntries: params.scheduleEntries.length,
      totalHomework: params.homework.length,
      totalExams: params.exams.length,
      totalGrades: params.grades.length,
      totalCalendarEvents: params.events.length,
    },
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeDate = exportedAtIso.slice(0, 10);
  link.setAttribute('download', `SchoolCal_DSGVO_Datenexport_${safeDate}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportFullJsonBackup(data: Omit<FullBackupData, 'version' | 'exportedAt'>): void {
  const backup: FullBackupData = {
    version: '1.1.0',
    exportedAt: new Date().toISOString(),
    ...data,
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `SchoolCal_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseJsonBackup(jsonString: string): FullBackupData {
  const parsed = JSON.parse(jsonString);
  if (!parsed.subjects || !parsed.scheduleEntries || !parsed.homework) {
    throw new Error('Ungültige SchoolCal Backup-Datei: Erforderliche Felder fehlen.');
  }
  return parsed as FullBackupData;
}

export function exportScheduleCsv(entries: ScheduleEntry[], subjects: Subject[], teachers: Teacher[], rooms: Room[]): void {
  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const roomMap = new Map(rooms.map(r => [r.id, r]));

  const days = ['', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

  const rows: string[] = ['Wochentag,Stunde,Startzeit,Endzeit,Fach,Lehrer,Raum'];

  for (const entry of entries) {
    const dayName = days[entry.dayOfWeek] || `Tag ${entry.dayOfWeek}`;
    const subjectName = subjectMap.get(entry.subjectId)?.name || '';
    const teacherName = entry.teacherId ? teacherMap.get(entry.teacherId)?.name || '' : '';
    const roomName = entry.roomId ? roomMap.get(entry.roomId)?.name || '' : '';

    rows.push(`"${dayName}",${entry.period},"${entry.startTime}","${entry.endTime}","${subjectName}","${teacherName}","${roomName}"`);
  }

  const csvContent = '\uFEFF' + rows.join('\r\n'); // Add BOM for Excel UTF-8
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Stundenplan_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
