import { repeatValues } from "@/lib/consts";
import { Clock, Picker, TimeObject } from "@/lib/types";
import dayjs from "dayjs";
import { create } from "zustand";
import { useSettingStore } from "./settings";

type DataStore = {
  times: Picker[];
  timezones: Picker[];
  timezone: Picker;
  repeated: Picker[];
  time: TimeObject;
  updateTime: () => void;
};

export const useDataStore = create<DataStore>()((set) => {
  const timezones = generateTimezoneArray();
  const userTimezone = getUserTimezone(timezones) ?? timezones[0];
  const clock = useSettingStore.getState().settings.clock;

  return {
    times: generate24HourTimeArray(),
    timezones: timezones,
    timezone: userTimezone,
    repeated: repeatValues,
    time: getTimeObject(clock),
    updateTime: () => set({ time: getTimeObject(clock) }),
  };
});

function generate24HourTimeArray(): Picker[] {
  const time = [];
  for (let hours = 0; hours < 24; hours++) {
    for (let minutes = 0; minutes < 60; minutes += 15) {
      const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      time.push({ value: formattedTime, label: formattedTime });
    }
  }

  return time;
}

export function generate12HourTimeArray(): Picker[] {
  const time = [];
  for (let hours = 0; hours < 24; hours++) {
    for (let minutes = 0; minutes < 60; minutes += 15) {
      const period = hours < 12 ? "AM" : "PM";
      const adjustedHour = hours % 12 === 0 ? 12 : hours % 12;
      const formattedTime = `${String(adjustedHour)}:${String(minutes).padStart(2, "0")} ${period}`;
      time.push({ value: formattedTime, label: formattedTime });
    }
  }

  return time;
}

function generateTimezoneArray(): Picker[] {
  const timezones: Picker[] = [{ label: "", value: "" }];
  const allTimezones = Intl.supportedValuesOf("timeZone");

  allTimezones.map((timezone) =>
    timezones.push({ label: timezone ?? "", value: timezone ?? "" }),
  );

  return timezones;
}

function getUserTimezone(timezones: Picker[]): Picker | null {
  const userTimezone = dayjs.tz?.guess();

  const foundTimezone = timezones.find(
    (timezone) => timezone.value === userTimezone,
  );

  return foundTimezone || null;
}

export function getTimeObject(clock: Clock): TimeObject {
  const day = dayjs();
  const hour = Number(day.format("H"));
  const minutes = day.minute();
  const time = day.format(clock === 12 ? "h:mmA" : "H:mm");

  return { day, hour, minutes, time };
}
