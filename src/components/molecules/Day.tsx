import Event from "@/components/atoms/Event";
import PreviewEvent from "@/components/atoms/PreviewEvent";
import Time from "@/components/atoms/Time";
import {
  HEADER_HEIGHT,
  PIXEL_PER_HOUR,
  SECONDARY_HEADER_HEIGHT,
} from "@/lib/consts";
import dayjs from "@/lib/dayjs";
import { useEventStore } from "@/lib/stores/event";
import { EventRender, Event as EventType } from "@/lib/types";
import { cn, getDayObjectWithDate, getPixelOffsetFromTime } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { memo, useMemo } from "react";

import { useInteractionStore } from "@/lib/stores/interactions";
import { useShallow } from "zustand/shallow";

interface Props {
  id: string;
  height: number;
  width: number;
  day: Date;
  onMouseDown: (event: React.MouseEvent<HTMLDivElement>, day: Date) => void;
  onMouseMove: (event: React.MouseEvent<HTMLDivElement>, day: Date) => void;
  onMouseUp: (event: React.MouseEvent<HTMLDivElement>, day: Date) => void;
}

type Bucket = Array<{ event: EventType; render: EventRender }>;

export default memo(function Day({
  id,
  height,
  width,
  day,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: Props) {
  const { activeEvent, preview } = useInteractionStore();
  const selectEvents = useShallow((state: any) => state.events);
  const events = useEventStore(selectEvents);

  const dayObject = useMemo(() => getDayObjectWithDate(day), [day]);
  const today = useMemo(
    () => dayjs().startOf("day").isSame(dayjs(day).startOf("day")),
    [day],
  );

  const { setNodeRef } = useDroppable({
    id,
  });

  const bucket: Bucket = useMemo(() => {
    const startOfDay = dayjs(day).startOf("day");
    const endOfDay = dayjs(day).endOf("day");

    return (
      events
        // only keep events that overlap this day at all
        .filter((e: EventType) => {
          const s0 = dayjs(e.start_time);
          const t0 = dayjs(e.end_time);
          return s0.isBefore(endOfDay) && t0.isAfter(startOfDay);
        })
        .map((e: EventType) => {
          const origStart = dayjs(e.start_time);
          const origEnd = dayjs(e.end_time);

          // clamp to this day's window
          const s = origStart.isBefore(startOfDay) ? startOfDay : origStart;
          const t = origEnd.isAfter(endOfDay) ? endOfDay : origEnd;

          // compute render offsets in minutes since midnight
          const top = getPixelOffsetFromTime(s.toDate(), day);
          const height = getPixelOffsetFromTime(t.toDate(), day) - top;

          return {
            event: e,
            render: {
              top,
              height,
            },
          };
        })
        .sort((a: EventType, b: EventType) => {
          const sa = dayjs(a.start_time).valueOf();
          const sb = dayjs(b.start_time).valueOf();
          if (sa !== sb) return sa - sb;

          const da = dayjs(a.end_time).diff(dayjs(a.start_time));
          const db = dayjs(b.end_time).diff(dayjs(b.start_time));
          return db - da; // longer events underneath
        })
    );
  }, [events, day]);

  return (
    <div
      id={`${dayObject.day}-${dayObject.date}-${dayObject.month}-${dayObject.year}-${dayObject.week}`}
      style={{ marginTop: HEADER_HEIGHT }}>
      <span
        style={{ height: SECONDARY_HEADER_HEIGHT }}
        className="sticky flex w-full flex-row items-center justify-center gap-1 border-b text-sm font-bold">
        <p>{dayObject.day}</p>
        <p className={cn(today && "rounded-sm bg-[#EF4B46] px-1")}>
          {dayObject.date}
        </p>
      </span>
      <div
        onMouseDown={(event) => onMouseDown(event, day)}
        onMouseMove={(event) => onMouseMove(event, day)}
        onMouseUp={(event) => onMouseUp(event, day)}
        ref={setNodeRef}
        style={{
          height,
          width,
          backgroundImage:
            "linear-gradient(to bottom, hsl(var(--border)/20) 1px, transparent 1px)",
          backgroundSize: `100% ${PIXEL_PER_HOUR}px`,
          backgroundPosition: `0 ${PIXEL_PER_HOUR}px`,
        }}
        className="relative flex snap-start flex-col items-center justify-between gap-2 border-x border-b border-border/20">
        <Time today={today} />

        {preview && (
          <PreviewEvent
            preview={preview}
            day={day}
            title={activeEvent?.title ?? ""}
          />
        )}

        <div className="flex w-full items-start">
          {bucket.map((item) => (
            <Event
              key={item.event.id}
              event={item.event}
              render={item.render}
              active={activeEvent?.id === item.event.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
