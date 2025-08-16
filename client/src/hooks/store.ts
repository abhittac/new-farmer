// store/useCategory.ts
import { create } from 'zustand';

type CategoryState = {
  category: string | null;
  setCategory: (value: string) => void;
};

export const useCategory = create<CategoryState>((set) => ({
  category: null,
  setCategory: (value) => set({ category: value }),
}));

