import Event from "@/components/atoms/Event";
import Logo from "@/components/atoms/Logo";
import Day from "@/components/molecules/Day";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import dayjs from "@/lib/dayjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDebounceCallback, useWindowSize } from "usehooks-ts";

import { get as GetEvent } from "@/lib/api/event";
import { ErrorResponse } from "@/lib/api/types";
import {
  DATE_BUFFER_RANGE,
  GRID_HEIGHT,
  HEADER_HEIGHT,
  INITIAL_DATE_RANGE,
  PIXEL_PER_MINUTE,
} from "@/lib/consts";
import { useContextStore } from "@/lib/stores/context";
import { useEventStore } from "@/lib/stores/event";
import { useSettingStore } from "@/lib/stores/settings";
import { getQuarter } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

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

  const { data: session, status } = useSession();
  const { events, setEvents, editEvent, removeEvent, getEventById } =
    useEventStore();
  const { settings } = useSettingStore();
  const {
    activeEvent,
    setActiveEvent,
    setSelecting,
    setExtending,
    setPreviewing,
    setGlobalLoading,
  } = useContextStore();

  const { width: windowWidth } = useWindowSize({
    debounceDelay: 100,
    initializeWithValue: true,
  });
  const debouncedSetCurrentMonth = useDebounceCallback(setCurrentMonth, 100);

  const {
    data,
    isLoading: isLoadingEvents,
    isError,
  } = useQuery({
    queryKey: ["events", session?.user?.access_token], // Unique cache key
    queryFn: () =>
      GetEvent({
        start_day: dayjs()
          .startOf("day")
          .subtract(DATE_BUFFER_RANGE, "day")
          .format("YYYY-MM-DD"),
        end_day: dayjs()
          .startOf("day")
          .add(DATE_BUFFER_RANGE, "day")
          .format("YYYY-MM-DD"),
        access_token: session?.user?.access_token ?? "",
      }),
    enabled: status === "authenticated",
    staleTime: 1000, // Refresh data every 10 second
  });

  useEffect(() => {
    if (data) {
      setEvents(data.data);
      if (prevDayWidth.current === 0) {
        prevDayWidth.current = dayWidth;
        scrollToCurrentDate();
      }
    }
  }, [data, setEvents, dayWidth, scrollToCurrentDate]);

  useEffect(() => {
    const dateRange = INITIAL_DATE_RANGE / 2;
    const currentDay = dayjs().startOf("day").toDate();
    const initialDays = getDateRange(
      dayjs(currentDay).subtract(dateRange, "day").toDate(),
      dayjs(currentDay).add(dateRange, "day").toDate(),
    );

    setDays(initialDays);
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || !isError) return;
    toast.error(
      (data as any as ErrorResponse).error ?? "Failed to fetch events",
    );
  }, [isError, data, status]);

  const debouncedHandleScroll = useDebounceCallback(
    useCallback(async () => {
      setGlobalLoading(true);
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
            dayjs(lastDay).add(DATE_BUFFER_RANGE, "day").toDate(),
          );
          setDays((prevDays) => [...prevDays, ...newDays]);

          const { data } = await GetEvent({
            start_day: dayjs(lastDay)
              .startOf("day")
              .add(1, "day")
              .format("YYYY-MM-DD"),
            end_day: dayjs(lastDay)
              .startOf("day")
              .add(DATE_BUFFER_RANGE, "day")
              .format("YYYY-MM-DD"),
            access_token: session?.user?.access_token ?? "",
          });

          setEvents([...events, ...data]);
        }

        // If the user is close to the left end (past dates), add more past days
        if (scrollPosition < dayWidth * 5) {
          const firstDay = days[0];
          const newDays = getDateRange(
            dayjs(firstDay).subtract(DATE_BUFFER_RANGE, "day").toDate(),
            dayjs(firstDay).subtract(1, "day").toDate(),
          );
          setDays((prevDays) => [...newDays, ...prevDays]);

          const { data } = await GetEvent({
            start_day: dayjs(firstDay)
              .startOf("day")
              .subtract(DATE_BUFFER_RANGE, "day")
              .format("YYYY-MM-DD"),
            end_day: dayjs(firstDay)
              .startOf("day")
              .subtract(1, "day")
              .format("YYYY-MM-DD"),
            access_token: session?.user?.access_token ?? "",
          });

          setEvents([...data, ...events]);
        }
      }
      setGlobalLoading(false);
    }, [
      days,
      dayWidth,
      debouncedSetCurrentMonth,
      gridRef,
      session,
      events,
      setEvents,
      setGlobalLoading,
    ]),
    100,
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { over, active } = event;

      if (over) {
        const eventId = active.id as string;
        const event = getEventById(eventId);

        if (!event) {
          setActiveEvent(null);
          setDragging(false);
          return;
        }

        const pixelOffset = active.data.current?.y * PIXEL_PER_MINUTE;
        const start_time = getTimeFromYOffsetAndTime(
          pixelOffset,
          event.start_time,
          new Date(over.id),
        );
        const end_time = getTimeFromYOffsetAndTime(
          pixelOffset,
          event.end_time,
          new Date(over.id),
        );

        if (
          dayjs(start_time).isSame(dayjs(event.start_time)) &&
          dayjs(end_time).isSame(dayjs(event.end_time))
        ) {
          setDragging(false);
          return;
        }

        if (
          dayjs(start_time).format("MM/DD/YYYY") !==
            dayjs(end_time).format("MM/DD/YYYY") &&
          dayjs(end_time).format("h:mm A") !== "12:00 AM"
        ) {
          setDragging(false);
          return;
        }

        editEvent({ ...event, start_time, end_time });
      }

      setDragging(false);
    },
    [getEventById, editEvent, setActiveEvent],
  );

  useEffect(() => {
    if (gridRef.current) {
      const newDayWidth = gridRef.current.offsetWidth / settings.view;
      prevDayWidth.current = dayWidth; // Update previous value
      setDayWidth(newDayWidth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.view, windowWidth]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelecting(false);
        setExtending(false);
        setPreviewing(false);
        setActiveEvent(null);
      }

      if (event.key === "Backspace") {
        if (activeEvent) {
          removeEvent(activeEvent.id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [
    activeEvent,
    setSelecting,
    setExtending,
    setPreviewing,
    removeEvent,
    setActiveEvent,
  ]);

  return (
    <DndContext
      onDragStart={() => setDragging(true)}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}>
      <div
        className="no-scrollbar flex w-full snap-x snap-mandatory overflow-scroll scroll-smooth"
        ref={gridRef}
        onScroll={gridRef.current ? debouncedHandleScroll : undefined}>
        {dayWidth === 0 || isLoadingEvents ? (
          <div
            style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}
            className="flex w-full items-center justify-center">
            <Logo />
          </div>
        ) : (
          days.map((date: Date) => (
            <Day
              key={date.toString()}
              id={date.toString()}
              height={GRID_HEIGHT}
              width={dayWidth}
              dragging={dragging}
              day={dayjs(date).startOf("day").toDate()}>
              {events.length > 0 &&
                events
                  .filter(
                    (event) =>
                      dayjs(event.start_time).format("DD/MM/YYYY") ===
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
  const minutes = getQuarter(offset * PIXEL_PER_MINUTE);

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
