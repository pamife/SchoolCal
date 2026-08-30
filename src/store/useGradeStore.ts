import { create } from 'zustand';
import type { Grade } from '../types';
import {
  fetchUserCollection,
  saveUserDoc,
  updateUserDoc,
  deleteUserDoc,
} from '../services/firebase/firestoreService';

interface GradeState {
  grades: Grade[];
  isLoading: boolean;

  loadGrades: (uid: string) => Promise<void>;
  addGrade: (uid: string, grade: Grade) => Promise<void>;
  updateGrade: (uid: string, id: string, updates: Partial<Grade>) => Promise<void>;
  deleteGrade: (uid: string, id: string) => Promise<void>;
  clearGrades: () => void;
}

export const useGradeStore = create<GradeState>((set, get) => ({
  grades: [],
  isLoading: false,

  loadGrades: async (uid: string) => {
    if (!uid) {
      set({ grades: [], isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const data = await fetchUserCollection<Grade>(uid, 'grades');
      set({ grades: data, isLoading: false });
    } catch (err) {
      console.warn('Error loading grades from Firestore:', err);
      set({ grades: [], isLoading: false });
    }
  },

  addGrade: async (uid: string, grade: Grade) => {
    // Optimistic instant UI update
    set((state) => ({ grades: [grade, ...state.grades] }));
    if (uid) {
      try {
        await saveUserDoc(uid, 'grades', grade);
      } catch (err) {
        console.error('Error saving grade to Firestore:', err);
      }
    }
  },

  updateGrade: async (uid: string, id: string, updates: Partial<Grade>) => {
    set((state) => ({
      grades: state.grades.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
    if (uid) {
      try {
        await updateUserDoc(uid, 'grades', id, updates);
      } catch (err) {
        console.error('Error updating grade in Firestore:', err);
      }
    }
  },

  deleteGrade: async (uid: string, id: string) => {
    set((state) => ({ grades: state.grades.filter((g) => g.id !== id) }));
    if (uid) {
      try {
        await deleteUserDoc(uid, 'grades', id);
      } catch (err) {
        console.error('Error deleting grade in Firestore:', err);
      }
    }
  },

  clearGrades: () => set({ grades: [] }),
}));
