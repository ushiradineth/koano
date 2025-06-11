"use client";

import { DRAGGER_ID, PIXEL_PER_MINUTE, PIXEL_PER_QUARTER } from "@/lib/consts";
import { useInteractionStore } from "@/lib/stores/interactions";
import { useSettingStore } from "@/lib/stores/settings";
import { EventRender, Event as EventType } from "@/lib/types";
import { cn, generateEventTime } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { CSSProperties, useEffect, useMemo, useState } from "react";

interface Props {
  event: EventType;
  render: EventRender;
  active: boolean;
}

export default function Event({ event, active, render }: Props) {
  const [top, setTop] = useState(0);
  const [eventTime, setEventTime] = useState("");
  const [height, setHeight] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const { settings } = useSettingStore();
  const {
    extending,
    modifierKeyPressed,
    selectedEvents,
    setActiveEvent,
    setSelectedEvents,
    isEventSelected,
    toggleSelectedEvent,
  } = useInteractionStore();

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

  const isSelected = useMemo(
    () => isEventSelected(event.id),
    // This memo needs to be updated when selectedEvents changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [event, selectedEvents, isEventSelected],
  );

  const style: CSSProperties = useMemo(() => {
    return {
      transform: transform
        ? `translate3d(${transform.x}px, ${transform.y + top}px, 0)`
        : `translate3d(0px, ${top}px, 0)`,
      position: "absolute",
      height: Math.max(height, PIXEL_PER_QUARTER),
      touchAction: "none",
      opacity: isDragging ? 0.4 : undefined,
      zIndex: isDragging ? 10 : undefined,
    };
  }, [transform, top, height, isDragging]);

  useEffect(() => {
    setTop(render.top);
    setHeight(render.height);
  }, [render]);

  useEffect(() => {
    setEventTime(
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
        "relative flex flex-col rounded-sm border-[1px] border-l-4 border-slate-900 border-l-orange-300",
        active || isSelected ? "z-10 bg-orange-300" : "bg-orange-500",
      )}
      style={{ ...style, width: render.width, left: render.left }}>
      <Dragger className="top-0" compact={height <= 30 * PIXEL_PER_MINUTE} />
      <span
        className={cn(
          "flex h-full font-medium text-foreground",
          isDragging
            ? "cursor-grabbing"
            : active
              ? "cursor-grab"
              : "cursor-default",
          height > 30 * PIXEL_PER_MINUTE ? "p-1" : "px-1",
          height <= 15 * PIXEL_PER_MINUTE
            ? "flex-row items-center gap-2 truncate"
            : "flex-col",
        )}
        onMouseDown={() => {
          // If the user is holding the modifier key, remove the active event and toggle the clicked event
          if (modifierKeyPressed) {
            setActiveEvent(null);
            toggleSelectedEvent(event);
            // If not, set the active event and set the clicked event as the only selected event
          } else {
            setActiveEvent(event);
            setSelectedEvents([event]);
          }
        }}
        {...listeners}
        {...attributes}>
        <p
          className={cn(
            "truncate text-sm",
            extending ? "opacity-50" : "opacity-75",
          )}>
          {event.title}
        </p>
        <p className={cn("text-xs", extending ? "opacity-50" : "opacity-75")}>
          {eventTime}
        </p>
      </span>
      <Dragger className="bottom-0" compact={height <= 30 * PIXEL_PER_MINUTE} />
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
      id={DRAGGER_ID}
      style={{
        height: compact ? PIXEL_PER_MINUTE * 2.5 : PIXEL_PER_QUARTER,
      }}
      className={cn(
        "absolute flex w-full cursor-row-resize items-center justify-center",
        className,
      )}
    />
  );
}
