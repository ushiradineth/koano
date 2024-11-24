import Event from "@/components/atoms/Event";
import Logo from "@/components/atoms/Logo";
import Day from "@/components/molecules/Day";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDebounceCallback, useWindowSize } from "usehooks-ts";

import { gridHeight, headerHeight, pixelPerMinute } from "@/lib/consts";
import { useContextStore } from "@/lib/stores/context";
import { useEventStore } from "@/lib/stores/event";
import { useSettingStore } from "@/lib/stores/settings";
import { getQuarter } from "@/lib/utils";

interface Props {
  gridRef: React.RefObject<HTMLDivElement>;
  scrollToCurrentDate: () => void;
  setCurrentMonth: () => void;
}

export default function Grid({
  gridRef,
  scrollToCurrentDate,
  setCurrentMonth,
}: Props) {
  const [days, setDays] = useState<Date[]>([]);
  const [dayWidth, setDayWidth] = useState(0);
  const [dragging, setDragging] = useState(false);

  const prevDayWidth = useRef(0);
  const { events, editEvent, getEventById } = useEventStore();
  const { settings } = useSettingStore();
  const {
    activeEvent,
    setActiveEvent,
    setSelecting,
    setExtending,
    setPreviewing,
  } = useContextStore();

  const { width: windowWidth } = useWindowSize({
    debounceDelay: 100,
    initializeWithValue: true,
  });
  const debouncedSetCurrentMonth = useDebounceCallback(setCurrentMonth, 100);

  const initialRange = 60;
  const bufferRange = 30;

  const handleScroll = useCallback(() => {
    debouncedSetCurrentMonth();

    if (gridRef.current) {
      const scrollPosition = gridRef.current.scrollLeft;
      const maxScroll =
        gridRef.current.scrollWidth - gridRef.current.clientWidth;

      // If the user is close to the right end (future dates), add more future days
      if (scrollPosition > maxScroll - dayWidth * 5) {
        const lastDay = days[days.length - 1];
        const newDays = getDateRange(
          dayjs(lastDay).add(1, "day").toDate(),
          dayjs(lastDay).add(bufferRange, "day").toDate(),
        );
        setDays((prevDays) => [...prevDays, ...newDays]);
      }

      // If the user is close to the left end (past dates), add more past days
      if (scrollPosition < dayWidth * 5) {
        const firstDay = days[0];
        const newDays = getDateRange(
          dayjs(firstDay).subtract(bufferRange, "day").toDate(),
          dayjs(firstDay).subtract(1, "day").toDate(),
        );
        setDays((prevDays) => [...newDays, ...prevDays]);
      }
    }
  }, [days, dayWidth, debouncedSetCurrentMonth, gridRef]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { over, active } = event;

      if (over) {
        const eventId = active.id as string;
        const event = getEventById(eventId);

        if (!event) {
          setActiveEvent(null);
          return;
        }

        const pixelOffset = active.data.current?.y * pixelPerMinute ?? 0;
        const start = getTimeFromYOffsetAndTime(
          pixelOffset,
          event.start,
          new Date(over.id),
        );
        const end = getTimeFromYOffsetAndTime(
          pixelOffset,
          event.end,
          new Date(over.id),
        );

        if (
          dayjs(start).isSame(dayjs(event.start)) &&
          dayjs(end).isSame(dayjs(event.end))
        )
          return;

        editEvent({ ...event, start, end });
      }

      setDragging(false);
    },
    [getEventById, editEvent, setActiveEvent],
  );

  useEffect(() => {
    if (prevDayWidth.current === 0) {
      prevDayWidth.current = dayWidth;
      scrollToCurrentDate();
    }
  }, [dayWidth, scrollToCurrentDate]);

  useEffect(() => {
    if (gridRef.current) {
      const newDayWidth = gridRef.current.offsetWidth / settings.view;
      prevDayWidth.current = dayWidth; // Update previous value
      setDayWidth(newDayWidth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.view, windowWidth]);

  useEffect(() => {
    const currentDay = dayjs().startOf("day").toDate();
    const initialDays = getDateRange(
      dayjs(currentDay).subtract(initialRange, "day").toDate(),
      dayjs(currentDay).add(initialRange, "day").toDate(),
    );

    setDays(initialDays);
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelecting(false);
        setExtending(false);
        setPreviewing(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [setSelecting, setExtending, setPreviewing]);

  return (
    <DndContext
      onDragStart={() => setDragging(true)}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}>
      <div
        className="flex w-full scroll-smooth snap-x snap-mandatory overflow-scroll no-scrollbar"
        ref={gridRef}
        onScroll={gridRef.current ? handleScroll : undefined}>
        {dayWidth === 0 ? (
          <div
            style={{ height: `calc(100vh - ${headerHeight}px)` }}
            className="flex w-full justify-center items-center">
            <Logo />
          </div>
        ) : (
          days.map((date: Date) => (
            <Day
              key={date.toString()}
              id={date.toString()}
              height={gridHeight}
              width={dayWidth}
              dragging={dragging}
              day={dayjs(date).startOf("day").toDate()}>
              {events
                .filter(
                  (event) =>
                    dayjs(event.start).format("DD/MM/YYYY") ===
                    dayjs(date).format("DD/MM/YYYY"),
                )
                .map((event) => (
                  <Event
                    key={event.id}
                    event={event}
                    active={event.id === activeEvent?.id}
                  />
                ))}
            </Day>
          ))
        )}
      </div>
    </DndContext>
  );
}

export function getTimeFromYOffsetAndTime(
  offset: number,
  time: Date,
  day: Date,
): Date {
  const minutes = getQuarter(offset * pixelPerMinute);

  const i = dayjs(time)
    .set("date", dayjs(day).date())
    .set("month", dayjs(day).month())
    .set("year", dayjs(day).year())
    .add(minutes, "minute")
    .toDate();

  return i;
}

function getDateRange(startDate: Date, endDate: Date): Date[] {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const dateRange: Date[] = [];

  for (
    let current = start;
    current.isBefore(end) || current.isSame(end);
    current = current.add(1, "day")
  ) {
    dateRange.push(current.toDate());
  }

  return dateRange;
}
