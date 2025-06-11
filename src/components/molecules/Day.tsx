import Event from "@/components/atoms/Event";
import PreviewEvent from "@/components/atoms/PreviewEvent";
import Time from "@/components/atoms/Time";
import {
  HEADER_HEIGHT,
  PIXEL_PER_HOUR,
  PIXEL_PER_QUARTER,
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

type RenderableEvent = {
  event: EventType;
  render: EventRender;
};

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

  const startOfCurrentDay = useMemo(() => dayjs(day).startOf("day"), [day]);
  const endOfCurrentDay = useMemo(() => dayjs(day).endOf("day"), [day]);

  // Filter out events that don't overlap this day and shape into a renderable event array
  const filteredEvents: RenderableEvent[] = useMemo(() => {
    const startOfCurrentDay = dayjs(day).startOf("day");
    const endOfCurrentDay = dayjs(day).endOf("day");

    return (
      events
        .filter((event: EventType) => {
          return (
            // Event should start before the end of the current day
            dayjs(event.start_time).isBefore(endOfCurrentDay) &&
            // Event should end after the start of the current day
            dayjs(event.end_time).isAfter(startOfCurrentDay)
          );
        })
        // Sort events by start time, and then length of the event
        .sort((a: EventType, b: EventType) => {
          // Sort based on start time
          const startA = dayjs(a.start_time).valueOf();
          const startB = dayjs(b.start_time).valueOf();
          if (startA !== startB) {
            return startA - startB; // earlier start → lower index
          }

          // Sort based on duration if start times are equal
          const durationA = dayjs(a.end_time).valueOf() - startA;
          const durationB = dayjs(b.end_time).valueOf() - startB;
          return durationB - durationA; // longer duration → lower index
        })
        .map((event: EventType) => {
          return {
            event,
            render: {
              top: 0,
              height: 0,
            },
          };
        })
    );
  }, [day, events]);

  // Compute the postional data for the events
  const renderableEvents: RenderableEvent[] = useMemo(() => {
    // The width of the day component, which is the width of the container for events
    const containerWidth = width;

    // For cluster overlapping events to calculate the left and width of relative previews
    const clusters: RenderableEvent[][] = [];
    for (const re of filteredEvents) {
      // --- Start Generate top and height for the event
      const eventStart = dayjs(re.event.start_time);
      const eventEnd = dayjs(re.event.end_time);

      // If the event starts before the current day, set the start to the start of the current day
      const relativeEventStart = eventStart.isBefore(startOfCurrentDay)
        ? startOfCurrentDay
        : eventStart;

      // If the event ends after the current day, set the end to the end of the current day
      const relativeEventEnd = eventEnd.isAfter(endOfCurrentDay)
        ? endOfCurrentDay
        : eventEnd;

      const top = getPixelOffsetFromTime(relativeEventStart.toDate(), day);
      const height =
        getPixelOffsetFromTime(relativeEventEnd.toDate(), day) - top;

      re.render.top = top;
      re.render.height = height;
      // --- End of generating height and top for the event

      // --- Start cluster the event if an overlapping cluster, create a new cluster if not
      let overlapped = false;

      for (const cluster of clusters) {
        // Add to existing cluster if it overlaps
        if (
          cluster.some((other) => {
            const aStart = re.render.top;
            const aEnd = re.render.top + re.render.height;
            const bStart = other.render.top;
            const bEnd = other.render.top + other.render.height;
            return !(aEnd <= bStart || aStart >= bEnd);
          })
        ) {
          cluster.push(re);
          overlapped = true;
          break;
        }
      }

      // Add to new cluster if none overlap
      if (!overlapped) {
        clusters.push([re]);
      }
      // --- End of clustering the event
    }

    // --- Start of generating left and width for the cluster
    const positioned: RenderableEvent[] = [];
    clusters.forEach((cluster) => {
      // Sort by start (just to be deterministic)
      cluster.sort((x, y) => x.render.top - y.render.top);

      const cols: RenderableEvent[][] = [];

      // Separate the events in the cluster into columns based on the top of the event
      cluster.forEach((re) => {
        let placed = false;

        // Go through each columns to check if the event can be pushed to the end of the column
        for (const col of cols) {
          const last = col[col.length - 1];
          const lastEnd = last.render.top + last.render.height;
          if (re.render.top >= lastEnd) {
            col.push(re);
            placed = true;
            break;
          }
        }

        // If not, create a new column with the event
        if (!placed) {
          cols.push([re]);
        }
      });

      // Set an offset to leave space for user to start a selection, or for a user to be able to drag the event without overlapping
      const offset = Math.min(PIXEL_PER_QUARTER, containerWidth / cols.length);
      const colWidth = containerWidth - offset;

      cols.forEach((col, colIndex) => {
        col.forEach((re) => {
          re.render.left = offset * colIndex;
          re.render.width = colWidth - offset * colIndex;
        });
      });

      positioned.push(...cluster);
    });

    return positioned;
  }, [day, filteredEvents, startOfCurrentDay, endOfCurrentDay, width]);

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
          {renderableEvents.map((item) => (
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
