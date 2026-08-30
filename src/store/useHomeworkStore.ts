import { create } from 'zustand';
import type { Homework, PriorityLevel, TaskStatus } from '../types';
import {
  fetchUserCollection,
  saveUserDoc,
  updateUserDoc,
  deleteUserDoc,
} from '../services/firebase/firestoreService';
import confetti from 'canvas-confetti';

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

  loadHomework: (uid: string) => Promise<void>;
  clearHomework: () => void;
  addHomework: (uid: string, item: Homework) => Promise<void>;
  updateHomework: (uid: string, id: string, updates: Partial<Homework>) => Promise<void>;
  deleteHomework: (uid: string, id: string) => Promise<void>;
  toggleComplete: (uid: string, id: string) => Promise<void>;
  setFilter: (filterUpdates: Partial<HomeworkFilter>) => void;
  resetFilter: () => void;
}

export const useHomeworkStore = create<HomeworkState>((set, get) => ({
  homework: [],
  isLoading: false,
  filter: {
    status: 'all',
    subjectId: 'all',
    priority: 'all',
    dueFilter: 'all',
  },

  loadHomework: async (uid: string) => {
    if (!uid) return;
    set({ isLoading: true });
    try {
      const items = await fetchUserCollection<Homework>(uid, 'homework');
      set({ homework: items, isLoading: false });
    } catch (err) {
      console.error('Error loading homework from Firestore:', err);
      set({ isLoading: false });
    }
  },

  clearHomework: () => {
    set({ homework: [], isLoading: false });
  },

  addHomework: async (uid, item) => {
    set({ homework: [item, ...get().homework] });
    if (uid) {
      await saveUserDoc<Homework>(uid, 'homework', item);
    }
  },

  updateHomework: async (uid, id, updates) => {
    set({
      homework: get().homework.map(h => (h.id === id ? { ...h, ...updates } : h)),
    });
    if (uid) {
      await updateUserDoc<Homework>(uid, 'homework', id, updates);
    }
  },

  deleteHomework: async (uid, id) => {
    set({ homework: get().homework.filter(h => h.id !== id) });
    if (uid) {
      await deleteUserDoc(uid, 'homework', id);
    }
  },

  toggleComplete: async (uid, id) => {
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
        // ignore
      }
    }

    await get().updateHomework(uid, id, { status: newStatus, completedAt });
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
}));
