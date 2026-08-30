import { create } from 'zustand';
import type { Homework, PriorityLevel, TaskStatus } from '../types';
import { LocalStorageRepository } from '../services/repository/LocalStorageRepository';
import { MOCK_HOMEWORK } from '../data/mockData';
import confetti from 'canvas-confetti';

const homeworkRepo = new LocalStorageRepository<Homework>('homework', MOCK_HOMEWORK);

interface HomeworkFilter {
  status: 'all' | 'todo' | 'in_progress' | 'done';
  subjectId: string | 'all';
  priority: PriorityLevel | 'all';
  dueFilter: 'all' | 'today' | 'tomorrow' | 'this_week' | 'overdue';
}

interface HomeworkState {
  homework: Homework[];
  isLoading: boolean;
  filter: HomeworkFilter;

  loadHomework: () => Promise<void>;
  addHomework: (item: Homework) => Promise<void>;
  updateHomework: (id: string, updates: Partial<Homework>) => Promise<void>;
  deleteHomework: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  setFilter: (filterUpdates: Partial<HomeworkFilter>) => void;
  resetFilter: () => void;
  resetToDefault: () => void;
}

export const useHomeworkStore = create<HomeworkState>((set, get) => ({
  homework: [],
  isLoading: true,
  filter: {
    status: 'all',
    subjectId: 'all',
    priority: 'all',
    dueFilter: 'all',
  },

  loadHomework: async () => {
    set({ isLoading: true });
    const items = await homeworkRepo.getAll();
    set({ homework: items, isLoading: false });
  },

  addHomework: async (item) => {
    await homeworkRepo.create(item);
    set({ homework: [item, ...get().homework] });
  },

  updateHomework: async (id, updates) => {
    await homeworkRepo.update(id, updates);
    set({
      homework: get().homework.map(h => (h.id === id ? { ...h, ...updates } : h)),
    });
  },

  deleteHomework: async (id) => {
    await homeworkRepo.delete(id);
    set({ homework: get().homework.filter(h => h.id !== id) });
  },

  toggleComplete: async (id) => {
    const item = get().homework.find(h => h.id === id);
    if (!item) return;

    const newStatus: TaskStatus = item.status === 'done' ? 'todo' : 'done';
    const completedAt = newStatus === 'done' ? new Date().toISOString() : undefined;

    if (newStatus === 'done') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#007AFF', '#34C759', '#FF9500', '#AF52DE'],
        });
      } catch {
        // Fallback silently if canvas not available
      }
    }

    await get().updateHomework(id, { status: newStatus, completedAt });
  },

  setFilter: (filterUpdates) => {
    set({ filter: { ...get().filter, ...filterUpdates } });
  },

  resetFilter: () => {
    set({
      filter: {
        status: 'all',
        subjectId: 'all',
        priority: 'all',
        dueFilter: 'all',
      },
    });
  },

  resetToDefault: () => {
    homeworkRepo.resetToDefault();
    set({ homework: MOCK_HOMEWORK });
  },
}));
