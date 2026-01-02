"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useStore } from "zustand";
import {
  createWishlistStore,
  type WishlistStore,
  type WishlistState,
  defaultWishlistState,
} from "./wishlist-store";

export type WishlistStoreApi = ReturnType<typeof createWishlistStore>;

const WishlistStoreContext = createContext<WishlistStoreApi | undefined>(undefined);

interface WishlistStoreProviderProps {
  children: ReactNode;
  initialState?: WishlistState;
}

export const WishlistStoreProvider = ({
  children,
  initialState,
}: WishlistStoreProviderProps) => {
  const storeRef = useRef<WishlistStoreApi | null>(null);

  if (storeRef.current === null) {
    storeRef.current = createWishlistStore(initialState ?? defaultWishlistState);
  }

  useEffect(() => {
    storeRef.current?.persist.rehydrate();
  }, []);

  return (
    <WishlistStoreContext.Provider value={storeRef.current}>
      {children}
    </WishlistStoreContext.Provider>
  );
};

export const useWishlistStore = <T,>(
  selector: (store: WishlistStore) => T
): T => {
  const wishlistStoreContext = useContext(WishlistStoreContext);
  if (!wishlistStoreContext) {
    throw new Error("useWishlistStore must be used within WishlistStoreProvider");
  }
  return useStore(wishlistStoreContext, selector);
};

export const useWishlistItems = () => useWishlistStore((state) => state.items);
export const useWishlistIsOpen = () =>
  useWishlistStore((state) => state.isOpen);
export const useWishlistActions = () => {
  const addItem = useWishlistStore((state) => state.addItem);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const openWishlist = useWishlistStore((state) => state.openWishlist);
  const closeWishlist = useWishlistStore((state) => state.closeWishlist);

  return { addItem, removeItem, toggleItem, openWishlist, closeWishlist };
};
