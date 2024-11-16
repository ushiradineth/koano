import { repeatValues } from "@/lib/consts";
import { useDataStore } from "@/lib/stores/data";
import { z } from "zod";

const times = useDataStore.getState().times;
const timezones = useDataStore.getState().timezones;

const TimeSchema = z
  .string()
  .refine((value) => times.some((time) => time === value), {
    message:
      "Invalid time value. Must be in 15-minute intervals from 00:00 to 24:00",
  });

const TimeZoneSchema = z
  .string()
  .refine((value) => timezones.some((time) => time === value), {
    message: "Invalid timezone value. Must be a valid timezone.",
  });

const repeatValueSchema = z
  .string()
  .refine((value) => repeatValues.some((repeat) => repeat === value), {
    message: "Invalid repeat value. Must be one of the predefined values.",
  });

export const EventSchema = z.object({
  title: z
    .string()
    .min(2, {
      message: "Title must be at least 2 characters.",
    })
    .max(256, {
      message: "Title must be at most 256 characters.",
    }),
  repeat: repeatValueSchema,
  start: TimeSchema,
  end: TimeSchema,
  timezone: TimeZoneSchema,
  date: z.date(),
});
