import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserState = {
  accessToken: string;
  setAccessToken: (accessToken: string) => void;
};

export const useUserStore = create(
  persist<UserState>(
    (set) => ({
      accessToken: "",
      setAccessToken: (accessToken: string) => set({ accessToken }),
    }),
    {
      name: "user-storage",
    }
  )
);
