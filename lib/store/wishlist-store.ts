import { createStore } from "zustand/vanilla";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  slug?: string;
}

export interface WishlistState {
  items: WishlistItem[];
  isOpen: boolean;
}

export interface WishlistActions {
  addItem: (item: WishlistItem) => void;
  removeItem: (itemId: string) => void;
  toggleItem: (item: WishlistItem) => void;
  openWishlist: () => void;
  closeWishlist: () => void;
}

export type WishlistStore = WishlistState & WishlistActions;

export const defaultWishlistState: WishlistState = {
  items: [],
  isOpen: false,
};

export const createWishlistStore = (
  initState: WishlistState = defaultWishlistState
) => {
  return createStore<WishlistStore>()(
    persist(
      (set) => ({
        ...initState,
        addItem: (item) =>
          set((state) => {
            if (state.items.find((existing) => existing.id === item.id)) {
              return state;
            }
            return { items: [...state.items, item] };
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
            return { items: [...state.items, item] };
          }),
        openWishlist: () => set({ isOpen: true }),
        closeWishlist: () => set({ isOpen: false }),
      }),
      {
        name: "wishlist-storage",
        version: 1,
        skipHydration: true,
        partialize: (state) => ({ items: state.items }),
      }
    )
  );
};
