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
  createCompareStore,
  type CompareStore,
  type CompareState,
  defaultCompareState,
} from "./compare-store";

export type CompareStoreApi = ReturnType<typeof createCompareStore>;

const CompareStoreContext = createContext<CompareStoreApi | undefined>(undefined);

interface CompareStoreProviderProps {
  children: ReactNode;
  initialState?: CompareState;
}

export const CompareStoreProvider = ({
  children,
  initialState,
}: CompareStoreProviderProps) => {
  const storeRef = useRef<CompareStoreApi | null>(null);

  if (storeRef.current === null) {
    storeRef.current = createCompareStore(initialState ?? defaultCompareState);
  }

  useEffect(() => {
    storeRef.current?.persist.rehydrate();
  }, []);

  return (
    <CompareStoreContext.Provider value={storeRef.current}>
      {children}
    </CompareStoreContext.Provider>
  );
};

export const useCompareStore = <T,>(
  selector: (store: CompareStore) => T
): T => {
  const compareStoreContext = useContext(CompareStoreContext);
  if (!compareStoreContext) {
    throw new Error("useCompareStore must be used within CompareStoreProvider");
  }
  return useStore(compareStoreContext, selector);
};

export const useCompareItems = () => useCompareStore((state) => state.items);
export const useCompareIsOpen = () => useCompareStore((state) => state.isOpen);
export const useCompareActions = () => {
  const addItem = useCompareStore((state) => state.addItem);
  const removeItem = useCompareStore((state) => state.removeItem);
  const toggleItem = useCompareStore((state) => state.toggleItem);
  const openCompare = useCompareStore((state) => state.openCompare);
  const closeCompare = useCompareStore((state) => state.closeCompare);

  return { addItem, removeItem, toggleItem, openCompare, closeCompare };
};
