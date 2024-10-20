export type Event = {
	id: string;
	title: string;
	start: Date;
	end: Date;
	timezone: Picker;
	repeated: Picker;
};

export type Picker = {
	label: string;
	value: string;
};

export type View = 1 | 3 | 7 | 30;
export type Clock = 12 | 24;

export type Settings = {
	view: View;
	clock: Clock;
};
