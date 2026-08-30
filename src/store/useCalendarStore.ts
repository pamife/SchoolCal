import { create } from 'zustand';
import type { CalendarEvent, CalendarViewType } from '../types';
import { LocalStorageRepository } from '../services/repository/LocalStorageRepository';
import { MOCK_CALENDAR_EVENTS } from '../data/mockData';
import { addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns';

const eventsRepo = new LocalStorageRepository<CalendarEvent>('calendar_events', MOCK_CALENDAR_EVENTS);

interface CalendarState {
  events: CalendarEvent[];
  selectedDate: Date;
  viewType: CalendarViewType;
  isLoading: boolean;

  loadEvents: () => Promise<void>;
  addEvent: (event: CalendarEvent) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  
  setSelectedDate: (date: Date) => void;
  setViewType: (view: CalendarViewType) => void;
  goToToday: () => void;
  goToNext: () => void;
  goToPrevious: () => void;
  resetToDefault: () => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  selectedDate: new Date(),
  viewType: 'week',
  isLoading: true,

  loadEvents: async () => {
    set({ isLoading: true });
    const items = await eventsRepo.getAll();
    set({ events: items, isLoading: false });
  },

  addEvent: async (event) => {
    await eventsRepo.create(event);
    set({ events: [...get().events, event] });
  },

  updateEvent: async (id, updates) => {
    await eventsRepo.update(id, updates);
    set({
      events: get().events.map(e => (e.id === id ? { ...e, ...updates } : e)),
    });
  },

  deleteEvent: async (id) => {
    await eventsRepo.delete(id);
    set({ events: get().events.filter(e => e.id !== id) });
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

  resetToDefault: () => {
    eventsRepo.resetToDefault();
    set({ events: MOCK_CALENDAR_EVENTS, selectedDate: new Date() });
  },
}));
