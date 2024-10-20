import { repeatValues } from "@/lib/consts";
import { Picker } from "@/lib/types";
import dayjs from "dayjs";
import { create } from "zustand";

type DataStore = {
  times: Picker[];
  timezones: Picker[];
  timezone: Picker;
  repeated: Picker[];
};

export const useDataStore = create<DataStore>()((_) => {
  const timezones = generateTimezoneArray();

  return {
    times: generateTimeArray(),
    timezones: timezones,
    timezone: getUserTimezone(timezones) ?? timezones[0],
    repeated: repeatValues,
  };
});

function generateTimeArray(): Picker[] {
  const time = [];
  for (let hours = 0; hours < 24; hours++) {
    for (let minutes = 0; minutes < 60; minutes += 15) {
      const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      time.push({ value: formattedTime, label: formattedTime });
    }
  }

  time.push({ value: "24:00", label: "24:00" } as Picker);
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
  const userTimezone = dayjs.tz.guess();

  const foundTimezone = timezones.find(
    (timezone) => timezone.value === userTimezone,
  );

  return foundTimezone || null;
}
