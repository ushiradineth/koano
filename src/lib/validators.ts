import { z } from "zod";
import { repeatValues } from "./consts";
import { generateTimeArray, generateTimezoneArray } from "./utils";

const TimeSchema = z
	.object({
		label: z.string(),
		value: z.string(),
	})
	.refine(
		(value) =>
			generateTimeArray().some(
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
			generateTimezoneArray().some(
				(time) => time.label === value.label && time.value === value.value,
			),
		{
			message:
				"Invalid timezone value. Must be a valid timezone.",
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

export const addEventSchema = z.object({
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
