import { create } from 'zustand';
import type { Subject, Teacher, Room, ScheduleEntry, Substitution } from '../types';
import { LocalStorageRepository } from '../services/repository/LocalStorageRepository';
import {
  MOCK_SUBJECTS,
  MOCK_TEACHERS,
  MOCK_ROOMS,
  MOCK_SCHEDULE_ENTRIES,
  MOCK_SUBSTITUTIONS,
} from '../data/mockData';

const subjectsRepo = new LocalStorageRepository<Subject>('subjects', MOCK_SUBJECTS);
const teachersRepo = new LocalStorageRepository<Teacher>('teachers', MOCK_TEACHERS);
const roomsRepo = new LocalStorageRepository<Room>('rooms', MOCK_ROOMS);
const scheduleRepo = new LocalStorageRepository<ScheduleEntry>('schedule', MOCK_SCHEDULE_ENTRIES);
const substRepo = new LocalStorageRepository<Substitution>('substitutions', MOCK_SUBSTITUTIONS);

interface SchoolState {
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  scheduleEntries: ScheduleEntry[];
  substitutions: Substitution[];
  isLoading: boolean;

  loadSchoolData: () => Promise<void>;
  addSubject: (subject: Subject) => Promise<void>;
  updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addTeacher: (teacher: Teacher) => Promise<void>;
  updateTeacher: (id: string, updates: Partial<Teacher>) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  addRoom: (room: Room) => Promise<void>;
  updateRoom: (id: string, updates: Partial<Room>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  addScheduleEntry: (entry: ScheduleEntry) => Promise<void>;
  updateScheduleEntry: (id: string, updates: Partial<ScheduleEntry>) => Promise<void>;
  deleteScheduleEntry: (id: string) => Promise<void>;
  setScheduleEntries: (entries: ScheduleEntry[]) => Promise<void>;
  addSubstitution: (sub: Substitution) => Promise<void>;
  updateSubstitution: (id: string, updates: Partial<Substitution>) => Promise<void>;
  deleteSubstitution: (id: string) => Promise<void>;
  resetToDefault: () => void;
}

export const useSchoolStore = create<SchoolState>((set, get) => ({
  subjects: [],
  teachers: [],
  rooms: [],
  scheduleEntries: [],
  substitutions: [],
  isLoading: true,

  loadSchoolData: async () => {
    set({ isLoading: true });
    const [subjects, teachers, rooms, scheduleEntries, substitutions] = await Promise.all([
      subjectsRepo.getAll(),
      teachersRepo.getAll(),
      roomsRepo.getAll(),
      scheduleRepo.getAll(),
      substRepo.getAll(),
    ]);
    set({
      subjects,
      teachers,
      rooms,
      scheduleEntries,
      substitutions,
      isLoading: false,
    });
  },

  addSubject: async (subject) => {
    await subjectsRepo.create(subject);
    set({ subjects: [...get().subjects, subject] });
  },

  updateSubject: async (id, updates) => {
    await subjectsRepo.update(id, updates);
    set({
      subjects: get().subjects.map(s => (s.id === id ? { ...s, ...updates } : s)),
    });
  },

  deleteSubject: async (id) => {
    await subjectsRepo.delete(id);
    set({
      subjects: get().subjects.filter(s => s.id !== id),
      scheduleEntries: get().scheduleEntries.filter(e => e.subjectId !== id),
    });
  },

  addTeacher: async (teacher) => {
    await teachersRepo.create(teacher);
    set({ teachers: [...get().teachers, teacher] });
  },

  updateTeacher: async (id, updates) => {
    await teachersRepo.update(id, updates);
    set({
      teachers: get().teachers.map(t => (t.id === id ? { ...t, ...updates } : t)),
    });
  },

  deleteTeacher: async (id) => {
    await teachersRepo.delete(id);
    set({ teachers: get().teachers.filter(t => t.id !== id) });
  },

  addRoom: async (room) => {
    await roomsRepo.create(room);
    set({ rooms: [...get().rooms, room] });
  },

  updateRoom: async (id, updates) => {
    await roomsRepo.update(id, updates);
    set({
      rooms: get().rooms.map(r => (r.id === id ? { ...r, ...updates } : r)),
    });
  },

  deleteRoom: async (id) => {
    await roomsRepo.delete(id);
    set({ rooms: get().rooms.filter(r => r.id !== id) });
  },

  addScheduleEntry: async (entry) => {
    await scheduleRepo.create(entry);
    set({ scheduleEntries: [...get().scheduleEntries, entry] });
  },

  updateScheduleEntry: async (id, updates) => {
    await scheduleRepo.update(id, updates);
    set({
      scheduleEntries: get().scheduleEntries.map(e => (e.id === id ? { ...e, ...updates } : e)),
    });
  },

  deleteScheduleEntry: async (id) => {
    await scheduleRepo.delete(id);
    set({
      scheduleEntries: get().scheduleEntries.filter(e => e.id !== id),
    });
  },

  setScheduleEntries: async (entries) => {
    await scheduleRepo.saveAll(entries);
    set({ scheduleEntries: entries });
  },

  addSubstitution: async (sub) => {
    await substRepo.create(sub);
    set({ substitutions: [...get().substitutions, sub] });
  },

  updateSubstitution: async (id, updates) => {
    await substRepo.update(id, updates);
    set({
      substitutions: get().substitutions.map(s => (s.id === id ? { ...s, ...updates } : s)),
    });
  },

  deleteSubstitution: async (id) => {
    await substRepo.delete(id);
    set({
      substitutions: get().substitutions.filter(s => s.id !== id),
    });
  },

  resetToDefault: () => {
    subjectsRepo.resetToDefault();
    teachersRepo.resetToDefault();
    roomsRepo.resetToDefault();
    scheduleRepo.resetToDefault();
    substRepo.resetToDefault();
    set({
      subjects: MOCK_SUBJECTS,
      teachers: MOCK_TEACHERS,
      rooms: MOCK_ROOMS,
      scheduleEntries: MOCK_SCHEDULE_ENTRIES,
      substitutions: MOCK_SUBSTITUTIONS,
    });
  },
}));
