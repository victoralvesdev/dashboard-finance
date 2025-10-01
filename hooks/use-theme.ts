import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeStore = {
  isDark: boolean;
  onToggle: () => void;
};

export const useTheme = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: false,
      onToggle: () => set((state) => ({ isDark: !state.isDark })),
    }),
    {
      name: "theme-storage",
    }
  )
);
