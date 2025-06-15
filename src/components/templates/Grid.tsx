import Logo from "@/components/atoms/Logo";
import Day from "@/components/molecules/Day";
import dayjs from "@/lib/dayjs";
import { DndContext, type DragEndEvent, closestCenter } from "@dnd-kit/core";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounceCallback, useWindowSize } from "usehooks-ts";

import { get as GetEvent } from "@/lib/api/event";
import type { ErrorResponse } from "@/lib/api/types";
import {
  DATE_BUFFER_RANGE,
  DRAGGER_ID,
  GRID_HEIGHT,
  HEADER_HEIGHT,
  INITIAL_DATE_RANGE,
  PIXEL_PER_MINUTE,
} from "@/lib/consts";
import { useEventStore } from "@/lib/stores/event";
import { useGlobalStore } from "@/lib/stores/global";
import { useInteractionStore } from "@/lib/stores/interactions";
import { useSettingStore } from "@/lib/stores/settings";
import { Repeated } from "@/lib/types";
import {
  getPixelOffsetFromTime,
  getQuarter,
  getTimeFromPixelOffset,
  isModifierKey,
} from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface Props {
  gridRef: React.RefObject<HTMLDivElement>;
  scrollToCurrentDate: () => void;
  setCurrentMonth: () => void;
}

interface MouseEventTarget extends EventTarget {
  id?: string;
  offsetParent?: HTMLElement;
}

