"use client";

import { pixelPerHour } from "@/lib/consts";
import { useDataStore } from "@/lib/stores/data";
import { useSettingStore } from "@/lib/stores/settings";
import { Clock } from "@/lib/types";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { memo, useEffect, useState } from "react";

interface Props {
  hour: number;
}

const textHeight = 16;

export default memo(function TimeBlock({ hour }: Props) {
  const { settings } = useSettingStore();
  const { time, updateTime } = useDataStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set the component as mounted after the first render
    setIsClient(true);

    updateTime(settings.clock);

    if (time.hour === hour) {
      const interval = setInterval(
        () => updateTime(settings.clock),
        (60 - dayjs().second()) * 1000,
      );
      return () => {
        clearInterval(interval);
      };
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, hour]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div
      id={`timeblock-${hour + 1}`}
      style={{ height: pixelPerHour }}
      className="flex relative justify-end px-1 font-mono font-medium text-xs">
      <p
        style={{ top: pixelPerHour - textHeight / 2, height: textHeight }}
        className={cn(
          "absolute text-foreground-tertiary",
          hour === 23 && "hidden",
          time.hour - 1 === hour && time.minutes < 15 && "hidden",
          time.hour === hour && time.minutes > 45 && "hidden",
        )}>
        {getHour(hour + 1, settings.clock)}
      </p>
      {time.hour === hour && (
        <p
          className="absolute font-semibold"
          style={{
            top: time.minutes - textHeight / 2,
            height: textHeight,
          }}>
          {time.time}
        </p>
      )}
    </div>
  );
});

function getHour(hour: number, clock: Clock) {
  // Placeholder for SSR
  if (typeof window === "undefined") {
    return "--:--";
  }

  if (clock === 24) {
    return dayjs().set("hour", hour).format("HH:00");
  }
  return dayjs().set("hour", hour).format("hA");
}
