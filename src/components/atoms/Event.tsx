"use client";

import { draggerId, pixelPerMinute, pixelPerQuarter } from "@/lib/consts";
import { useContextStore } from "@/lib/stores/context";
import { useSettingStore } from "@/lib/stores/settings";
import { Clock, Event as EventType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import dayjs from "dayjs";
import { CSSProperties, useEffect, useMemo, useState } from "react";

interface Props {
  event: EventType;
  active: boolean;
}

export default function Event({ event, active }: Props) {
  const [y, setY] = useState(0);
  const [label, setLabel] = useState("");
  const [height, setHeight] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const { settings } = useSettingStore();
  const { setActiveEvent } = useContextStore();

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: event.id,
      data: {
        y: dragOffset,
        height,
        title: event.title,
        start: event.start_time,
        end: event.end_time,
      },
    });

  const style: CSSProperties = useMemo(() => {
    return {
      transform: transform
        ? `translate3d(${transform.x}px, ${transform.y + y}px, 0)`
        : `translate3d(0px, ${y}px, 0)`,
      position: "absolute",
      height: Math.max(height, pixelPerQuarter),
      touchAction: "none",
      opacity: isDragging ? 0.4 : undefined,
      zIndex: isDragging ? 10 : undefined,
    };
  }, [transform, y, height, isDragging]);

  useEffect(() => {
    setY(
      dayjs(event.start_time).diff(dayjs(event.start_time).startOf("d"), "m") *
        pixelPerMinute,
    );
    setHeight(
      dayjs(event.end_time).diff(event.start_time, "minute") * pixelPerMinute,
    );
  }, [event]);

  useEffect(() => {
    setLabel(
      generateEventTime(event.start_time, event.end_time, settings.clock),
    );
  }, [settings, event]);

  useEffect(() => {
    if (transform) {
      setDragOffset(transform.y);
    }
  }, [transform]);

  return (
    <div
      id={event.id}
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-full bg-opacity-75 relative border-l-4 border-orange-300 rounded-sm",
        active ? "bg-orange-300" : "bg-orange-500",
      )}
      style={style}>
      <Dragger className="top-0" compact={height <= 30 * pixelPerMinute} />
      <span
        className={cn(
          "flex h-full text-foreground font-medium",
          isDragging
            ? "cursor-grabbing"
            : active
              ? "cursor-grab"
              : "cursor-default",
          height > 30 * pixelPerMinute ? "p-1" : "px-1",
          height <= 15 * pixelPerMinute
            ? "flex-row gap-2 items-center truncate"
            : "flex-col",
        )}
        onMouseDown={() => {
          !active && setActiveEvent(event);
        }}
        {...listeners}
        {...attributes}>
        <p className="truncate text-sm">{event.title}</p>
        <p className="text-xs opacity-75">{label}</p>
      </span>
      <Dragger className="bottom-0" compact={height <= 30 * pixelPerMinute} />
    </div>
  );
}

function Dragger({
  className,
  compact,
}: {
  className?: string;
  compact: boolean;
}) {
  return (
    <span
      id={draggerId}
      style={{
        height: compact ? pixelPerMinute * 2.5 : pixelPerQuarter,
      }}
      className={cn(
        "flex items-center justify-center absolute cursor-row-resize w-full",
        className,
      )}
    />
  );
}

export function formatTime(
  time: Date,
  clock: Clock,
  showPeriod: boolean = false,
  noSpace: boolean = false,
) {
  let timeFormat = "";

  if (clock === 12) {
    timeFormat = "h";
    timeFormat += dayjs(time).minute() !== 0 ? ":mm" : "";
    timeFormat += showPeriod ? (noSpace ? "A" : " A") : "";
  } else {
    timeFormat = "HH:mm";
  }

  return dayjs(time).format(timeFormat);
}

export function generateEventTime(start: Date, end: Date, clock: Clock) {
  const startTime = formatTime(start, clock);
  const conditional =
    clock === 12 && dayjs(start).format("A") !== dayjs(end).format("A")
      ? dayjs(start).format(" A")
      : "";

  const endTime = formatTime(end, clock, true);

  return `${startTime}${conditional} - ${endTime}`;
}
