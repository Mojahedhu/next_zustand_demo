"use client";
import { createContext, useContext, useRef } from "react";

import { AppStore, createAppStore, StoreState } from "./store";
import { useStore as useZustandStore } from "zustand";

// 1. Create the React Context
const StoreContext = createContext<AppStore | null>(null);

interface StoreProviderProps {
  children: React.ReactNode;
  initialState?: Partial<StoreState>;
}

// 2. The Provider Component
const StoreProvider = ({ children, initialState }: StoreProviderProps) => {
  // We use useRef to guarantee the store is only instantiated ONCE
  // per component tree mount (i.e. once per request)
  const storeRef = useRef<AppStore | null>(null);

  // eslint-disable-next-line react-hooks/refs
  if (!storeRef.current) {
    storeRef.current = createAppStore(initialState);
  }

  return (
    // eslint-disable-next-line react-hooks/refs
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreProvider;

// 3. Hook to select state slices from the context-bound store
export function useAppStore<T>(selector: (state: StoreState) => T): T {
  const storeContext = useContext(StoreContext);

  if (!storeContext) {
    throw Error("useAppStore must be used within a store provider");
  }

  // useZustandStore connects a vanilla store instance to React's rendering lifecycle
  return useZustandStore(storeContext, selector);
}

// 4. Hook to obtain the raw store API (needed for rehydration/listeners)
export function useAppStoreApi() {
  const storeContext = useContext(StoreContext);
  if (!storeContext) {
    throw Error("useAppStoreApi must be used within a StoreProvider");
  }
  return storeContext;
}
