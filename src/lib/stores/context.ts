import { Event } from "@/lib/types";

import { create } from "zustand";

type ContextStore = {
  activeEvent: Event | null;
  setActiveEvent: (event: Event | null) => void;
  activeDay: Date | null;
  setActiveDay: (day: Date | null) => void;
  selecting: boolean;
  setSelecting: (selecting: boolean) => void;
  extending: boolean;
  setExtending: (extending: boolean) => void;
  previewing: boolean;
  setPreviewing: (previewing: boolean) => void;
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;
};

export const useContextStore = create<ContextStore>()((set) => ({
  activeEvent: null,
  setActiveEvent: (event: Event | null) => set({ activeEvent: event }),
  activeDay: null,
  setActiveDay: (day: Date | null) => set({ activeDay: day }),
  selecting: false,
  setSelecting: (selecting: boolean) => set({ selecting }),
  extending: false,
  setExtending: (extending: boolean) => set({ extending }),
  previewing: false,
  setPreviewing: (previewing: boolean) => set({ previewing }),
  accessToken: null,
  setAccessToken: (accessToken: string | null) => set({ accessToken }),
}));
