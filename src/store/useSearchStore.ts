import { create } from 'zustand';

interface SearchState {
  isOpen: boolean;
  query: string;
  openSearch: (initialQuery?: string) => void;
  closeSearch: () => void;
  setQuery: (query: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  isOpen: false,
  query: '',
  openSearch: (initialQuery = '') => set({ isOpen: true, query: initialQuery }),
  closeSearch: () => set({ isOpen: false, query: '' }),
  setQuery: (query) => set({ query }),
}));
