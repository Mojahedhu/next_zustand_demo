import { createStore } from "zustand";
import { AuthSlice, createAuthSlice } from "./slices/authSlice";
import { CartSlice, createCartSlice } from "./slices/cartSlice";
import { persist } from "zustand/middleware";

// 1. Combine our slice interfaces
export type StoreState = AuthSlice & CartSlice;

// 2. Define a factory function to instantiate the store per-request
export function createAppStore(initProps?: Partial<StoreState>) {
  const store = createStore<StoreState>()(
    persist(
      (...a) => {
        return {
          ...createAuthSlice(...a),
          ...createCartSlice(...a),
          ...initProps, // Inject initial server-fetched values
        };
      },
      {
        name: "user-cart-storage",
        skipHydration: true, // Let useHasHydrated trigger rehydration on the client
      },
    ),
  );
  return store;
}

// 3. Extract the store type helper
export type AppStore = ReturnType<typeof createAppStore>;
