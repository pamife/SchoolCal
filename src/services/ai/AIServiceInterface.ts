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
}

export interface IAIService {
  ask(
    prompt: string,
    context: AISchoolContext,
    conversationHistory?: AIChatMessage[]
  ): Promise<AIResponse>;
}
