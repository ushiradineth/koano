export type Repeat = "none" | "daily" | "weekly" | "monthly" | "yearly";

export const repeatValues: { label: string; value: Repeat }[] = [
	{ label: "None", value: "none" },
	{ label: "Daily", value: "daily" },
	{ label: "Weekly", value: "weekly" },
	{ label: "Monthly", value: "monthly" },
	{ label: "Yearly", value: "yearly" },
];

export const breakpoint = 640;
