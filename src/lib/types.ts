export type Event = {
	title: string;
	start: string;
	end: string;
	timezone: PickerType;
	repeated: PickerType;
	date: Date;
};

export type PickerType = {
	label: string;
	value: string;
};

export type View = 1 | 3 | 7 | 30;
