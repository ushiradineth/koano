import { Repeated } from "@/lib/types";

export const repeatValues: Repeated[] = [
  Repeated.Never,
  Repeated.Daily,
  Repeated.Weekly,
  Repeated.Monthly,
  Repeated.Yearly,
];

const RATIO = 1;
export const GRID_HEIGHT = 1440 * RATIO; // 24 hours * 60 minutes - Pixel Per Minute
export const PIXEL_PER_HOUR = 60 * RATIO;
export const PIXEL_PER_QUARTER = 15 * RATIO;
export const PIXEL_PER_MINUTE = 1 * RATIO;

export const DRAGGER_ID = "dragger";

export const SIDEBAR_WIDTH = 256;
export const HEADER_HEIGHT = 56;
export const SECONDARY_HEADER_HEIGHT = 24;

export const INITIAL_DATE_RANGE = 60;
export const DATE_BUFFER_RANGE = 30;
