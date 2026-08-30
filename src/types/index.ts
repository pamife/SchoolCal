export type NavigationTab = 'today' | 'calendar' | 'tasks' | 'grades' | 'statistics' | 'school' | 'settings';

export type CalendarViewType = 'day' | '3days' | 'week' | 'month';

export type CalendarEventType =
  | 'lesson'
  | 'exam'
  | 'test'
  | 'homework'
  | 'submission'
  | 'study'
  | 'leisure'
  | 'personal'
  | 'other';

export type PriorityLevel = 'low' | 'normal' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type ExamType = 'exam' | 'test' | 'oral_exam' | 'presentation';

export type SubstitutionType =
  | 'teacher_change'
  | 'room_change'
  | 'subject_change'
  | 'cancelled'
  | 'postponed'
  | 'extra';

export interface Subject {
  id: string;
  name: string;
  shortName: string;
  color: string; // Hex color code
  icon: string; // Lucide icon identifier
  teacherId?: string;
  defaultRoomId?: string;
}

export interface Teacher {
  id: string;
  name: string;
  shortName: string;
  email?: string;
  title?: string; // z.B. "Herr", "Frau", "Dr."
  subjects?: string[]; // Subject IDs
}

export interface Room {
  id: string;
  name: string;
  building?: string;
  floor?: string;
  notes?: string;
}

export interface SchedulePeriodTime {
  period: number;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  label?: string;    // e.g. "1. Stunde"
}

