import { pixelPerHour, pixelPerQuarter } from "@/lib/consts";
import { Picker } from "@/lib/types";
import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import "dayjs/plugin/duration";
import "dayjs/plugin/relativeTime";
import "dayjs/plugin/utc";
import { twMerge } from "tailwind-merge";

dayjs.extend(require("dayjs/plugin/utc"));
dayjs.extend(require("dayjs/plugin/timezone"));
dayjs.extend(require("dayjs/plugin/duration"));
dayjs.extend(require("dayjs/plugin/relativeTime"));
dayjs.extend(require("dayjs/plugin/weekOfYear"));
dayjs.extend(require("dayjs/plugin/customParseFormat"));

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Day ID

type DayObject = {
  day: string;
  date: string;
  month: string;
  year: string;
  week: string;
};

// Generate
export function getDayObjectWithDate(dateInput: Date): DayObject {
  const formattedDate = dayjs(dateInput);
  const day = formattedDate.format("ddd");
  const date = formattedDate.format("DD");
  const month = formattedDate.format("MMMM");
  const year = formattedDate.format("YYYY");
  const week = formattedDate.week().toString();

  return {
    day,
    date,
    month,
    year,
    week,
  };
}

// Parse
export function getDayObjectFromId(id: string): DayObject {
  const [day, date, month, year, week] = id.split("-");
  return {
    day,
    date,
    month,
    year,
    week,
  };
}

// ---

// Helper function to add/remove query params
export function queryParams(
  removeKeys: string[],
  addKeys: string[][],
  params: any,
  pathname: string,
) {
  const url = new URLSearchParams(params);
  removeKeys.map((key) => url.delete(key));
  addKeys.map((key) => url.set(key[0], key[1]));

  return pathname + (url.toString() ? "?" + url.toString() : "");
}

export function getDateTimePairFromSelection(
  startSelection: number,
  endSelection: number,
  startDate: Date,
): {
  startDateTime: Date;
  endDateTime: Date;
} {
  const startDateTime = dayjs(
    getDateAndTimeFromSelection(startSelection, startDate),
  )
    .utc()
    .toDate();
  const endDateTime = dayjs(
    getDateAndTimeFromSelection(endSelection + 1, startDate),
  )
    .utc()
    .toDate();
  return { startDateTime, endDateTime };
}

export function getDateAndTimeFromSelection(
  selection: number,
  date: Date,
): Date {
  const startDateTime = dayjs(date);
  const hoursToAdd = Math.floor(selection / pixelPerHour);
  const minutesToAdd = (selection % pixelPerHour) * 15;

  const selectedDateTime = startDateTime
    .add(hoursToAdd, "hour")
    .add(minutesToAdd, "minute")
    .toDate();

  return selectedDateTime;
}

// Used everywhere to convert ISO string to "HH:mm" format
export function convertISOToTimePicker(isoString: string): Picker {
  const dateTime = dayjs(isoString);
  const label = dateTime.format("HH:mm");
  const value = dateTime.format();

  return { label, value };
}

export const isStartBeforeEnd = (start: string, end: string): boolean => {
  const startTime = dayjs(start).toDate();
  const endTime = dayjs(end).toDate();
  return startTime < endTime;
};

// Helper function for isStartBeforeEnd
const timeStringToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

export const isStartHHMMBeforeEndHHMM = (
  start: string,
  end: string,
): boolean => {
  const startTime = timeStringToMinutes(start);
  const endTime = timeStringToMinutes(end);
  return startTime < endTime;
};

export const isStartDateBeforeEndDate = (start: Date, end: Date): boolean => {
  const startTime = start.getTime();
  const endTime = end.getTime();
  return startTime < endTime;
};

export function calculateDaysToPreviousMonday(day: string) {
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayIndex = daysOfWeek.indexOf(day);

  // Calculate the number of days to go back to the previous Monday
  // If the input day is "Mon", return 0
  // If the input day is after "Mon", subtract the day index from 1
  // If the input day is before "Mon", add the difference between the index and 1 to -7
  return dayIndex === 0 ? 0 : dayIndex > 0 ? 0 - dayIndex : -7 + dayIndex;
}

export function getTimeFromPixelOffset(offset: number, day: Date): Date {
  const dateTime = dayjs(day);
  const minutes = getQuarter(offset);

  return dayjs(dateTime)
    .set("hour", Math.floor(minutes / 60))
    .set("minute", minutes % 60)
    .toDate();
}

export function getPixelOffsetFromTime(time: Date, day: Date): number {
  const dateTime = dayjs(day);
  const minutes = dayjs(time).diff(dateTime, "minute");
  return getQuarter(minutes);
}

export function generateStartTimes(start: string, timezone: string): Picker[] {
  const times: Picker[] = [];
  const startDate = dayjs(start).tz(timezone).startOf("day");

  for (let hours = 0; hours < 24; hours++) {
    for (let minutes = 0; minutes < 60; minutes += 15) {
      const time = startDate.hour(hours).minute(minutes);
      times.push({
        label: time.format("HH:mm"),
        value: time.format(),
      });
    }
  }

  return times;
}

export function generateEndTimes(end: string, timezone: string): Picker[] {
  const times: Picker[] = [];
  let endDate = dayjs(end).tz(timezone);

  const remainder = endDate.minute() % 15;
  endDate = endDate.subtract(remainder, "minute").startOf("minute");

  let currentTime = endDate.subtract(12, "hour");
  const limitTime = endDate.add(12, "hour");

  while (currentTime.isBefore(limitTime) || currentTime.isSame(limitTime)) {
    times.push({
      label: currentTime.format("HH:mm"),
      value: currentTime.format(),
    });

    currentTime = currentTime.add(15, "minute");
  }

  return times;
}

export function getQuarter(value: number): number {
  return Math.floor(value / pixelPerQuarter) * pixelPerQuarter;
}
