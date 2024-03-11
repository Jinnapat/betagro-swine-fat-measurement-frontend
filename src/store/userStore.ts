import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserState = {
  accessToken: string;
  setAccessToken: (accessToken: string) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
};

export const useUserStore = create(
  persist<UserState>(
    (set) => ({
      accessToken: "",
      _hasHydrated: false,
      setAccessToken: (accessToken: string) => set({ accessToken }),
      setHasHydrated: (state: boolean) => {
        set({
          _hasHydrated: state,
        });
      },
    }),
    {
      name: "user-storage",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.setHasHydrated(true);
      },
    }
  )
);
