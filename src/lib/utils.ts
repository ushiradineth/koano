import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import "dayjs/plugin/duration";
import "dayjs/plugin/relativeTime";
import "dayjs/plugin/utc";
import { twMerge } from "tailwind-merge";

dayjs.extend(require("dayjs/plugin/utc"));
dayjs.extend(require("dayjs/plugin/duration"));
dayjs.extend(require("dayjs/plugin/relativeTime"));

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getHour(hour: number) {
	if (hour >= 0 && hour <= 11) {
		return hour === 0 ? "12AM" : hour + "AM";
	} else if (hour === 12) {
		return "12PM";
	} else {
		return hour - 12 + "PM";
	}
}

export function getDateRange(date: Date): string[] {
	const currentDate = dayjs(date);
	const dateRange: string[] = [];

	// Add 7 previous days
	for (let i = 7; i > 0; i--) {
		const previousDate = currentDate.subtract(i, "day");
		dateRange.push(previousDate.format("YYYY-MM-DD"));
	}

	// Add current date
	dateRange.push(currentDate.format("YYYY-MM-DD"));

	// Add 7 next days
	for (let i = 1; i <= 7; i++) {
		const nextDate = currentDate.add(i, "day");
		dateRange.push(nextDate.format("YYYY-MM-DD"));
	}

	return dateRange;
}

export function getDayWithDate(date: Date): { day: string; date: string } {
	const formattedDate = dayjs(date);
	const day = formattedDate.format("ddd");
	const dateNumber = formattedDate.format("DD");
	return {
		day,
		date: dateNumber,
	};
}

export function isToday(dateToCompare: Date): boolean {
	const today = dayjs().startOf("day");
	const otherDate = dayjs(dateToCompare).startOf("day");

	return today.isSame(otherDate);
}

interface DateTimePair {
	startDateTime: Date;
	endDateTime: Date;
}

export function getDateTimePairFromSelection(
	startSelection: number,
	endSelection: number,
	startDate: Date,
): DateTimePair {
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
	startDate: Date,
): Date {
	const startDateTime = dayjs(startDate);
	const hoursToAdd = Math.floor(selection / 4);
	const quartersToAdd = (selection % 4) * 15;

	const selectedDateTime = startDateTime
		.add(hoursToAdd, "hour")
		.add(quartersToAdd, "minute")
		.toDate();

	console.log(selectedDateTime);
	return selectedDateTime;
}

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

export function getCurrentHourTime(valueHour: number) {
	const hour = dayjs().hour();
	const minutes = dayjs().minute();
	const time = dayjs().format("h:mm A");
	const isCurrentHour = valueHour === hour;
	const isPreviousHour = valueHour === hour - 1;

	return { hour, minutes, time, isCurrentHour, isPreviousHour };
}
