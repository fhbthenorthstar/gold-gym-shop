import { createStore } from "zustand/vanilla";
import { persist } from "zustand/middleware";

// Types
export interface CartItemVariant {
  sku?: string;
  options?: { name: string; value: string }[];
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: CartItemVariant;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

export interface CartActions {
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export type CartStore = CartState & CartActions;

// Default state
export const defaultInitState: CartState = {
  items: [],
  isOpen: false,
};

const migrateCartItems = (items: CartItem[] = []): CartItem[] => {
  return items.map((item) => ({
    ...item,
    id: item.id || item.productId,
  }));
};

/**
 * Cart store factory - creates new store instance per provider
 * Uses persist middleware with skipHydration for Next.js SSR compatibility
 * @see https://zustand.docs.pmnd.rs/guides/nextjs#hydration-and-asynchronous-storages
 */
export const createCartStore = (initState: CartState = defaultInitState) => {
  return createStore<CartStore>()(
    persist(
      (set) => ({
        ...initState,

        addItem: (item, quantity = 1) =>
          set((state) => {
            const existing = state.items.find((i) => i.id === item.id);
            if (existing) {
              return {
                items: state.items.map((i) =>
                  i.id === item.id
                    ? { ...i, quantity: i.quantity + quantity }
                    : i
                ),
              };
            }
            return { items: [...state.items, { ...item, quantity }] };
          }),

        removeItem: (itemId) =>
          set((state) => ({
            items: state.items.filter((i) => i.id !== itemId),
          })),

        updateQuantity: (itemId, quantity) =>
          set((state) => {
            if (quantity <= 0) {
              return {
                items: state.items.filter((i) => i.id !== itemId),
              };
            }
            return {
              items: state.items.map((i) =>
                i.id === itemId ? { ...i, quantity } : i
              ),
            };
          }),

        clearCart: () => set({ items: [] }),
        toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
        openCart: () => set({ isOpen: true }),
        closeCart: () => set({ isOpen: false }),
      }),
      {
        name: "cart-storage",
        version: 2,
        migrate: (state) => {
          if (!state || typeof state !== "object") return state as CartState;
          const nextState = state as CartState;
          return {
            ...nextState,
            items: migrateCartItems(nextState.items),
          };
        },
        // Skip automatic hydration - we'll trigger it manually on the client
        skipHydration: true,
        // Only persist items, not UI state like isOpen
        partialize: (state) => ({ items: state.items }),
      }
    )
  );
};
