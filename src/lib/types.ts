import dayjs from "@/lib/dayjs";

export type User = {
  id: string;
  email: string;
  name: string;
  created_at: string;
};

export type Event = {
  id: string;
  title: string;
  start_time: Date;
  end_time: Date;
  timezone: string;
  repeated: Repeated;
  user_id?: string;
  created_at?: string;
};

export enum Repeated {
  Never = "never",
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
  Yearly = "yearly",
}

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
