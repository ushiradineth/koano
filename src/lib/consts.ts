import { Repeated } from "@/lib/types";

export const repeatValues: Repeated[] = [
  Repeated.Never,
  Repeated.Daily,
  Repeated.Weekly,
  Repeated.Monthly,
  Repeated.Yearly,
];

const ratio = 1;
export const gridHeight = 1440 * ratio; // 24 hours * 60 minutes - Pixel Per Minute
export const pixelPerHour = 60 * ratio;
export const pixelPerQuarter = 15 * ratio;
export const pixelPerMinute = 1 * ratio;

export const draggerId = "dragger";

export const sidebarWidth = 256;
export const headerHeight = 56;
export const secondaryHeaderHeight = 24;
