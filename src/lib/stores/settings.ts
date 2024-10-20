import { Settings } from "@/lib/types";
import { create } from "zustand";

type SettingStore = {
	settings: Settings;
	setSettings: (value: Settings) => void;
};

export const useSettingStore = create<SettingStore>()((set) => ({
	settings: {
		view: 7,
		clock: 12,
	},
	setSettings: (value: Settings) => {
		set({ settings: value });
	},
}));
