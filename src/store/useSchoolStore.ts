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
    await saveUserDoc<Subject>(uid, 'subjects', subject);
    set({ subjects: [...get().subjects, subject] });
  },

  updateSubject: async (uid, id, updates) => {
    await updateUserDoc<Subject>(uid, 'subjects', id, updates);
    set({
      subjects: get().subjects.map(s => (s.id === id ? { ...s, ...updates } : s)),
    });
  },

  deleteSubject: async (uid, id) => {
    await deleteUserDoc(uid, 'subjects', id);
    set({
      subjects: get().subjects.filter(s => s.id !== id),
      scheduleEntries: get().scheduleEntries.filter(e => e.subjectId !== id),
    });
  },

  addTeacher: async (uid, teacher) => {
    await saveUserDoc<Teacher>(uid, 'teachers', teacher);
    set({ teachers: [...get().teachers, teacher] });
  },

  updateTeacher: async (uid, id, updates) => {
    await updateUserDoc<Teacher>(uid, 'teachers', id, updates);
    set({
      teachers: get().teachers.map(t => (t.id === id ? { ...t, ...updates } : t)),
    });
  },

  deleteTeacher: async (uid, id) => {
    await deleteUserDoc(uid, 'teachers', id);
    set({ teachers: get().teachers.filter(t => t.id !== id) });
  },

  addRoom: async (uid, room) => {
    await saveUserDoc<Room>(uid, 'rooms', room);
    set({ rooms: [...get().rooms, room] });
  },

  updateRoom: async (uid, id, updates) => {
    await updateUserDoc<Room>(uid, 'rooms', id, updates);
    set({
      rooms: get().rooms.map(r => (r.id === id ? { ...r, ...updates } : r)),
    });
  },

  deleteRoom: async (uid, id) => {
    await deleteUserDoc(uid, 'rooms', id);
    set({ rooms: get().rooms.filter(r => r.id !== id) });
  },

  addScheduleEntry: async (uid, entry) => {
    await saveUserDoc<ScheduleEntry>(uid, 'schedule', entry);
    set({ scheduleEntries: [...get().scheduleEntries, entry] });
  },

  updateScheduleEntry: async (uid, id, updates) => {
    await updateUserDoc<ScheduleEntry>(uid, 'schedule', id, updates);
    set({
      scheduleEntries: get().scheduleEntries.map(e => (e.id === id ? { ...e, ...updates } : e)),
    });
  },

  deleteScheduleEntry: async (uid, id) => {
    await deleteUserDoc(uid, 'schedule', id);
    set({
      scheduleEntries: get().scheduleEntries.filter(e => e.id !== id),
    });
  },

  setScheduleEntries: async (uid, entries) => {
    await saveAllUserDocs<ScheduleEntry>(uid, 'schedule', entries);
    set({ scheduleEntries: entries });
  },

  addSubstitution: async (uid, sub) => {
    await saveUserDoc<Substitution>(uid, 'substitutions', sub);
    set({ substitutions: [...get().substitutions, sub] });
  },

  updateSubstitution: async (uid, id, updates) => {
    await updateUserDoc<Substitution>(uid, 'substitutions', id, updates);
    set({
      substitutions: get().substitutions.map(s => (s.id === id ? { ...s, ...updates } : s)),
    });
  },

  deleteSubstitution: async (uid, id) => {
    await deleteUserDoc(uid, 'substitutions', id);
    set({
      substitutions: get().substitutions.filter(s => s.id !== id),
    });
  },
}));
