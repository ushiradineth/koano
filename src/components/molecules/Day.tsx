import PreviewEvent from "@/components/atoms/PreviewEvent";
import Time from "@/components/atoms/Time";
import {
  DRAGGER_ID,
  GRID_HEIGHT,
  HEADER_HEIGHT,
  PIXEL_PER_HOUR,
  PIXEL_PER_MINUTE,
  PIXEL_PER_QUARTER,
  SECONDARY_HEADER_HEIGHT,
} from "@/lib/consts";
import { useContextStore } from "@/lib/stores/context";
import { useEventStore } from "@/lib/stores/event";
import { useSettingStore } from "@/lib/stores/settings";
import { Repeated } from "@/lib/types";
import {
  cn,
  getDayObjectWithDate,
  getPixelOffsetFromTime,
  getQuarter,
  getTimeFromPixelOffset,
} from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Props {
  id: string;
  height: number;
  width: number;
  children: React.ReactNode;
  dragging: boolean;
  day: Date;
}

interface MouseEventTarget extends EventTarget {
  id?: string;
  offsetParent?: HTMLElement;
}

export default function Day({
  id,
  height,
  width,
  children,
  dragging,
  day,
}: Props) {
  const [start, setStart] = useState({ x: -1, y: -1 });
  const [end, setEnd] = useState({ x: -1, y: -1 });
  const [preview, setPreview] = useState({ height: 0, top: 0 });
  const [clickPosition, setClickPosition] = useState({ x: -1, y: -1 });

  const { getEventById, editEvent } = useEventStore();
  const {
    activeEvent,
    setActiveEvent,
    activeDay,
    setActiveDay,
    extending,
    setExtending,
    selecting,
    setSelecting,
    previewing,
    setPreviewing,
  } = useContextStore();
  const { settings } = useSettingStore();

  const dayObject = useMemo(() => getDayObjectWithDate(day), [day]);
  const today = useMemo(
    () => dayjs().startOf("day").isSame(dayjs(day).startOf("day")),
    [day],
  );

  const { setNodeRef } = useDroppable({
    id,
  });

  const resetState = useCallback(() => {
    setStart({ x: -1, y: -1 });
    setEnd({ x: -1, y: -1 });
    setClickPosition({ x: -1, y: -1 });
    setPreview({ height: 0, top: 0 });
    setSelecting(false);
    setExtending(false);
    setPreviewing(false);
  }, [setExtending, setSelecting, setPreviewing]);

  const handleMouseDown = useCallback(
    (mouseEvent: React.MouseEvent<HTMLDivElement>) => {
      if (selecting || extending || previewing) {
        resetState();
        setActiveEvent(null);
        return;
      }

      if (activeDay !== day) {
        setActiveDay(day);
        resetState();
        setActiveEvent(null);
      }

      const rect = mouseEvent.currentTarget.getBoundingClientRect();
      const divX = mouseEvent.clientX - rect.left;
      const divY = Math.min(
        Math.max(mouseEvent.clientY - rect.top, -1),
        GRID_HEIGHT + 1,
      );

      setActiveDay(day);
      setClickPosition({ x: divX, y: divY });

      const target = mouseEvent.target as MouseEventTarget;
      const eventId = target.offsetParent?.id;

      // When extending an existing event
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

      // When dragging a range to create a new event
      setSelecting(dragging ? false : true);
    },
    [
      day,
      selecting,
      setExtending,
      extending,
      setSelecting,
      previewing,
      dragging,
      activeDay,
      setActiveDay,
      setActiveEvent,
      resetState,
      getEventById,
    ],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (dragging || previewing || (!selecting && !extending)) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const currentMouseX = event.clientX - rect.left;
      const currentMouseY = Math.min(
        Math.max(event.clientY - rect.top, -1),
        GRID_HEIGHT + 1,
      );

      if (selecting || extending) {
        // Dragging upwards
        if (currentMouseY < clickPosition.y) {
          setStart({ x: currentMouseX, y: currentMouseY });
          setEnd(clickPosition);
        }
        // Dragging downwards
        else {
          setStart(clickPosition);
          setEnd({ x: currentMouseX, y: currentMouseY });
        }
      }

      // When dragging a range to create a new event
      if (selecting) {
        // Dragging upwards
        if (currentMouseY < clickPosition.y) {
          const previewHeight = getQuarter(
            Math.max(clickPosition.y - currentMouseY, PIXEL_PER_QUARTER),
          );
          setPreview({
            height: previewHeight,
            top: getQuarter(clickPosition.y - previewHeight),
          });
        }
        // Dragging downwards
        else {
          setPreview({
            height: getQuarter(
              Math.max(currentMouseY - clickPosition.y, PIXEL_PER_QUARTER),
            ),
            top: getQuarter(clickPosition.y),
          });
        }

        return;
      }

      // When extending an existing event
      if (extending && activeEvent) {
        if (
          !dayjs(activeEvent?.start_time)
            .startOf("day")
            .isSame(dayjs(day).startOf("day"))
        ) {
          return;
        }

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

        return;
      }

      resetState();
    },
    [
      day,
      selecting,
      extending,
      previewing,
      dragging,
      activeEvent,
      clickPosition,
      resetState,
    ],
  );

  const handleMouseUp = useCallback(() => {
    if (start.y === -1 || end.y === -1) {
      resetState();
      return;
    }

    // When dragging a range to create a new event
    if (selecting && !dragging) {
      if (start.y === end.y) {
        resetState();
        return;
      }

      setActiveEvent({
        id: String(window.performance.now()),
        title: "",
        start_time: getTimeFromPixelOffset(start.y, day),
        end_time: getTimeFromPixelOffset(
          Math.max(end.y, start.y + PIXEL_PER_QUARTER),
          day,
        ),
        repeated: Repeated.Never,
        timezone: settings.timezone,
      });

      setStart({ x: -1, y: -1 });
      setEnd({ x: -1, y: -1 });
      setClickPosition({ x: -1, y: -1 });
      setPreview({ height: 0, top: 0 });
      setSelecting(false);
      setExtending(false);
      setPreviewing(true);

      return;
    }

    // When extending an existing event
    if (extending && activeEvent) {
      editEvent({
        ...activeEvent,
        start_time: getTimeFromPixelOffset(preview.top, day),
        end_time: getTimeFromPixelOffset(preview.top + preview.height, day),
      });
    }

    resetState();
  }, [
    start,
    end,
    day,
    editEvent,
    activeEvent,
    setActiveEvent,
    preview,
    setPreviewing,
    dragging,
    selecting,
    setSelecting,
    extending,
    setExtending,
    settings.timezone,
    resetState,
  ]);

  useEffect(() => {
    if (previewing && activeEvent) {
      const start = getPixelOffsetFromTime(activeEvent.start_time, day);
      const end = getPixelOffsetFromTime(activeEvent.end_time, day);

      setPreview({
        height: Math.max(end - start, PIXEL_PER_QUARTER),
        top: start,
      });
    }
  }, [previewing, activeEvent, day]);

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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
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
        {selecting &&
        dayjs(activeDay).startOf("day").isSame(dayjs(day).startOf("day")) ? (
          <div
            style={preview}
            className="absolute flex w-full items-center justify-center bg-orange-500 bg-opacity-25">
            <p className="text-lg text-center font-bold"></p>
          </div>
        ) : extending && activeEvent && preview.height >= PIXEL_PER_MINUTE ? (
          <PreviewEvent preview={preview} title={activeEvent.title} day={day} />
        ) : (
          previewing &&
          activeEvent && (
            <PreviewEvent
              preview={preview}
              title={activeEvent.title}
              day={day}
            />
          )
        )}
        {children}
      </div>
    </div>
  );
}
