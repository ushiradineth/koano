import AllDayEvent from "@/components/atoms/AllDayEvent";
import Event from "@/components/atoms/Event";
import Logo from "@/components/atoms/Logo";
import Day from "@/components/molecules/Day";
import dayjs from "@/lib/dayjs";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDebounceCallback, useWindowSize } from "usehooks-ts";

import { get as GetEvent } from "@/lib/api/event";
import { ErrorResponse } from "@/lib/api/types";
import {
  DATE_BUFFER_RANGE,
  DRAGGER_ID,
  GRID_HEIGHT,
  HEADER_HEIGHT,
  INITIAL_DATE_RANGE,
  PIXEL_PER_MINUTE,
  PIXEL_PER_QUARTER,
} from "@/lib/consts";
import { useContextStore } from "@/lib/stores/context";
import { useEventStore } from "@/lib/stores/event";
import { useSettingStore } from "@/lib/stores/settings";
import { Repeated } from "@/lib/types";
import {
  getPixelOffsetFromTime,
  getQuarter,
  getTimeFromPixelOffset,
} from "@/lib/utils";
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
  const [start, setStart] = useState({ x: -1, y: -1 });
  const [end, setEnd] = useState({ x: -1, y: -1 });
  const [preview, setPreview] = useState({ height: 0, top: 0 });
  const [clickPosition, setClickPosition] = useState({ x: -1, y: -1 });
  const [currentDragDay, setCurrentDragDay] = useState<Date | null>(null);

  const prevDayWidth = useRef(0);

  const { data: session, status } = useSession();
  const { events, setEvents, editEvent, removeEvent, getEventById } =
    useEventStore();
  const { settings } = useSettingStore();
  const {
    activeEvent,
    setActiveEvent,
    dragStart,
    setDragStart,
    dragEnd,
    setDragEnd,
    selecting,
    setSelecting,
    extending,
    setExtending,
    previewing,
    setPreviewing,
    setGlobalLoading,
  } = useContextStore();

  const { width: windowWidth } = useWindowSize({
    debounceDelay: 100,
    initializeWithValue: true,
  });
  const debouncedSetCurrentMonth = useDebounceCallback(setCurrentMonth, 100);

  const resetState = useCallback(() => {
    setStart({ x: -1, y: -1 });
    setEnd({ x: -1, y: -1 });
    setClickPosition({ x: -1, y: -1 });
    setPreview({ height: 0, top: 0 });
    setSelecting(false);
    setExtending(false);
    setPreviewing(false);
    setDragStart(null);
    setDragEnd(null);
    setCurrentDragDay(null);
  }, [
    setSelecting,
    setExtending,
    setPreviewing,
    setDragStart,
    setDragEnd,
    setCurrentDragDay,
  ]);

  const handleDayMouseDown = useCallback(
    (day: Date) => (mouseEvent: React.MouseEvent<HTMLDivElement>) => {
      if (selecting || extending || previewing) {
        resetState();
        setActiveEvent(null);
        return;
      }

      const rect = mouseEvent.currentTarget.getBoundingClientRect();
      const divX = mouseEvent.clientX - rect.left;
      const divY = Math.min(
        Math.max(mouseEvent.clientY - rect.top, -1),
        GRID_HEIGHT + 1,
      );

      setClickPosition({ x: divX, y: divY });
      setCurrentDragDay(day);

      const target = mouseEvent.target as any;
      const eventId = target.offsetParent?.id;

      if (eventId) {
        const event = getEventById(eventId);
        if (!event) {
          console.error(`Event ${eventId} not found`);
          setActiveEvent(null);
          return;
        }

        setActiveEvent(event);

        if ((target.id ?? "") === DRAGGER_ID) {
          setExtending(true);
        }

        return;
      }

      setActiveEvent(null);
      setDragStart(getTimeFromPixelOffset(divY, day));
      setDragEnd(getTimeFromPixelOffset(divY, day));
      setSelecting(dragging ? false : true);
    },
    [
      selecting,
      extending,
      previewing,
      dragging,
      resetState,
      setActiveEvent,
      getEventById,
      setExtending,
      setSelecting,
      setDragStart,
      setDragEnd,
    ],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (dragging || previewing || (!selecting && !extending)) return;

      const element = document.elementFromPoint(
        event.clientX,
        event.clientY,
      ) as HTMLElement | null;
      const container = element?.closest("[data-date]") as HTMLElement | null;
      if (!container) {
        resetState();
        return;
      }

      const day = new Date(container.dataset.date ?? "");
      setCurrentDragDay(day);
      const rect = container.getBoundingClientRect();
      const currentMouseX = event.clientX - rect.left;
      const currentMouseY = Math.min(
        Math.max(event.clientY - rect.top, -1),
        GRID_HEIGHT + 1,
      );

      if (selecting || extending) {
        if (currentMouseY < clickPosition.y) {
          setStart({ x: currentMouseX, y: currentMouseY });
          setEnd(clickPosition);
        } else {
          setStart(clickPosition);
          setEnd({ x: currentMouseX, y: currentMouseY });
        }
      }

      if (selecting) {
        if (currentMouseY < clickPosition.y) {
          const previewHeight = getQuarter(
            Math.max(clickPosition.y - currentMouseY, PIXEL_PER_QUARTER),
          );
          setPreview({
            height: previewHeight,
            top: getQuarter(clickPosition.y - previewHeight),
          });
        } else {
          setPreview({
            height: getQuarter(
              Math.max(currentMouseY - clickPosition.y, PIXEL_PER_QUARTER),
            ),
            top: getQuarter(clickPosition.y),
          });
        }
        setDragEnd(getTimeFromPixelOffset(currentMouseY, day));
        return;
      }

      if (extending && activeEvent) {
        const startOffset = getPixelOffsetFromTime(activeEvent.start_time, day);
        const endOffset = getPixelOffsetFromTime(activeEvent.end_time, day);
        const currentMouseQuarter = getQuarter(currentMouseY);
        const clickPositionQuarter = getQuarter(clickPosition.y);
        const anchorOffset =
          clickPositionQuarter === startOffset
            ? Math.abs(endOffset - clickPositionQuarter) <= 15
              ? startOffset
              : endOffset
            : startOffset;
        const previewHeight = getQuarter(anchorOffset - currentMouseQuarter);
        const top = Math.min(anchorOffset - previewHeight, anchorOffset);
        const height = Math.abs(previewHeight);

        top + height !== GRID_HEIGHT && setPreview({ height, top });
        setDragEnd(getTimeFromPixelOffset(top + height, day));
        return;
      }

      resetState();
    },
    [
      dragging,
      previewing,
      selecting,
      extending,
      clickPosition,
      activeEvent,
      resetState,
      setDragEnd,
      setCurrentDragDay,
    ],
  );

  const handleMouseUp = useCallback(() => {
    if (start.y === -1 || end.y === -1) {
      resetState();
      return;
    }

    if (selecting && !dragging && dragStart && dragEnd) {
      if (start.y === end.y) {
        resetState();
        return;
      }

      const eventStart = dayjs(dragStart).isBefore(dayjs(dragEnd))
        ? dragStart
        : dragEnd;
      const eventEnd = dayjs(dragStart).isBefore(dayjs(dragEnd))
        ? dragEnd
        : dragStart;

      setActiveEvent({
        id: String(window.performance.now()),
        title: "",
        start_time: eventStart,
        end_time:
          dayjs(eventEnd).diff(eventStart, "minute") < PIXEL_PER_QUARTER
            ? dayjs(eventStart).add(PIXEL_PER_QUARTER, "minute").toDate()
            : eventEnd,
        repeated: Repeated.Never,
        timezone: settings.timezone,
      });

      setSelecting(false);
      setExtending(false);
      setPreviewing(true);
      return;
    }

    if (extending && activeEvent && dragStart && dragEnd) {
      const eventStart = dayjs(dragStart).isBefore(dayjs(dragEnd))
        ? dragStart
        : dragEnd;
      const eventEnd = dayjs(dragStart).isBefore(dayjs(dragEnd))
        ? dragEnd
        : dragStart;

      editEvent({ ...activeEvent, start_time: eventStart, end_time: eventEnd });
    }

    resetState();
  }, [
    start,
    end,
    dragStart,
    dragEnd,
    selecting,
    dragging,
    extending,
    activeEvent,
    editEvent,
    setActiveEvent,
    settings.timezone,
    resetState,
    setSelecting,
    setExtending,
    setPreviewing,
  ]);

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
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onScroll={gridRef.current ? debouncedHandleScroll : undefined}>
        {dayWidth === 0 || isLoadingEvents ? (
          <div
            style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}
            className="flex w-full items-center justify-center">
            <Logo />
          </div>
        ) : (
          days.map((date: Date) => {
            const dayStart = dayjs(date).startOf("day");
            const dayEnd = dayStart.add(1, "day");
            const normalEvents = events
              .filter(
                (e) =>
                  dayjs(e.start_time).isBefore(dayEnd) &&
                  dayjs(e.end_time).isAfter(dayStart) &&
                  dayjs(e.end_time).diff(e.start_time, "hour") < 24,
              )
              .map((e) => ({
                ...e,
                start_time: dayjs(e.start_time).isAfter(dayStart)
                  ? e.start_time
                  : dayStart.toDate(),
                end_time: dayjs(e.end_time).isBefore(dayEnd)
                  ? e.end_time
                  : dayEnd.toDate(),
              }));
            const allDayEvents = events.filter(
              (e) =>
                dayjs(e.end_time).diff(e.start_time, "hour") >= 24 &&
                dayjs(e.start_time).isBefore(dayEnd) &&
                dayjs(e.end_time).isAfter(dayStart),
            );
            return (
              <Day
                key={date.toString()}
                id={date.toString()}
                height={GRID_HEIGHT}
                width={dayWidth}
                dragging={dragging}
                onMouseDown={handleDayMouseDown(date)}
                preview={
                  currentDragDay && dayjs(currentDragDay).isSame(dayStart)
                    ? preview
                    : undefined
                }
                showPreview={
                  !!(
                    currentDragDay &&
                    dayjs(currentDragDay).isSame(dayStart) &&
                    (selecting || extending || previewing)
                  )
                }
                previewTitle={activeEvent?.title}
                day={dayjs(date).startOf("day").toDate()}>
                {allDayEvents.map((ev) => (
                  <AllDayEvent key={ev.id} event={ev} />
                ))}
                {normalEvents.map((event) => (
                  <Event
                    key={event.id}
                    event={event}
                    active={event.id === activeEvent?.id}
                  />
                ))}
              </Day>
            );
          })
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
