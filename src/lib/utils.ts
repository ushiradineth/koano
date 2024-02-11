import { type ClassValue, clsx } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";

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
