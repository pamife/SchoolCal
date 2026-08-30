import { create } from 'zustand';
import type { CalendarEvent, CalendarViewType } from '../types';
import {
  fetchUserCollection,
  saveUserDoc,
  updateUserDoc,
  deleteUserDoc,
} from '../services/firebase/firestoreService';
import { addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns';

interface CalendarState {
  events: CalendarEvent[];
  selectedDate: Date;
  viewType: CalendarViewType;
  isLoading: boolean;

  loadEvents: (uid: string) => Promise<void>;
  clearEvents: () => void;
  addEvent: (uid: string, event: CalendarEvent) => Promise<void>;
  updateEvent: (uid: string, id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (uid: string, id: string) => Promise<void>;
  
  setSelectedDate: (date: Date) => void;
  setViewType: (view: CalendarViewType) => void;
  goToToday: () => void;
  goToNext: () => void;
  goToPrevious: () => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  selectedDate: new Date(),
  viewType: 'week',
  isLoading: false,

  loadEvents: async (uid: string) => {
    if (!uid) return;
    set({ isLoading: true });
    try {
      const items = await fetchUserCollection<CalendarEvent>(uid, 'events');
      set({ events: items, isLoading: false });
    } catch (err) {
      console.error('Error loading events from Firestore:', err);
      set({ isLoading: false });
    }
  },

  clearEvents: () => {
    set({ events: [], selectedDate: new Date(), isLoading: false });
  },

  addEvent: async (uid, event) => {
    set({ events: [...get().events, event] });
    if (uid) {
      await saveUserDoc<CalendarEvent>(uid, 'events', event);
    }
  },

  updateEvent: async (uid, id, updates) => {
    set({
      events: get().events.map(e => (e.id === id ? { ...e, ...updates } : e)),
    });
    if (uid) {
      await updateUserDoc<CalendarEvent>(uid, 'events', id, updates);
    }
  },

  deleteEvent: async (uid, id) => {
    set({ events: get().events.filter(e => e.id !== id) });
    if (uid) {
      await deleteUserDoc(uid, 'events', id);
    }
  },

  setSelectedDate: (date) => {
    set({ selectedDate: date });
  },

  setViewType: (viewType) => {
    set({ viewType });
  },

  goToToday: () => {
    set({ selectedDate: new Date() });
  },

  goToNext: () => {
    const { selectedDate, viewType } = get();
    switch (viewType) {
      case 'day':
        set({ selectedDate: addDays(selectedDate, 1) });
        break;
      case '3days':
        set({ selectedDate: addDays(selectedDate, 3) });
        break;
      case 'week':
        set({ selectedDate: addWeeks(selectedDate, 1) });
        break;
      case 'month':
        set({ selectedDate: addMonths(selectedDate, 1) });
        break;
    }
  },

  goToPrevious: () => {
    const { selectedDate, viewType } = get();
    switch (viewType) {
      case 'day':
        set({ selectedDate: subDays(selectedDate, 1) });
        break;
      case '3days':
        set({ selectedDate: subDays(selectedDate, 3) });
        break;
      case 'week':
        set({ selectedDate: subWeeks(selectedDate, 1) });
        break;
      case 'month':
        set({ selectedDate: subMonths(selectedDate, 1) });
        break;
    }
  },
}));
