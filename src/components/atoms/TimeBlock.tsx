"use client";

import { pixelPerHour } from "@/lib/consts";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { memo, useEffect, useState } from "react";

interface Props {
  hour: number;
}

export default memo(function TimeBlock({ hour }: Props) {
  const [currentHour, setCurrentHour] = useState(getCurrentHourTime(hour - 1));
  const textHeight = 16;

  useEffect(() => {
    if (currentHour.isCurrentHour) {
      const interval = setInterval(
        () => setCurrentHour(getCurrentHourTime(hour - 1)),
        (60 - dayjs().second()) * 1000,
      );
      return () => {
        clearInterval(interval);
      };
    }
  }, [currentHour.isCurrentHour, hour]);

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
        {getHour(hour)}
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

function getHour(hour: number) {
  if (hour >= 0 && hour <= 11) {
    return hour === 0 ? "12AM" : hour + "AM";
  } else if (hour === 12) {
    return "12PM";
  } else {
    return hour - 12 + "PM";
  }
}

function getCurrentHourTime(valueHour: number): {
  hour: number;
  minutes: number;
  time: string;
  isCurrentHour: boolean;
  isPreviousHour: boolean;
} {
  const hour = dayjs().hour();
  const minutes = dayjs().minute();
  const time = dayjs().format("h:mmA");
  const isCurrentHour = valueHour === hour;
  const isPreviousHour = valueHour === hour - 1;

  return { hour, minutes, time, isCurrentHour, isPreviousHour };
}
