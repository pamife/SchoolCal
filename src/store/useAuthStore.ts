import { create } from 'zustand';
import type { UserProfile } from '../types';
import { logoutUser, subscribeToAuthState } from '../services/firebase/authService';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase/firebaseApp';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: UserProfile | null) => void;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  deleteAccountAndData: () => Promise<void>;
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
    if (currentUser?.uid) {
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid));
      } catch (err) {
        console.error('Error deleting user profile:', err);
      }
    }
    await get().logout();
  },

  initAuthListener: () => {
    return subscribeToAuthState((profile) => {
      set({ user: profile, isAuthenticated: Boolean(profile), isLoading: false });
    });
  },
}));
