// stores -> index.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeType = "light" | "dark" | "system";

type GlobalState = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
};

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "global-theme-storage",
    }
  )
);
