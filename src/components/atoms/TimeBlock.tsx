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
    getCurrentHourTime(hour - 1, settings.clock),
  );
  const textHeight = 16;

  useEffect(() => {
    if (currentHour.isCurrentHour) {
      const interval = setInterval(
        () => setCurrentHour(getCurrentHourTime(hour - 1, settings.clock)),
        (60 - dayjs().second()) * 1000,
      );
      return () => {
        clearInterval(interval);
      };
    }
  }, [currentHour.isCurrentHour, hour, settings]);

  useEffect(() => {
    setCurrentHour(getCurrentHourTime(hour - 1, settings.clock));
  }, [settings, hour]);

  return (
    <div
      style={{ height: pixelPerHour }}
      className="flex relative w-full items-center justify-center px-2 font-mono font-medium text-xs">
      <p
        style={{ top: pixelPerHour - textHeight / 2, height: textHeight }}
        className={cn(
          "absolute",
          currentHour.isPreviousHour && currentHour.minutes < 15 && "hidden",
          currentHour.isCurrentHour && currentHour.minutes > 45 && "hidden",
        )}>
        {getHour(hour, settings.clock)}
      </p>
      {currentHour.isCurrentHour && (
        <p
          className={cn("absolute bg-background")}
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

function getCurrentHourTime(
  valueHour: number,
  clock: Clock,
): {
  hour: number;
  minutes: number;
  time: string;
  isCurrentHour: boolean;
  isPreviousHour: boolean;
} {
  const hour = dayjs().hour();
  const minutes = dayjs().minute();
  const time = dayjs().format(clock === 12 ? "h:mmA" : "H:mm");
  const isCurrentHour = valueHour === hour;
  const isPreviousHour = valueHour === hour - 1;

  return { hour, minutes, time, isCurrentHour, isPreviousHour };
}
