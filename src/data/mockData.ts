import type {
  Subject,
  Teacher,
  Room,
  SchedulePeriodTime,
  ScheduleEntry,
  Substitution,
  CalendarEvent,
  Homework,
  Exam,
  UserSettings,
} from '../types';

export const DEFAULT_PERIOD_TIMES: SchedulePeriodTime[] = [
  { period: 1, startTime: '08:00', endTime: '08:45' },
  { period: 2, startTime: '08:50', endTime: '09:35' },
  { period: 3, startTime: '09:55', endTime: '10:40' },
  { period: 4, startTime: '10:45', endTime: '11:30' },
  { period: 5, startTime: '11:45', endTime: '12:30' },
  { period: 6, startTime: '12:35', endTime: '13:20' },
  { period: 7, startTime: '14:05', endTime: '14:50' },
  { period: 8, startTime: '14:55', endTime: '15:40' },
];

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'system',
  accentColor: '#007AFF',
  state: 'BY',
  schoolName: '',
  gradeLevel: '',
  periodTimes: DEFAULT_PERIOD_TIMES,
  defaultCalendarView: 'week',
  notificationsEnabled: true,
  dailySummaryTime: '07:15',
  activeTimetableVersion: 'default',
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