export interface ScheduleBreak {
  id: string;
  name: string;      // z.B. "1. Pause", "Große Pause", "Mittagspause"
  afterPeriod: number; // Nach welcher Stunde (z.B. 2 = nach 2. Std)
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

export interface ScheduleEntry {
  id: string;
  dayOfWeek: number; // 1 = Mo, 2 = Di, 3 = Mi, 4 = Do, 5 = Fr, 6 = Sa
  period: number;    // 1 to 10
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  subjectId: string;
  teacherId?: string;
  roomId?: string;
  versionId?: string; // e.g. "default", "week_a", "week_b"
}

export interface Substitution {
  id: string;
  scheduleEntryId: string;
  date: string; // YYYY-MM-DD
  type: SubstitutionType;
  newTeacherId?: string;
  newRoomId?: string;
  newSubjectId?: string;
  note?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: CalendarEventType;
  startDate: string; // ISO String (YYYY-MM-DDTHH:mm:ss)
  endDate: string;   // ISO String (YYYY-MM-DDTHH:mm:ss)
  allDay?: boolean;
  location?: string;
  color?: string;
  subjectId?: string;
  teacherId?: string;
  reminderMinutes?: number;
  recurrence?: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
}

export interface Homework {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: PriorityLevel;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  calendarEventId?: string;
  attachments?: string[];
}

export interface ExamTopic {
  id: string;
  title: string;
  completed: boolean;
}

export interface Exam {
  id: string;
  title: string;
  subjectId: string;
  type: ExamType;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  roomId?: string;
  teacherId?: string;
  topics: ExamTopic[];
  studyProgress: number; // 0 - 100 percentage
  notes?: string;
  grade?: string;
}

// ----------------------------------------------------
// Pro Feature: Noten & Notenschnitt (Grade Analytics)
// ----------------------------------------------------

export type GradeType = 'exam' | 'test' | 'oral' | 'presentation' | 'homework' | 'other';

export interface Grade {
  id: string;
  subjectId: string;
  value: number; // e.g. 1.0 - 6.0
  weight: number; // 1.0 = einfach, 2.0 = doppelt (z.B. Klausur/Schulaufgabe)
  type: GradeType;
  date: string; // YYYY-MM-DD
  title: string; // e.g. "1. Schulaufgabe"
  notes?: string;
}

export interface Holiday {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  type: 'vacation' | 'public_holiday' | 'school_free';
  state: string; // Bundesland code (e.g. "BY", "NW", "BW", "BE", "HE", etc.) or "ALL"
}

// ----------------------------------------------------
// Notification Preferences & Settings
// ----------------------------------------------------

export interface NotificationPreferences {
  enabled: boolean;
  lessonReminders: boolean;
  lessonReminderMinutes: number; // e.g. 5, 10, 15, 30
  roomChanges: boolean;
  teacherChanges: boolean;
  cancellations: boolean;
  substitutions: boolean;
  homeworkDueDayBefore: boolean;
  homeworkDue2HoursBefore: boolean;
  homeworkDue30MinBefore: boolean;
  examReminder7Days: boolean;
  examReminder3Days: boolean;
  examReminder1Day: boolean;
  examReminderDayOf: boolean;
  smartDayMorningBrief: boolean;
  schoolEndSummary: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm e.g. "22:00"
  quietHoursEnd: string;   // HH:mm e.g. "07:00"
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: string; // e.g. '#007AFF'
  state: string;       // Bundesland e.g. "BY", "NW", "BW", "BE"
  schoolName: string;
  gradeLevel: string;  // e.g. "10a", "Q11", "Klasse 9"
  periodTimes: SchedulePeriodTime[];
  breaks?: ScheduleBreak[];
  defaultCalendarView: CalendarViewType;
  notificationsEnabled: boolean;
  dailySummaryTime: string;
  activeTimetableVersion: string;
  webuntisServer?: string;
  webuntisSchool?: string;
  webuntisUsername?: string;
  notifications?: NotificationPreferences;
}

// ----------------------------------------------------
// 🧠 Smart Day Types
// ----------------------------------------------------

export type SmartDayTimeContext =
  | 'early_morning'
  | 'before_school'
  | 'in_lesson'
  | 'in_break'
  | 'after_school'
  | 'evening'
  | 'weekend'
  | 'holiday'
  | 'free_day';

export interface SmartDayChangeInfo {
  id: string;
  scheduleEntryId: string;
  period: number;
  subjectName: string;
  type: SubstitutionType;
  details: string;
  originalRoom?: string;
  newRoom?: string;
  originalTeacher?: string;
  newTeacher?: string;
  note?: string;
}

export interface SmartDayData {
  timeContext: SmartDayTimeContext;
  greeting: string;
  headline: string;
  subheadline: string;
  currentLesson: {
    entry: ScheduleEntry;
    subject?: Subject;
    teacher?: Teacher;
    room?: Room;
    substitution?: Substitution;
    minutesRemaining: number;
  } | null;
  nextLesson: {
    entry: ScheduleEntry;
    subject?: Subject;
    teacher?: Teacher;
    room?: Room;
    substitution?: Substitution;
    minutesUntil: number;
  } | null;
  todayLessonsCount: number;
  remainingLessonsCount: number;
  todayHomework: Homework[];
  overdueHomework: Homework[];
  upcomingExams: Array<{
    exam: Exam;
    subject?: Subject;
    daysRemaining: number;
  }>;
  activeChanges: SmartDayChangeInfo[];
  activeHoliday?: Holiday;
}

// ----------------------------------------------------
// 📊 School Statistics Types
// ----------------------------------------------------

export type StatisticsPeriod =
  | 'today'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'school_year';

export interface SubjectStat {
  subjectId: string;
  subjectName: string;
  shortName: string;
  color: string;
  lessonMinutes: number;
  lessonHoursFormatted: string;
  totalTasks: number;
  completedTasks: number;
  openTasks: number;
  completionRate: number; // 0 - 100
  averageGrade?: number;
}

export interface WeeklyTrendPoint {
  weekLabel: string; // e.g. "KW 34"
  completedTasks: number;
  totalTasks: number;
  lessonHours: number;
}

export interface SchoolStatistics {
  period: StatisticsPeriod;
  periodLabel: string;
  totalLessonMinutes: number;
  totalLessonHoursFormatted: string;
  completedHomeworkCount: number;
  openHomeworkCount: number;
  overdueHomeworkCount: number;
  totalHomeworkCount: number;
  overallCompletionRate: number; // 0 - 100
  upcomingExamsCount: number;
  completedExamsCount: number;
  subjectStats: SubjectStat[];
  weeklyTrends: WeeklyTrendPoint[];
  hasEnoughDataForTrends: boolean;
}

// ----------------------------------------------------
// 🤖 AI School Assistant Types
// ----------------------------------------------------

export type AIChatRole = 'user' | 'assistant' | 'system';

export type AIActionType =
  | 'CREATE_STUDY_PLAN'
  | 'CREATE_HOMEWORK'
  | 'CREATE_CALENDAR_EVENT'
  | 'NAVIGATE_TAB';

export interface AIActionPayload {
  type: AIActionType;
  title: string;
  description?: string;
  data: Record<string, any>;
  requiresConfirmation: boolean;
}

export interface AIChatMessage {
  id: string;
  role: AIChatRole;
  content: string;
  timestamp: string;
  action?: AIActionPayload;
  actionExecuted?: boolean;
}

// ----------------------------------------------------
// Licensing & Permission System Types
// ----------------------------------------------------

export type UserPlan = 'STANDARD' | 'PLUS' | 'PRO';

export type PlanSource = 'FREE' | 'LICENSE' | 'ADMIN';

export type LicenseStatus = 'AVAILABLE' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export interface License {
  id: string;
  codeHash: string; // SHA-256 hash of the activation code
  codePrefix: string; // Masked representation for display e.g. "SCAL-PLUS-****-Q8FD"
  plan: 'PLUS' | 'PRO';
  status: LicenseStatus;
  durationDays: number | null; // null = unlimited (lifetime)
  createdAt: string;
  expiresAt: string | null; // ISO string when active or fixed expiry
  activatedAt: string | null;
  activatedByUid: string | null;
  activatedByEmail?: string | null;
  revokedAt: string | null;
  revokedByUid: string | null;
  notes?: string | null;
}

export interface AuditLogEntry {
  id: string;
  action:
    | 'LICENSE_CREATED'
    | 'LICENSE_ACTIVATED'
    | 'LICENSE_REVOKED'
    | 'LICENSE_RESTORED'
    | 'MANUAL_PLAN_GRANTED'
    | 'USER_DELETED';
  actorUid: string;
  actorEmail?: string;
  targetUid?: string | null;
  targetEmail?: string | null;
  licenseId?: string | null;
  details?: Record<string, any>;
  timestamp: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  plan: UserPlan;
  planSource: PlanSource;
  activeLicenseId: string | null;
  planExpiresAt: string | null; // ISO string or null for lifetime
  role?: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export type QuickActionType =
  | 'event'
  | 'homework'
  | 'exam'
  | 'test'
  | 'study'
  | 'substitution'
  | 'ai_plan'
  | 'ai_chat';

