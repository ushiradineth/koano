import PreviewEvent from "@/components/atoms/PreviewEvent";
import Time from "@/components/atoms/Time";
import {
  draggerId,
  gridHeight,
  headerHeight,
  pixelPerHour,
  pixelPerMinute,
  pixelPerQuarter,
  secondaryHeaderHeight,
} from "@/lib/consts";
import { useContextStore } from "@/lib/stores/context";
import { useEventStore } from "@/lib/stores/event";
import { useSettingStore } from "@/lib/stores/settings";
import {
  cn,
  getDayObjectWithDate,
  getPixelOffsetFromTime,
  getQuarter,
  getTimeFromPixelOffset,
} from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";

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

  const { addEvent, getEventById, editEvent } = useEventStore();
  const {
    activeEvent,
    setActiveEvent,
    extending,
    setExtending,
    selecting,
    setSelecting,
    previewing,
    setPreviewing,
  } = useContextStore();
  const { settings } = useSettingStore();

  const dayObject = getDayObjectWithDate(day);
  const today = dayjs().startOf("day").isSame(dayjs(day).startOf("day"));

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
      const rect = mouseEvent.currentTarget.getBoundingClientRect();
      const divX = mouseEvent.clientX - rect.left;
      const divY = Math.min(
        Math.max(mouseEvent.clientY - rect.top, -1),
        gridHeight + 1,
      );

      setClickPosition({ x: divX, y: divY });

      const target = mouseEvent.target as MouseEventTarget;

      // When extending an existing event
      if ((target.id ?? "") === draggerId) {
        const eventId = target.offsetParent?.id;

        if (eventId) {
          const event = getEventById(eventId);
          if (!event) {
            console.error(`Event ${eventId} not found`);
            return;
          }
          setExtending(true);
          setActiveEvent(event);
        }
        return;
      }

      // When dragging a range to create a new event
      setSelecting(dragging ? false : true);
    },
    [dragging, getEventById, setSelecting, setExtending, setActiveEvent],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const currentMouseX = event.clientX - rect.left;
      const currentMouseY = Math.min(
        Math.max(event.clientY - rect.top, -1),
        gridHeight + 1,
      );

      if (dragging) return;

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
            Math.max(clickPosition.y - currentMouseY, pixelPerQuarter),
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
              Math.max(currentMouseY - clickPosition.y, pixelPerQuarter),
            ),
            top: getQuarter(clickPosition.y),
          });
        }

        return;
      }

      // When extending an existing event
      if (extending && activeEvent) {
        if (
          !dayjs(activeEvent?.start)
            .startOf("day")
            .isSame(dayjs(day).startOf("day"))
        ) {
          return;
        }

        const startOffset = getPixelOffsetFromTime(activeEvent.start, day);
        const endOffset = getPixelOffsetFromTime(activeEvent.end, day);
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

        top + height !== gridHeight && setPreview({ height, top });

        return;
      }

      resetState();
    },
    [
      day,
      selecting,
      extending,
      dragging,
      clickPosition,
      activeEvent,
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

      addEvent({
        id: String(window.performance.now()),
        title: "This Title needs to be changed",
        start: getTimeFromPixelOffset(start.y, day),
        end: getTimeFromPixelOffset(
          Math.max(end.y, start.y + pixelPerQuarter),
          day,
        ),
        repeated: "None",
        timezone: settings.timezone,
      });
    }

    // When extending an existing event
    if (extending && activeEvent) {
      editEvent({
        ...activeEvent,
        start: getTimeFromPixelOffset(preview.top, day),
        end: getTimeFromPixelOffset(preview.top + preview.height, day),
      });
    }

    resetState();
  }, [
    start,
    end,
    dragging,
    addEvent,
    day,
    preview,
    editEvent,
    selecting,
    extending,
    activeEvent,
    resetState,
    settings.timezone,
  ]);

  useEffect(() => {
    if (previewing && activeEvent) {
      const start = getPixelOffsetFromTime(activeEvent.start, day);
      const end = getPixelOffsetFromTime(activeEvent.end, day);

      setPreview({
        height: Math.max(end - start, pixelPerQuarter),
        top: start,
      });
    }
  }, [previewing, activeEvent, day]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        resetState();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [resetState]);

  return (
    <div
      id={`${dayObject.day}-${dayObject.date}-${dayObject.month}-${dayObject.year}-${dayObject.week}`}
      style={{ marginTop: headerHeight }}>
      <span
        style={{ height: secondaryHeaderHeight }}
        className="flex flex-row w-full sticky items-center justify-center gap-1 font-bold border-b text-sm">
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
            "linear-gradient(to bottom, hsl(var(--border-horizontal)) 1px, transparent 1px)",
          backgroundSize: `100% ${pixelPerHour}px`,
          backgroundPosition: `0 ${pixelPerHour}px`,
        }}
        className="flex flex-col items-center justify-between gap-2 relative snap-start border-x border-b border-border-vertical">
        <Time today={today} />
        {selecting ? (
          <div
            style={preview}
            className="absolute w-full flex items-center justify-center bg-orange-500 bg-opacity-25">
            <p className="text-center text-lg font-bold"></p>
          </div>
        ) : extending && activeEvent && preview.height >= pixelPerMinute ? (
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
