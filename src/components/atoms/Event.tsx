"use client";

import { draggerId, pixelPerMinute, pixelPerQuarter } from "@/lib/consts";
import { useSettingStore } from "@/lib/stores/settings";
import { Clock, Event as EventType } from "@/lib/types";
import { cn, queryParams } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import dayjs from "dayjs";
import { GripVertical } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CSSProperties, useEffect, useState } from "react";

interface Props {
  event: EventType;
}

export default function Event({ event }: Props) {
  const { settings } = useSettingStore();
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const [label, setLabel] = useState("");
  const [y, setY] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [height, setHeight] = useState(0);
  const [compact, setCompact] = useState(height <= 30 * pixelPerMinute);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: event.id,
      data: {
        y: dragOffset,
        height,
        title: event.title,
        start: event.start,
        end: event.end,
      },
    });

  const style: CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y + y}px, 0)`
      : `translate3d(0px, ${y}px, 0)`,
    position: "absolute",
    height: Math.max(height, pixelPerQuarter),
    touchAction: "none",
    opacity: isDragging ? 0.4 : undefined,
  };

  useEffect(() => {
    setY(
      dayjs(event.start).diff(dayjs(event.start).startOf("d"), "m") *
        pixelPerMinute,
    );
    setHeight(dayjs(event.end).diff(event.start, "minute") * pixelPerMinute);
  }, [event]);

  useEffect(() => {
    setLabel(generateEventTime(event.start, event.end, settings.clock));
  }, [settings, event]);

  useEffect(() => {
    if (transform) {
      setDragOffset(transform.y);
    }
  }, [transform]);

  useEffect(() => {
    setCompact(height <= 15 * pixelPerMinute);
  }, [height]);

  return (
    <div
      id={event.id}
      ref={setNodeRef}
      className="flex flex-col w-full bg-orange-500 bg-opacity-75 group relative"
      style={style}>
      <Dragger className={cn("top-0", compact ? "w-[90%]" : "w-full")} />
      <span
        className={cn(
          "flex flex-col h-full text-xs",
          isDragging ? "cursor-grabbing" : "cursor-grab",
          compact && "gap-2 flex-row",
        )}
        {...listeners}
        {...attributes}
        onTouchEnd={() => {
          router.push(
            queryParams(
              [],
              [],
              params.entries(),
              `${pathname}/edit/${event.id}`,
            ),
            {
              scroll: false,
            },
          );
        }}
        onDoubleClick={() => {
          router.push(
            queryParams(
              [],
              [],
              params.entries(),
              `${pathname}/edit/${event.id}`,
            ),
            {
              scroll: false,
            },
          );
        }}>
        <p
          className={cn(
            "font-bold sm:block truncate",
            compact ? "w-[90%]" : "w-full",
          )}>
          {event.title}
        </p>
        {!compact && <p className={"font-semibold"}>{label}</p>}
      </span>
      {compact && <GripVertical className="w-4 h-4 absolute right-0 -z-50" />}
      <Dragger className={cn("bottom-0", compact ? "w-[90%]" : "w-full")} />
    </div>
  );
}

function Dragger({ className }: { className?: string }) {
  return (
    <button
      name={draggerId}
      style={{ height: pixelPerQuarter }}
      className={cn(
        "flex items-center justify-center absolute cursor-row-resize",
        className,
      )}
    />
  );
}

export function generateEventTime(start: Date, end: Date, clock: Clock) {
  const formatTime = (time: Date) =>
    dayjs(time).format(clock === 12 ? "h" : "HH") +
    (dayjs(time).minute() !== 0 ? dayjs(time).format(":mm") : "");

  const startTime = formatTime(start);
  const conditional =
    clock === 12 && dayjs(start).format("A") !== dayjs(end).format("A")
      ? dayjs(start).format(" A")
      : "";

  const endTime =
    formatTime(end) + (clock === 12 ? dayjs(end).format(" A") : "");

  return `${startTime}${conditional} - ${endTime}`;
}
