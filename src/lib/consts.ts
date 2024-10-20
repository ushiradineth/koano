export type Repeat = "none" | "daily" | "weekly" | "monthly" | "yearly";

export const repeatValues: { label: string; value: Repeat }[] = [
	{ label: "None", value: "none" },
	{ label: "Daily", value: "daily" },
	{ label: "Weekly", value: "weekly" },
	{ label: "Monthly", value: "monthly" },
	{ label: "Yearly", value: "yearly" },
];

export const gridHeight = 1440; // 24 hours * 60 minutes - Pixel Per Minute
export const pixelPerMinute = 1;
export const pixelPerQuarter = 15;
export const pixelPerHour = 60;
