import dayjs from "dayjs";

export type Event = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  timezone: string;
  repeated: string;
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
  timezone: string;
};

export type TimeObject = {
  day: dayjs.Dayjs;
  hour: number;
  minutes: number;
  time: string;
};
