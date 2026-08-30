import { create } from 'zustand';
import type { UserProfile } from '../types';
import { MOCK_USER } from '../data/mockData';
import { isFirebaseConfigured } from '../services/firebase/config';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isFirebaseActive: boolean;
  isLoading: boolean;

  loginMock: (name?: string, email?: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  deleteAccountAndData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: MOCK_USER,
  isAuthenticated: true,
  isFirebaseActive: isFirebaseConfigured(),
  isLoading: false,

  loginMock: (name = 'Paul Schmidt', email = 'paul.schmidt@schueler-mail.de') => {
    const user: UserProfile = {
      uid: 'user-' + Date.now(),
      displayName: name,
      email: email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: (updates) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates, updatedAt: new Date().toISOString() };
    set({ user: updated });
  },

  deleteAccountAndData: async () => {
    const keysToRemove = [
      'schoolcal_subjects',
      'schoolcal_teachers',
      'schoolcal_rooms',
      'schoolcal_schedule',
      'schoolcal_substitutions',
      'schoolcal_homework',
      'schoolcal_exams',
      'schoolcal_calendar_events',
      'schoolcal_user_settings',
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));
    set({ user: null, isAuthenticated: false });
    window.location.reload();
  },
}));
