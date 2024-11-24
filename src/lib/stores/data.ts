import { repeatValues } from "@/lib/consts";
import { Clock, TimeObject } from "@/lib/types";
import dayjs from "dayjs";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type DataStore = {
  times: string[];
  timezones: string[];
  repeated: string[];
  time: TimeObject;
  updateTime: (clock: Clock) => void;
  updateTimesArray: (clock: Clock) => void;
};

export const useDataStore = create<DataStore>()(
  persist(
    (set) => ({
      times: generate12HourTimeArray(),
      timezones: generateTimezoneArray(),
      repeated: repeatValues,
      time: getTimeObject(12 as Clock),
      updateTime: (clock: Clock) => set({ time: getTimeObject(clock) }),
      updateTimesArray: (clock: Clock) =>
        set({
          times:
            clock === 12
              ? generate12HourTimeArray()
              : generate24HourTimeArray(),
        }),
    }),
    {
      name: "cron-data",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

function generate24HourTimeArray(): string[] {
  const time = [];
  for (let hours = 0; hours < 24; hours++) {
    for (let minutes = 0; minutes < 60; minutes += 15) {
      const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      time.push(formattedTime);
    }
  }

  return time;
}

function generate12HourTimeArray(): string[] {
  const time = [];
  for (let hours = 0; hours < 24; hours++) {
    for (let minutes = 0; minutes < 60; minutes += 15) {
      const period = hours < 12 ? "AM" : "PM";
      const adjustedHour = hours % 12 === 0 ? 12 : hours % 12;
      const formattedTime = `${String(adjustedHour)}:${String(minutes).padStart(2, "0")} ${period}`;
      time.push(formattedTime);
    }
  }

  return time;
}

function generateTimezoneArray(): string[] {
  const timezones: string[] = [];
  const allTimezones = Intl.supportedValuesOf("timeZone");

  allTimezones.map((timezone) => timezones.push(timezone));

  return timezones;
}

function getTimeObject(clock: Clock): TimeObject {
  const day = dayjs();
  const hour = Number(day.format("H"));
  const minutes = day.minute();
  const time = day.format(clock === 12 ? "h:mmA" : "H:mm");

  return { day, hour, minutes, time };
}
