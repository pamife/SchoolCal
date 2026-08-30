import type {
  Subject,
  Teacher,
  Room,
  SchedulePeriodTime,
  ScheduleBreak,
  ScheduleEntry,
  Substitution,
  CalendarEvent,
  Homework,
  Exam,
  UserSettings,
} from '../types';

export const DEFAULT_PERIOD_TIMES: SchedulePeriodTime[] = [
  { period: 1, startTime: '08:00', endTime: '08:45', label: '1. Stunde' },
  { period: 2, startTime: '08:50', endTime: '09:35', label: '2. Stunde' },
  { period: 3, startTime: '09:55', endTime: '10:40', label: '3. Stunde' },
  { period: 4, startTime: '10:45', endTime: '11:30', label: '4. Stunde' },
  { period: 5, startTime: '11:45', endTime: '12:30', label: '5. Stunde' },
  { period: 6, startTime: '12:35', endTime: '13:20', label: '6. Stunde' },
  { period: 7, startTime: '14:05', endTime: '14:50', label: '7. Stunde' },
  { period: 8, startTime: '14:55', endTime: '15:40', label: '8. Stunde' },
];

export const DEFAULT_BREAKS: ScheduleBreak[] = [
  { id: 'break-1', name: '1. Pause', afterPeriod: 2, startTime: '09:35', endTime: '09:55' },
  { id: 'break-2', name: '2. Pause', afterPeriod: 4, startTime: '11:30', endTime: '11:45' },
  { id: 'break-3', name: 'Mittagspause', afterPeriod: 6, startTime: '13:20', endTime: '14:05' },
];

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  enabled: true,
  lessonReminders: true,
  lessonReminderMinutes: 10,
  roomChanges: true,
  teacherChanges: true,
  cancellations: true,
  substitutions: true,
  homeworkDueDayBefore: true,
  homeworkDue2HoursBefore: true,
  homeworkDue30MinBefore: false,
  examReminder7Days: true,
  examReminder3Days: true,
  examReminder1Day: true,
  examReminderDayOf: true,
  smartDayMorningBrief: true,
  schoolEndSummary: true,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'system',
  accentColor: '#007AFF',
  state: 'BY',
  schoolName: '',
  gradeLevel: '',
  periodTimes: DEFAULT_PERIOD_TIMES,
  breaks: DEFAULT_BREAKS,
  defaultCalendarView: 'week',
  notificationsEnabled: true,
  dailySummaryTime: '07:15',
  activeTimetableVersion: 'default',
  notifications: DEFAULT_NOTIFICATION_PREFERENCES,
};

// No demo data: All datasets start completely empty for each user
export const MOCK_SUBJECTS: Subject[] = [];
export const MOCK_TEACHERS: Teacher[] = [];
export const MOCK_ROOMS: Room[] = [];
export const MOCK_SCHEDULE_ENTRIES: ScheduleEntry[] = [];
export const MOCK_SUBSTITUTIONS: Substitution[] = [];
export const MOCK_HOMEWORK: Homework[] = [];
export const MOCK_EXAMS: Exam[] = [];
export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [];
