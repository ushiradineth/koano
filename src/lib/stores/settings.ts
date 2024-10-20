import { View } from "@/lib/types";
import { create } from "zustand";

type SettingStore = {
  view: View;
  setView: (value: View) => void;
};

export const useSettingStore = create<SettingStore>()((set, get) => ({
  view: 7,
  setView: (value: View) => set({ view: value }),
}));
