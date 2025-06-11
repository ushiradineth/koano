import { GRID_HEIGHT, PIXEL_PER_QUARTER } from "@/lib/consts";
import dayjs from "@/lib/dayjs";
import { useInteractionStore } from "@/lib/stores/interactions";
import { useSettingStore } from "@/lib/stores/settings";
import { Preview } from "@/lib/types";
import { cn, generateEventTime, getTimeFromPixelOffset } from "@/lib/utils";
import { useMemo } from "react";

interface Props {
  preview: Preview;
  title: string;
  day: Date;
}

export default function PreviewEvent({ preview, title, day }: Props) {
  const { settings } = useSettingStore();
  const { extending } = useInteractionStore();
  const relativePreview = useMemo(
    () => generateRelativePreview(preview, day),
    [preview, day],
  );

  if (!relativePreview) {
    return null;
  }

  return (
    <div
      style={{
        top: relativePreview.top,
        height: relativePreview.height,
        zIndex: extending ? 50 : undefined,
        opacity: extending ? undefined : 0.5,
      }}
      className={cn(
        "absolute flex h-full w-full flex-col bg-orange-400 font-medium text-foreground",
        Math.max(relativePreview.height, PIXEL_PER_QUARTER) > 30
          ? "p-1"
          : "px-1",
      )}>
      {!relativePreview.compact && <p className="truncate text-sm">{title}</p>}
      {!relativePreview.compact && (
        <p className="text-xs opacity-75">
          {generateEventTime(
            getTimeFromPixelOffset(preview.start.quarter, preview.start.day!),
            getTimeFromPixelOffset(preview.end.quarter, preview.end.day!),
            settings.clock,
          )}
        </p>
      )}
    </div>
  );
}

function generateRelativePreview(
  preview: Preview,
  day: Date,
): {
  top: number;
  height: number;
  compact?: boolean;
} | null {
  const start = dayjs(preview.start.day);
  const end = dayjs(preview.end.day);
  const current = dayjs(day);

  // The preview starts and ends on the current day
  if (start.isSame(current, "day") && end.isSame(current, "day")) {
    if (preview.start.quarter === preview.end.quarter) {
      return {
        top: preview.start.quarter,
        height: 2,
        compact: true,
      };
    }

    return {
      top: preview.start.quarter,
      height: Math.max(
        preview.end.quarter - preview.start.quarter,
        PIXEL_PER_QUARTER,
      ),
    };
  }

  // The preview spans the whole day
  if (start.isBefore(current, "day") && end.isAfter(current, "day")) {
    return {
      top: 0,
      height: GRID_HEIGHT,
    };
  }

  // The preview starts in the current day
  if (start.isSame(current, "day") && end.isAfter(current, "day")) {
    return {
      top: preview.start.quarter,
      height: GRID_HEIGHT - preview.start.quarter,
    };
  }

  // The preview ends in the current day
  if (start.isBefore(current, "day") && end.isSame(current, "day")) {
    return {
      top: 0,
      height: preview.end.quarter,
    };
  }

  return null;
}
