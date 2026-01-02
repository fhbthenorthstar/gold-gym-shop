import { createStore } from "zustand/vanilla";
import { persist } from "zustand/middleware";

export interface CompareItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  slug?: string;
}

export interface CompareState {
  items: CompareItem[];
  isOpen: boolean;
}

export interface CompareActions {
  addItem: (item: CompareItem) => void;
  removeItem: (itemId: string) => void;
  toggleItem: (item: CompareItem) => void;
  openCompare: () => void;
  closeCompare: () => void;
}

export type CompareStore = CompareState & CompareActions;

export const defaultCompareState: CompareState = {
  items: [],
  isOpen: false,
};

const MAX_COMPARE_ITEMS = 4;

export const createCompareStore = (
  initState: CompareState = defaultCompareState
) => {
  return createStore<CompareStore>()(
    persist(
      (set) => ({
        ...initState,
        addItem: (item) =>
          set((state) => {
            if (state.items.find((existing) => existing.id === item.id)) {
              return state;
            }
            const nextItems = [...state.items, item].slice(-MAX_COMPARE_ITEMS);
            return { items: nextItems };
          }),
        removeItem: (itemId) =>
          set((state) => ({
            items: state.items.filter((item) => item.id !== itemId),
          })),
        toggleItem: (item) =>
          set((state) => {
            const exists = state.items.find((existing) => existing.id === item.id);
            if (exists) {
              return {
                items: state.items.filter((existing) => existing.id !== item.id),
              };
            }
            const nextItems = [...state.items, item].slice(-MAX_COMPARE_ITEMS);
            return { items: nextItems };
          }),
        openCompare: () => set({ isOpen: true }),
        closeCompare: () => set({ isOpen: false }),
      }),
      {
        name: "compare-storage",
        version: 1,
        skipHydration: true,
        partialize: (state) => ({ items: state.items }),
      }
    )
  );
};
