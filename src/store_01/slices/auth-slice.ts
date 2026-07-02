import { StateCreator } from "zustand";
import { CartSlice } from "./cart-slice";

export interface AuthSlice {
  username: string | null;
  login: (username: string) => void;
  logout: () => void;
}

// StateCreator<CombinedStoreState, Mutators, NestStore, SliceState>
export const createAuthSlice: StateCreator<
  AuthSlice & CartSlice,
  [],
  [],
  AuthSlice
> = (set) => {
  return {
    username: null,
    login: (username: string) => set({ username }),

    // Cross-slice interaction: Logging out also clears the cart items!
    logout: () => set({ username: null, items: [] }),
  };
};
