export type Repeat = "none" | "daily" | "weekly" | "monthly" | "yearly";

export const repeatValues: { label: string; value: Repeat }[] = [
	{ label: "None", value: "none" },
	{ label: "Daily", value: "daily" },
	{ label: "Weekly", value: "weekly" },
	{ label: "Monthly", value: "monthly" },
	{ label: "Yearly", value: "yearly" },
];

const ratio = 1;
export const gridHeight = 1440 * ratio; // 24 hours * 60 minutes - Pixel Per Minute
export const pixelPerHour = 60 * ratio;
export const pixelPerQuarter = 15 * ratio;
export const pixelPerMinute = 1 * ratio;
