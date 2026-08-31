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

import {
  OFFICIAL_SCHERPF_PERIODS,
  OFFICIAL_SCHERPF_BREAKS,
  DEFAULT_SCHOOL_PROFILE,
} from '../config/schoolConfig';

export const DEFAULT_PERIOD_TIMES: SchedulePeriodTime[] = OFFICIAL_SCHERPF_PERIODS;

export const DEFAULT_BREAKS: ScheduleBreak[] = OFFICIAL_SCHERPF_BREAKS;

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
  state: 'BB',
  schoolName: DEFAULT_SCHOOL_PROFILE.name,
  gradeLevel: '',
  periodTimes: DEFAULT_PERIOD_TIMES,
  breaks: DEFAULT_BREAKS,
  defaultCalendarView: 'week',
  notificationsEnabled: true,
  dailySummaryTime: '07:15',
  activeTimetableVersion: 'default',
  webuntisServer: 'arche.webuntis.com',
  webuntisSchool: 'scherpf-gymnasium',
  notifications: DEFAULT_NOTIFICATION_PREFERENCES,
  autoDueDateRule: 'next_lesson',
  onboardingCompleted: false,
  onboardingVersion: 1,
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
