import { create } from "zustand";
import { AuthSlice, createAuthSlice } from "./slices/auth-slice";
import { CartSlice, createCartSlice } from "./slices/cart-slice";
import { persist } from "zustand/middleware";

type StoreState = AuthSlice & CartSlice;

export const useStore = create<StoreState>()(
  persist(
    (...a) => {
      return {
        ...createAuthSlice(...a),
        ...createCartSlice(...a),
      };
    },
    {
      name: "app-storage",
      skipHydration: true,
    },
  ),
);