export default function Grid({
  gridRef,
  scrollToCurrentDate,
  setCurrentMonth,
}: Props) {
  const [days, setDays] = useState<Date[]>([]);
  const [dayWidth, setDayWidth] = useState(0);
  const [gridFocused, setGridFocused] = useState(false);

  // Dragging State from DndContext
  const [dragging, setDragging] = useState(false);

  // Initial Click Position and Day for Selection and Extending
  const [clickPosition, setClickPosition] = useState({ x: -1, y: -1 });
  const [clickDay, setClickDay] = useState<Date | null>(null);

  const prevDayWidth = useRef(0);

  const { data: session, status } = useSession();
  const { events, addEvent, setEvents, editEvent, removeEvent, getEventById } =
    useEventStore();
  const { settings } = useSettingStore();
  const {
    activeEvent,
    setActiveEvent,
    selecting,
    setSelecting,
    extending,
    setExtending,
    preview,
    setPreview,
    copiedEvents,
    setCopiedEvents,
    selectedEvents,
    setSelectedEvents,
    modifierKeyPressed,
    setModifierKeyPressed,
  } = useInteractionStore();
  const { setGlobalLoading } = useGlobalStore();

  const { width: windowWidth } = useWindowSize({
    debounceDelay: 100,
    initializeWithValue: true,
  });
  const debouncedSetCurrentMonth = useDebounceCallback(setCurrentMonth, 100);

  const {
    data,
    isLoading: isLoadingEvents,
    isError,
    isSuccess,
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

  // Set the initial days to display
  useEffect(() => {
    const dateRange = INITIAL_DATE_RANGE / 2;
    const currentDay = dayjs().startOf("day").toDate();
    const initialDays = getDateRange(
      dayjs(currentDay).subtract(dateRange, "day").toDate(),
      dayjs(currentDay).add(dateRange, "day").toDate(),
    );

    setDays(initialDays);
  }, []);

  // Set initially fetched events, should only be called when the data is changed or isSuccess is true
  //
  // biome-ignore lint/correctness/useExhaustiveDependencies: This effect should only run when isSuccess or data changes
  useEffect(() => {
    if (isSuccess && data) {
      setEvents(data.data);
      if (prevDayWidth.current === 0) {
        prevDayWidth.current = dayWidth;
        scrollToCurrentDate();
      }
    }
  }, [isSuccess, data]);

  // Handle errors with the initial fetch
  useEffect(() => {
    if (status !== "authenticated" || !isError) return;
    toast.error(
      (data as unknown as ErrorResponse).error ?? "Failed to fetch events",
    );
  }, [status, isError, data]);

  // Dynamically update the day width when the view or windowWidth changes
  //
  // biome-ignore lint/correctness/useExhaustiveDependencies: This effect should only run when settings.view or windowWidth changes
  useEffect(() => {
    if (gridRef.current) {
      const newDayWidth = gridRef.current.offsetWidth / settings.view;
      prevDayWidth.current = dayWidth; // Update previous value
      setDayWidth(newDayWidth);
    }
  }, [settings.view, windowWidth]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Get OS modifier key, either Cmd (Mac) or Ctrl (Windows/Linux)
      const isModKeyPressed = isModifierKey(event);

      if (event.key === "Escape") {
        setSelecting(false);
        setExtending(false);
        setPreview(null);
        setActiveEvent(null);
        setCopiedEvents([]);
        setSelectedEvents([]);
      }

      // When pressing Ctrl/Cmd
      if (isModKeyPressed) {
        setModifierKeyPressed(true);
      }

      // Copy selected events, or the active event
      if (modifierKeyPressed && event.key.toLowerCase() === "c") {
        event.preventDefault();
        setCopiedEvents(
          selectedEvents.length > 0
            ? selectedEvents
            : activeEvent
              ? [activeEvent]
              : [],
        );
        setSelectedEvents([]);
      }

      // Paste copied events
      if (modifierKeyPressed && event.key.toLowerCase() === "v") {
        event.preventDefault();
        for (const event of copiedEvents) {
          addEvent(event);
        }
      }

      // Delete selected events
      if (event.key === "Backspace") {
        for (const event of selectedEvents) {
          removeEvent(event.id);
        }
        setSelectedEvents([]);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (modifierKeyPressed) {
        setModifierKeyPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    gridFocused,
    modifierKeyPressed,
    selectedEvents,
    copiedEvents,
    activeEvent,
    addEvent,
    removeEvent,
    setCopiedEvents,
    setSelectedEvents,
    setModifierKeyPressed,
    setSelecting,
    setExtending,
    setPreview,
    setActiveEvent,
  ]);

  useEffect(() => console.log(modifierKeyPressed), [modifierKeyPressed]);
  useEffect(() => console.log(selectedEvents), [selectedEvents]);

  // Fetch events when the user scrolls beyond the rendered days
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
      session,
      events,
      gridRef,
      setEvents,
      setGlobalLoading,
    ]),
    100,
  );

  // Handle dragging an event
  const handleDndContextDragEnd = useCallback(
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

        // Calculate the start time based on the Y offset from the initial start time
        const start_time = getTimeFromYOffsetAndTime(
          pixelOffset,
          event.start_time,
          new Date(over.id),
        );

        // Calculate the end time based on the start time and the event duration
        const end_time = dayjs(start_time)
          .add(dayjs(event.end_time).diff(event.start_time, "minute"), "minute")
          .toDate();

        // Ignore if the event is the same
        if (
          dayjs(start_time).isSame(dayjs(event.start_time)) &&
          dayjs(end_time).isSame(dayjs(event.end_time))
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

  // Handle on click on a day
  const handleDayMouseDown = useCallback(
    (mouseEvent: React.MouseEvent<HTMLDivElement>, day: Date) => {
      // Ignore if dragging an event
      if (dragging) return;

      // Reset previous state, in case the user starts a new selection while the previous one is still active
      if (selecting || extending || preview || activeEvent) {
        setClickDay(null);
        setClickPosition({ x: -1, y: -1 });
        setSelecting(false);
        setExtending(false);
        setActiveEvent(null);
        setPreview(null);
      }

      // Generate the initial click position
      const rect = mouseEvent.currentTarget.getBoundingClientRect();
      const divX = mouseEvent.clientX - rect.left;
      const divY = Math.min(
        Math.max(mouseEvent.clientY - rect.top, -1),
        GRID_HEIGHT + 1,
      );

      // Set initial positional data
      setClickPosition({ x: divX, y: divY });
      setClickDay(day);

      // Look for the event id in the target
      const target = mouseEvent.target as MouseEventTarget;
      const eventId = target.offsetParent?.id;

      // When clicking on an existing event
      if (eventId) {
        const event = getEventById(eventId);
        if (!event) {
          console.error(`Event ${eventId} not found`);
          setActiveEvent(null);
          return;
        }

        setActiveEvent(event);

        // When extending an existing event
        if ((target.id ?? "") === DRAGGER_ID) {
          setExtending(true);
        }

        return;

        // Not an existing event, reset active event
      }

      setActiveEvent(null);

      // Enable only if dragging is not active
      setSelecting(!dragging);
    },
    [
      selecting,
      dragging,
      preview,
      activeEvent,
      extending,
      getEventById,
      setActiveEvent,
      setSelecting,
      setExtending,
      setPreview,
    ],
  );

  // Handle on mouse move on a day
  const handleDayMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, day: Date) => {
      // Ignore if not selecting or extending
      // This function should only be called when selecting or extending
      if ((!selecting && !extending) || dragging) return;

      // Reset if positional data is not available
      // This function should not be called without these data
      if (!clickPosition || !clickDay) return;

      // Get the current mouse position
      const rect = event.currentTarget.getBoundingClientRect();
      const currentMouseY = Math.min(
        Math.max(event.clientY - rect.top, -1),
        GRID_HEIGHT + 1,
      );

      // Track selection if selecting
      if (selecting) {
        // If dragging up on the same day
        if (
          clickPosition.y > currentMouseY &&
          dayjs(clickDay).isSame(day, "day")
        ) {
          setPreview({
            start: {
              quarter: getQuarter(currentMouseY),
              day: day,
            },
            end: {
              quarter: getQuarter(clickPosition.y),
              day: day,
            },
          });
          return;
        }

        // If dragging down on the same day or after the current day
        if (
          clickPosition.y < currentMouseY &&
          (dayjs(clickDay).isSame(day, "day") ||
            dayjs(day).isAfter(clickDay, "day"))
        ) {
          setPreview({
            start: {
              quarter: getQuarter(clickPosition.y),
              day: clickDay,
            },
            end: {
              quarter: getQuarter(currentMouseY),
              day: day,
            },
          });
          return;
        }

        // If dragging before the current day
        setPreview({
          start: {
            quarter: getQuarter(currentMouseY),
            day: day,
          },
          end: {
            quarter: getQuarter(clickPosition.y),
            day: clickDay,
          },
        });

        return;
      }

      // When extending an existing event
      if (extending && activeEvent) {
        // The unchanged start and end time
        const startOffset = getPixelOffsetFromTime(
          new Date(activeEvent.start_time),
          day,
        );
        const endOffset = getPixelOffsetFromTime(
          new Date(activeEvent.end_time),
          day,
        );

        // The current mouse position
        const currentMouseQuarter = getQuarter(currentMouseY);

        // The position of the click that triggered the extending action
        const clickPositionQuarter = getQuarter(clickPosition.y);

        // Where the extending starts, could be either upwards or downwards
        const anchorOffset =
          clickPositionQuarter === startOffset
            ? Math.abs(endOffset - clickPositionQuarter) <= 15
              ? startOffset
              : endOffset
            : startOffset;

        // The height of the preview
        const previewHeight = getQuarter(anchorOffset - currentMouseQuarter);
        const top = Math.min(anchorOffset - previewHeight, anchorOffset);
        const height = Math.abs(previewHeight);

        setPreview({
          start: {
            day: day,
            quarter: getQuarter(top),
          },
          end: {
            day: day,
            quarter: getQuarter(top + height),
          },
        });

        return;
      }

      console.error("Unhandled case in handleDayMouseMove");
    },
    [
      selecting,
      extending,
      dragging,
      activeEvent,
      clickDay,
      clickPosition,
      setPreview,
    ],
  );

  // Handle on mouse up on a day
  const handleDayMouseUp = useCallback(
    (_event: React.MouseEvent<HTMLDivElement>, _day: Date) => {
      // Ignore if not selecting or extending
      // This function should only be called when selecting or extending
      if ((!selecting && !extending) || dragging) return;

      // Reset if preview and active event are not available
      // This function should not be called without these data
      if (!preview && !activeEvent) {
        // Reset state if the preview or active event does not exist
        setClickDay(null);
        setClickPosition({ x: -1, y: -1 });
        setSelecting(false);
        setExtending(false);
        setActiveEvent(null);
        setPreview(null);
        setSelectedEvents([]);

        return;
      }

      // When selecting a range to create a new event
      if (selecting && preview) {
        // Create Temporary Event, this will be saved when the user enters a title
        setActiveEvent({
          id: String(window.performance.now()),
          title: "",
          start_time: getTimeFromPixelOffset(
            preview.start.quarter,
            preview.start.day,
          ),
          end_time: getTimeFromPixelOffset(
            preview.end.quarter,
            preview.end.day,
          ),
          repeated: Repeated.Never,
          timezone: settings.timezone,
        });

        // Partially reset state
        setClickDay(null);
        setClickPosition({ x: -1, y: -1 });
        setSelecting(false);
        setExtending(false);
        // Preview will be reset after the event is saved
        // Active event will be reset after the event is saved

        return;
      }

      // When extending an existing event
      if (extending && preview && activeEvent) {
        editEvent({
          ...activeEvent,
          start_time: getTimeFromPixelOffset(
            preview.start.quarter,
            preview.start.day,
          ),
          end_time: getTimeFromPixelOffset(
            preview.end.quarter,
            preview.end.day,
          ),
        });

        // Reset state
        setClickDay(null);
        setClickPosition({ x: -1, y: -1 });
        setSelecting(false);
        setExtending(false);
        setActiveEvent(null);
        setPreview(null);

        return;
      }

      console.error("Unhandled case in handleDayMouseUp");
    },
    [
      preview,
      dragging,
      selecting,
      extending,
      activeEvent,
      editEvent,
      setActiveEvent,
      setPreview,
      setSelecting,
      setExtending,
      setSelectedEvents,
      settings.timezone,
    ],
  );

  return (
    <DndContext
      onDragStart={() => setDragging(true)}
      onDragEnd={handleDndContextDragEnd}
      collisionDetection={closestCenter}>
      <div
        className="no-scrollbar flex w-full snap-x snap-mandatory overflow-scroll scroll-smooth"
        ref={gridRef}
        onScroll={gridRef.current ? debouncedHandleScroll : undefined}
        onFocus={() => setGridFocused(true)}
        onBlur={() => setGridFocused(false)}>
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
              day={dayjs(date).startOf("day").toDate()}
              onMouseDown={handleDayMouseDown}
              onMouseMove={handleDayMouseMove}
              onMouseUp={handleDayMouseUp}
            />
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
