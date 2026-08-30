import { create } from 'zustand';
import type { Exam } from '../types';
import { LocalStorageRepository } from '../services/repository/LocalStorageRepository';
import { MOCK_EXAMS } from '../data/mockData';

const examsRepo = new LocalStorageRepository<Exam>('exams', MOCK_EXAMS);

interface ExamState {
  exams: Exam[];
  isLoading: boolean;

  loadExams: () => Promise<void>;
  addExam: (exam: Exam) => Promise<void>;
  updateExam: (id: string, updates: Partial<Exam>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  toggleExamTopic: (examId: string, topicId: string) => Promise<void>;
  updateStudyProgress: (examId: string, progress: number) => Promise<void>;
  resetToDefault: () => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  exams: [],
  isLoading: true,

  loadExams: async () => {
    set({ isLoading: true });
    const items = await examsRepo.getAll();
    items.sort((a, b) => a.date.localeCompare(b.date));
    set({ exams: items, isLoading: false });
  },

  addExam: async (exam) => {
    await examsRepo.create(exam);
    const updated = [...get().exams, exam].sort((a, b) => a.date.localeCompare(b.date));
    set({ exams: updated });
  },

  updateExam: async (id, updates) => {
    await examsRepo.update(id, updates);
    const updated = get().exams.map(e => (e.id === id ? { ...e, ...updates } : e))
      .sort((a, b) => a.date.localeCompare(b.date));
    set({ exams: updated });
  },

  deleteExam: async (id) => {
    await examsRepo.delete(id);
    set({ exams: get().exams.filter(e => e.id !== id) });
  },

  toggleExamTopic: async (examId, topicId) => {
    const exam = get().exams.find(e => e.id === examId);
    if (!exam) return;

    const newTopics = exam.topics.map(t =>
      t.id === topicId ? { ...t, completed: !t.completed } : t
    );

    const completedCount = newTopics.filter(t => t.completed).length;
    const calculatedProgress = newTopics.length > 0
      ? Math.round((completedCount / newTopics.length) * 100)
      : exam.studyProgress;

    await get().updateExam(examId, {
      topics: newTopics,
      studyProgress: calculatedProgress,
    });
  },

  updateStudyProgress: async (examId, progress) => {
    await get().updateExam(examId, { studyProgress: Math.min(100, Math.max(0, progress)) });
  },

  resetToDefault: () => {
    examsRepo.resetToDefault();
    set({ exams: MOCK_EXAMS });
  },
}));
