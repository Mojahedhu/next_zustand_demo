import { StateCreator } from "zustand";
import { CartSlice } from "./cartSlice";
import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters long")
  .max(20, "Username cannot exceed 20 characters");
// Parse and handle errors inside the action:
// typescript

export interface AuthSlice {
  username: string;
  login: (username: string) => void;
  logout: () => void;
}

export const createAuthSlice: StateCreator<
  AuthSlice & CartSlice,
  [],
  [],
  AuthSlice
> = (set) => ({
  username: "",
  login: (name: string) => {
    const validation = usernameSchema.safeParse(name);
    if (!validation.success) {
      throw new Error(validation.error.message);
    }
    set({ username: validation.data });
  },
  logout: () => set({ username: "", items: [] }),
});
