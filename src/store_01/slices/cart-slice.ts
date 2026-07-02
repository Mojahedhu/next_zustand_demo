import { StateCreator } from "zustand";
import { AuthSlice } from "./auth-slice";

export interface CartSlice {
  items: string[];
  addItem: (item: string) => void;
  clearCart: () => void;
}

export const createCartSlice: StateCreator<
  CartSlice & AuthSlice,
  [],
  [],
  CartSlice
> = (set) => {
  return {
    items: [],
    addItem: (item) => set((state) => ({ items: [...state.items, item] })),
    clearCart: () => set({ items: [] }),
  };
};
