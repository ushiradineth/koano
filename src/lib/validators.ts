import { repeatValues } from "@/lib/consts";
import { z } from "zod";
import { useDataStore } from "./stores/data";

const times = useDataStore.getState().times;
const timezones = useDataStore.getState().timezones;

const TimeSchema = z
	.object({
		label: z.string(),
		value: z.string(),
	})
	.refine(
		(value) =>
			times.some(
				(time) => time.label === value.label && time.value === value.value,
			),
		{
			message:
				"Invalid time value. Must be in 15-minute intervals from 00:00 to 24:00",
		},
	);

const TimeZoneSchema = z
	.object({
		label: z.string(),
		value: z.string(),
	})
	.refine(
		(value) =>
			timezones.some(
				(time) => time.label === value.label && time.value === value.value,
			),
		{
			message: "Invalid timezone value. Must be a valid timezone.",
		},
	);

const repeatValueSchema = z
	.object({
		label: z.string(),
		value: z.string(),
	})
	.refine(
		(value) =>
			repeatValues.some(
				(repeat) =>
					repeat.label === value.label && repeat.value === value.value,
			),
		{
			message: "Invalid repeat value. Must be one of the predefined values.",
		},
	);

export const createEventSchema = z.object({
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

export const editEventSchema = z.object({
	id: z.string(),
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
