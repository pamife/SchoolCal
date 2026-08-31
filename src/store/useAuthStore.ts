import { create } from 'zustand';
import type { UserProfile } from '../types';
import { logoutUser, subscribeToAuthState } from '../services/firebase/authService';
import { deleteEntireAccountAndData, DeletionResult } from '../services/account/accountDeletionService';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: UserProfile | null) => void;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  deleteAccountAndData: () => Promise<DeletionResult>;
  initAuthListener: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => {
    set({ user, isAuthenticated: Boolean(user), isLoading: false });
  },

  logout: async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    }

    // Clean up local session data on logout (GDPR hygiene on shared devices)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const keysToClear = ['schoolcal_gemini_api_key', 'schoolcal_user_settings'];
        keysToClear.forEach(k => localStorage.removeItem(k));
      } catch {
        // ignore
      }
    }

    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  updateProfile: (updates) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates, updatedAt: new Date().toISOString() };
    set({ user: updated });
  },

  deleteAccountAndData: async () => {
    const currentUser = get().user;
    const result = await deleteEntireAccountAndData(currentUser);
    await get().logout();
    return result;
  },

  initAuthListener: () => {
    return subscribeToAuthState((profile) => {
      set({ user: profile, isAuthenticated: Boolean(profile), isLoading: false });
    });
  },
}));
