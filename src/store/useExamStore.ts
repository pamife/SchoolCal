import { create } from 'zustand';
import type { Exam } from '../types';
import {
  fetchUserCollection,
  saveUserDoc,
  updateUserDoc,
  deleteUserDoc,
} from '../services/firebase/firestoreService';

interface ExamState {
  exams: Exam[];
  isLoading: boolean;

  loadExams: (uid: string) => Promise<void>;
  clearExams: () => void;
  addExam: (uid: string, exam: Exam) => Promise<void>;
  updateExam: (uid: string, id: string, updates: Partial<Exam>) => Promise<void>;
  deleteExam: (uid: string, id: string) => Promise<void>;
  toggleExamTopic: (uid: string, examId: string, topicId: string) => Promise<void>;
  updateStudyProgress: (uid: string, examId: string, progress: number) => Promise<void>;
}

export const useExamStore = create<ExamState>((set, get) => ({
  exams: [],
  isLoading: false,

  loadExams: async (uid: string) => {
    if (!uid) return;
    set({ isLoading: true });
    try {
      const items = await fetchUserCollection<Exam>(uid, 'exams');
      items.sort((a, b) => a.date.localeCompare(b.date));
      set({ exams: items, isLoading: false });
    } catch (err) {
      console.error('Error loading exams from Firestore:', err);
      set({ isLoading: false });
    }
  },

  clearExams: () => {
    set({ exams: [], isLoading: false });
  },

  addExam: async (uid, exam) => {
    const updated = [...get().exams, exam].sort((a, b) => a.date.localeCompare(b.date));
    set({ exams: updated });
    if (uid) {
      await saveUserDoc<Exam>(uid, 'exams', exam);
    }
  },

  updateExam: async (uid, id, updates) => {
    const updated = get().exams.map(e => (e.id === id ? { ...e, ...updates } : e))
      .sort((a, b) => a.date.localeCompare(b.date));
    set({ exams: updated });
    if (uid) {
      await updateUserDoc<Exam>(uid, 'exams', id, updates);
    }
  },

  deleteExam: async (uid, id) => {
    set({ exams: get().exams.filter(e => e.id !== id) });
    if (uid) {
      await deleteUserDoc(uid, 'exams', id);
    }
  },

  toggleExamTopic: async (uid, examId, topicId) => {
    const exam = get().exams.find(e => e.id === examId);
    if (!exam) return;

    const newTopics = exam.topics.map(t =>
      t.id === topicId ? { ...t, completed: !t.completed } : t
    );

    const completedCount = newTopics.filter(t => t.completed).length;
    const calculatedProgress = newTopics.length > 0
      ? Math.round((completedCount / newTopics.length) * 100)
      : exam.studyProgress;

    await get().updateExam(uid, examId, {
      topics: newTopics,
      studyProgress: calculatedProgress,
    });
  },

  updateStudyProgress: async (uid, examId, progress) => {
    await get().updateExam(uid, examId, { studyProgress: Math.min(100, Math.max(0, progress)) });
  },
}));
