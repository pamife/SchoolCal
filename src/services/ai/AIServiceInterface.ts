import type {
  ScheduleEntry,
  Subject,
  Homework,
  Exam,
  Grade,
  AIChatMessage,
  AIActionPayload,
} from '../../types';

export interface AISchoolContext {
  currentDate: string; // ISO string or formatted
  weekday: string;
  userName: string;
  schoolName?: string;
  gradeLevel?: string;
  todaySchedule: Array<{
    period: number;
    startTime: string;
    endTime: string;
    subjectName: string;
    roomName?: string;
    teacherName?: string;
  }>;
  weeklyScheduleSummary: string[];
  openHomework: Array<{
    id: string;
    title: string;
    subjectName: string;
    dueDate: string;
    dueTime?: string;
    priority: string;
    dueDateMode?: string; // 'AUTO' | 'MANUAL'
  }>;
  upcomingExams: Array<{
    id: string;
    title: string;
    subjectName: string;
    date: string;
    daysLeft: number;
    topics?: string[];
  }>;
  gradesSummary?: {
    overallAverage?: string;
    subjectAverages?: Array<{ subjectName: string; average: string }>;
  };
}

export interface AIResponse {
  text: string;
  action?: AIActionPayload;
  errorType?: string;
}

export type AIHealthState = 'active' | 'missing_key' | 'invalid_key' | 'rate_limited' | 'unreachable' | 'offline';

export interface AIHealthStatus {
  ok: boolean;
  status: AIHealthState;
  configured: boolean;
  provider: string;
  model?: string;
  message: string;
  lastChecked?: string;
}

export interface IAIService {
  ask(
    prompt: string,
    context: AISchoolContext,
    conversationHistory?: AIChatMessage[]
  ): Promise<AIResponse>;
  checkHealth?(forceRefresh?: boolean): Promise<AIHealthStatus>;
}

