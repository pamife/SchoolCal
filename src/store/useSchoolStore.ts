import { create } from 'zustand';
import type { Subject, Teacher, Room, ScheduleEntry, Substitution } from '../types';
import {
  fetchUserCollection,
  saveUserDoc,
  updateUserDoc,
  deleteUserDoc,
  saveAllUserDocs,
} from '../services/firebase/firestoreService';

interface SchoolState {
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  scheduleEntries: ScheduleEntry[];
  substitutions: Substitution[];
  isLoading: boolean;

  loadSchoolData: (uid: string) => Promise<void>;
  clearSchoolData: () => void;

  // Subject operations
  addSubject: (uid: string, subject: Subject) => Promise<void>;
  updateSubject: (uid: string, id: string, updates: Partial<Subject>) => Promise<void>;
  deleteSubject: (uid: string, id: string) => Promise<void>;

  // Teacher operations
  addTeacher: (uid: string, teacher: Teacher) => Promise<void>;
  updateTeacher: (uid: string, id: string, updates: Partial<Teacher>) => Promise<void>;
  deleteTeacher: (uid: string, id: string) => Promise<void>;

  // Room operations
  addRoom: (uid: string, room: Room) => Promise<void>;
  updateRoom: (uid: string, id: string, updates: Partial<Room>) => Promise<void>;
  deleteRoom: (uid: string, id: string) => Promise<void>;

  // Schedule operations
  addScheduleEntry: (uid: string, entry: ScheduleEntry) => Promise<void>;
  updateScheduleEntry: (uid: string, id: string, updates: Partial<ScheduleEntry>) => Promise<void>;
  deleteScheduleEntry: (uid: string, id: string) => Promise<void>;
  setScheduleEntries: (uid: string, entries: ScheduleEntry[]) => Promise<void>;

  // Substitution operations
  addSubstitution: (uid: string, sub: Substitution) => Promise<void>;
  updateSubstitution: (uid: string, id: string, updates: Partial<Substitution>) => Promise<void>;
  deleteSubstitution: (uid: string, id: string) => Promise<void>;
}

export const useSchoolStore = create<SchoolState>((set, get) => ({
  subjects: [],
  teachers: [],
  rooms: [],
  scheduleEntries: [],
  substitutions: [],
  isLoading: false,

  loadSchoolData: async (uid: string) => {
    if (!uid) return;
    set({ isLoading: true });
    try {
      const [subjects, teachers, rooms, scheduleEntries, substitutions] = await Promise.all([
        fetchUserCollection<Subject>(uid, 'subjects'),
        fetchUserCollection<Teacher>(uid, 'teachers'),
        fetchUserCollection<Room>(uid, 'rooms'),
        fetchUserCollection<ScheduleEntry>(uid, 'schedule'),
        fetchUserCollection<Substitution>(uid, 'substitutions'),
      ]);
      set({
        subjects,
        teachers,
        rooms,
        scheduleEntries,
        substitutions,
        isLoading: false,
      });
    } catch (err) {
      console.error('Error loading school data from Firestore:', err);
      set({ isLoading: false });
    }
  },

  clearSchoolData: () => {
    set({
      subjects: [],
      teachers: [],
      rooms: [],
      scheduleEntries: [],
      substitutions: [],
      isLoading: false,
    });
  },

  addSubject: async (uid, subject) => {
    // Instant UI update
    set({ subjects: [...get().subjects, subject] });
    if (uid) {
      await saveUserDoc<Subject>(uid, 'subjects', subject);
    }
  },

  updateSubject: async (uid, id, updates) => {
    set({
      subjects: get().subjects.map(s => (s.id === id ? { ...s, ...updates } : s)),
    });
    if (uid) {
      await updateUserDoc<Subject>(uid, 'subjects', id, updates);
    }
  },

  deleteSubject: async (uid, id) => {
    set({
      subjects: get().subjects.filter(s => s.id !== id),
      scheduleEntries: get().scheduleEntries.filter(e => e.subjectId !== id),
    });
    if (uid) {
      await deleteUserDoc(uid, 'subjects', id);
    }
  },

  addTeacher: async (uid, teacher) => {
    set({ teachers: [...get().teachers, teacher] });
    if (uid) {
      await saveUserDoc<Teacher>(uid, 'teachers', teacher);
    }
  },

  updateTeacher: async (uid, id, updates) => {
    set({
      teachers: get().teachers.map(t => (t.id === id ? { ...t, ...updates } : t)),
    });
    if (uid) {
      await updateUserDoc<Teacher>(uid, 'teachers', id, updates);
    }
  },

  deleteTeacher: async (uid, id) => {
    set({ teachers: get().teachers.filter(t => t.id !== id) });
    if (uid) {
      await deleteUserDoc(uid, 'teachers', id);
    }
  },

  addRoom: async (uid, room) => {
    set({ rooms: [...get().rooms, room] });
    if (uid) {
      await saveUserDoc<Room>(uid, 'rooms', room);
    }
  },

  updateRoom: async (uid, id, updates) => {
    set({
      rooms: get().rooms.map(r => (r.id === id ? { ...r, ...updates } : r)),
    });
    if (uid) {
      await updateUserDoc<Room>(uid, 'rooms', id, updates);
    }
  },

  deleteRoom: async (uid, id) => {
    set({ rooms: get().rooms.filter(r => r.id !== id) });
    if (uid) {
      await deleteUserDoc(uid, 'rooms', id);
    }
  },

  addScheduleEntry: async (uid, entry) => {
    set({ scheduleEntries: [...get().scheduleEntries, entry] });
    if (uid) {
      await saveUserDoc<ScheduleEntry>(uid, 'schedule', entry);
    }
  },

  updateScheduleEntry: async (uid, id, updates) => {
    set({
      scheduleEntries: get().scheduleEntries.map(e => (e.id === id ? { ...e, ...updates } : e)),
    });
    if (uid) {
      await updateUserDoc<ScheduleEntry>(uid, 'schedule', id, updates);
    }
  },

  deleteScheduleEntry: async (uid, id) => {
    set({
      scheduleEntries: get().scheduleEntries.filter(e => e.id !== id),
    });
    if (uid) {
      await deleteUserDoc(uid, 'schedule', id);
    }
  },

  setScheduleEntries: async (uid, entries) => {
    set({ scheduleEntries: entries });
    if (uid) {
      await saveAllUserDocs<ScheduleEntry>(uid, 'schedule', entries);
    }
  },

  addSubstitution: async (uid, sub) => {
    set({ substitutions: [...get().substitutions, sub] });
    if (uid) {
      await saveUserDoc<Substitution>(uid, 'substitutions', sub);
    }
  },

  updateSubstitution: async (uid, id, updates) => {
    set({
      substitutions: get().substitutions.map(s => (s.id === id ? { ...s, ...updates } : s)),
    });
    if (uid) {
      await updateUserDoc<Substitution>(uid, 'substitutions', id, updates);
    }
  },

  deleteSubstitution: async (uid, id) => {
    set({
      substitutions: get().substitutions.filter(s => s.id !== id),
    });
    if (uid) {
      await deleteUserDoc(uid, 'substitutions', id);
    }
  },
}));
