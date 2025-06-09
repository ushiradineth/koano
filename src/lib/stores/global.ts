import { create } from "zustand";

type GlobalStore = {
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;

  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
};

export const useGlobalStore = create<GlobalStore>()((set) => ({
  accessToken: null,
  setAccessToken: (accessToken: string | null) => set({ accessToken }),

  globalLoading: false,
  setGlobalLoading: (loading: boolean) => set({ globalLoading: loading }),
}));
