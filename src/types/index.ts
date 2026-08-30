export type NavigationTab = 'today' | 'calendar' | 'tasks' | 'school' | 'settings';

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

export interface Holiday {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  type: 'vacation' | 'public_holiday' | 'school_free';
  state: string; // Bundesland code (e.g. "BY", "NW", "BW", "BE", "HE", etc.) or "ALL"
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: string; // e.g. '#007AFF'
  state: string;       // Bundesland e.g. "BY", "NW", "BW", "BE"
  schoolName: string;
  gradeLevel: string;  // e.g. "10a", "Q11", "Klasse 9"
  periodTimes: SchedulePeriodTime[];
  defaultCalendarView: CalendarViewType;
  notificationsEnabled: boolean;
  dailySummaryTime: string;
  activeTimetableVersion: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
}

export type QuickActionType =
  | 'event'
  | 'homework'
  | 'exam'
  | 'test'
  | 'study'
  | 'substitution';
