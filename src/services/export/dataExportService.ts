import type {
  Subject,
  Teacher,
  Room,
  ScheduleEntry,
  Substitution,
  CalendarEvent,
  Homework,
  Exam,
  UserSettings,
} from '../../types';

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
}

export function exportFullJsonBackup(data: Omit<FullBackupData, 'version' | 'exportedAt'>): void {
  const backup: FullBackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    ...data,
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
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
