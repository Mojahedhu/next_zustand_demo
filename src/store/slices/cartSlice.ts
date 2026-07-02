import { StateCreator } from "zustand";
import { AuthSlice } from "./authSlice";

export interface CartSlice {
  items: string[];
  addItem: (item: string) => void;
  clearCart: () => void;
}

export const createCartSlice: StateCreator<
  AuthSlice & CartSlice,
  [],
  [],
  CartSlice
> = (set) => ({
  items: [],
  addItem: (item: string) =>
    set((prev) => ({
      items: [...prev.items, item],
    })),
  clearCart: () => set({ items: [] }),
});
