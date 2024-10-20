"use client";

import { pixelPerMinute, pixelPerQuarter } from "@/lib/consts";
import { Event } from "@/lib/types";
import { cn, queryParams } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import dayjs from "dayjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CSSProperties, useEffect, useState } from "react";

interface Props {
  event: Event;
  containerHeight: number;
}

export default function Event({ event, containerHeight }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const [y, setY] = useState(
    dayjs(event.start).diff(dayjs(event.start).startOf("d"), "m") *
    pixelPerMinute,
  );
  const [dragOffset, setDragOffset] = useState(0);
  const height = dayjs(event.end).diff(event.start, "minute") * pixelPerMinute;
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
    height,
    touchAction: "none",
    opacity: isDragging ? 0.4 : undefined,
  };

  useEffect(() => {
    if (transform) {
      setDragOffset(transform.y);
    }
  }, [transform]);

  useEffect(() => {
    if (!isDragging) {
      setY((prevY: number) => {
        let res = prevY + dragOffset;

        res = res < 0 ? 0 : res;
        res = res > containerHeight ? containerHeight - 40 : res;

        return Math.floor(res / pixelPerQuarter) * pixelPerQuarter;
      });
    }
  }, [isDragging]);

  return (
    <span
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "absolute flex",
        "w-full bg-orange-500 bg-opacity-75",
        "flex-col px-1",
      )}
      style={style}
      onTouchEnd={() => {
        router.push(
          queryParams([], [], params.entries(), `${pathname}/edit/${event.id}`),
          {
            scroll: false,
          },
        );
      }}
      onDoubleClick={() => {
        router.push(
          queryParams([], [], params.entries(), `${pathname}/edit/${event.id}`),
          {
            scroll: false,
          },
        );
      }}>
      <p
        className={cn(
          "font-bold sm:block truncate",
          height === 15 * pixelPerMinute && "text-xs",
        )}>
        {event.title}
      </p>
      <p
        className={cn(
          "font-semibold text-xs",
          height === 0 ||
            height === 15 * pixelPerMinute ||
            height === 30 * pixelPerMinute
            ? "hidden"
            : "hidden lg:block",
        )}>
        {dayjs(event.start).format("HH:mm")}
        {" - "}
        {dayjs(event.end).format("HH:mm")}
      </p>
    </span>
  );
}
