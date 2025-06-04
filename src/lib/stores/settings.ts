import { useDataStore } from "@/lib/stores/data";
import { Settings } from "@/lib/types";
import dayjs from "@/lib/dayjs";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SettingStore = {
  settings: Settings;
  setSettings: (value: Settings) => void;
};

export const useSettingStore = create<SettingStore>()(
  persist(
    (set) => ({
      settings: {
        view: 7,
        clock: 12,
        timezone: dayjs.tz?.guess() ?? "ETC/GMT",
      },
      setSettings: (value: Settings) => {
        dayjs.tz.setDefault(value.timezone);
        useDataStore.getState().updateTimesArray(value.clock);

        set({ settings: value });
      },
    }),
    {
      name: "koano-settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
