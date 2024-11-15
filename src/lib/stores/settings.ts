import { Settings } from "@/lib/types";
import dayjs from "dayjs";
import { create } from "zustand";

type SettingStore = {
  settings: Settings;
  setSettings: (value: Settings) => void;
};

export const useSettingStore = create<SettingStore>()((set) => ({
  settings: {
    view: 7,
    clock: 12,
    timezone: dayjs.tz?.guess() ?? "ETC/GMT",
  },
  setSettings: (value: Settings) => {
    dayjs.tz.setDefault(value.timezone);
    set({ settings: value });
  },
}));
