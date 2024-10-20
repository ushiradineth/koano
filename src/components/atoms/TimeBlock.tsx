"use client";

import { pixelPerHour } from "@/lib/consts";
import { useSettingStore } from "@/lib/stores/settings";
import { Clock } from "@/lib/types";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { memo, useEffect, useState } from "react";

interface Props {
  hour: number;
}

export default memo(function TimeBlock({ hour }: Props) {
  const { settings } = useSettingStore();
  const [currentHour, setCurrentHour] = useState(
    getCurrentTimeObject(hour, settings.clock),
  );
  const textHeight = 16;

  useEffect(() => {
    if (currentHour.isCurrentHour) {
      const interval = setInterval(
        () => setCurrentHour(getCurrentTimeObject(hour, settings.clock)),
        (60 - dayjs().second()) * 1000,
      );
      return () => {
        clearInterval(interval);
      };
    }
  }, [currentHour.isCurrentHour, hour, settings]);

  useEffect(() => {
    setCurrentHour(getCurrentTimeObject(hour, settings.clock));
  }, [settings, hour]);

  return (
    <div
      id={String(hour)}
      style={{ height: pixelPerHour }}
      className="flex relative w-full items-center justify-center px-2 font-mono font-medium text-xs">
      <p
        style={{ top: pixelPerHour - textHeight / 2, height: textHeight }}
        className={cn(
          "absolute",
          hour === 23 && "hidden",
          currentHour.isPreviousHour && currentHour.minutes < 15 && "hidden",
          currentHour.isCurrentHour && currentHour.minutes > 45 && "hidden",
        )}>
        {getHour(hour + 1, settings.clock)}
      </p>
      {currentHour.isCurrentHour && (
        <p
          className={"absolute bg-background"}
          style={{
            top: currentHour.minutes - textHeight / 2,
            height: textHeight,
          }}>
          {currentHour.time}
        </p>
      )}
    </div>
  );
});

function getHour(hour: number, clock: Clock) {
  if (clock === 24) {
    return dayjs().set("hour", hour).format("HH:00");
  }
  return dayjs().set("hour", hour).format("hA");
}

function getCurrentTimeObject(
  valueHour: number,
  clock: Clock,
): {
  minutes: number;
  time: string;
  isCurrentHour: boolean;
  isPreviousHour: boolean;
} {
  const day = dayjs();
  const hour = Number(day.format("H"));
  const minutes = day.minute();
  const time = day.format(clock === 12 ? "h:mmA" : "H:mm");
  const isCurrentHour = valueHour === hour;
  const isPreviousHour = valueHour === hour - 1;

  return { minutes, time, isCurrentHour, isPreviousHour };
}
