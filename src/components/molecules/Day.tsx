import { generateEventTime } from "@/components/atoms/Event";
import Time from "@/components/atoms/Time";
import {
  draggerId,
  gridHeight,
  pixelPerHour,
  pixelPerMinute,
  pixelPerQuarter,
} from "@/lib/consts";
import { useEventStore } from "@/lib/stores/event";
import { useSettingStore } from "@/lib/stores/settings";
import { Event as EventType } from "@/lib/types";
import {
  cn,
  getDayWithDate,
  getPixelOffsetFromTime,
  getQuarter,
  getTimeFromPixelOffset,
} from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import dayjs from "dayjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

export default function Day({
  id,
  height,
  width,
  children,
  dragging,
  day,
}: {
  id: string;
  height: number;
  width: number;
  children: React.ReactNode;
  dragging: boolean;
  day: Date;
}) {
  const date = getDayWithDate(day);
  const today = dayjs().startOf("day").isSame(dayjs(day).startOf("day"));
  const [selecting, setSelecting] = useState(false);
  const [extendingEvent, setExtendingEvent] = useState<EventType>();
  const [clickPosition, setClickPosition] = useState({ x: -1, y: -1 });
  const [start, setStart] = useState({ x: -1, y: -1 });
  const [end, setEnd] = useState({ x: -1, y: -1 });
  const { addEvent, getEventById, editEvent } = useEventStore();
  const { settings } = useSettingStore();
  const [preview, setPreview] = useState({ height: 0, top: 0 });
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const { setNodeRef } = useDroppable({
    id,
  });

  const resetState = useCallback(() => {
    setExtendingEvent(undefined);
    setSelecting(false);
    setPreview({ height: 0, top: 0 });
    setClickPosition({ x: -1, y: -1 });
    setStart({ x: -1, y: -1 });
    setEnd({ x: -1, y: -1 });
  }, []);

  const handleMouseDown = useCallback(
    (mouseEvent: React.MouseEvent<HTMLDivElement>) => {
      const rect = mouseEvent.currentTarget.getBoundingClientRect();
      const divX = mouseEvent.clientX - rect.left;
      const divY = Math.min(
        Math.max(mouseEvent.clientY - rect.top, -1),
        gridHeight + 1,
      );

      setClickPosition({ x: divX, y: divY });

      // When extending an existing event
      if (((mouseEvent.target as any).name ?? "") == draggerId) {
        const eventId = (mouseEvent.nativeEvent.srcElement as any)?.offsetParent
          .id;

        if (eventId) {
          const event = getEventById(eventId);
          if (!event) {
            console.debug(`Event ${eventId} not found`);
            return;
          }
          setExtendingEvent(event);
        }
        return;
      }

      // When dragging a range to create a new event
      setSelecting(dragging ? false : true);
    },
    [dragging, getEventById],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const currentMouseX = event.clientX - rect.left;
      const currentMouseY = Math.min(
        Math.max(event.clientY - rect.top, -1),
        gridHeight + 1,
      );

      if (selecting || extendingEvent) {
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
      if (extendingEvent) {
        const endOffset = getPixelOffsetFromTime(extendingEvent.end, day);
        const startOffset = getPixelOffsetFromTime(extendingEvent.start, day);
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
    [selecting, clickPosition, extendingEvent, day, resetState],
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
        title: "asdasdasdasdasdasdasdasdasdasdasdasdasdasd",
        start: getTimeFromPixelOffset(start.y, day),
        end: getTimeFromPixelOffset(
          Math.max(end.y, start.y + pixelPerQuarter),
          day,
        ),
        repeated: { label: "asd", value: "asd" },
        timezone: { label: "asd", value: "asd" },
      });
    }

    // When extending an existing event
    if (extendingEvent) {
      editEvent({
        ...extendingEvent,
        start: getTimeFromPixelOffset(preview.top, day),
        end: getTimeFromPixelOffset(preview.top + preview.height, day),
      });

      setExtendingEvent(undefined);
      return;
    }

    resetState();
  }, [
    selecting,
    start,
    end,
    dragging,
    addEvent,
    day,
    extendingEvent,
    editEvent,
    preview,
    resetState,
  ]);

  //useEffect(() => {
  //  if (!selecting && start.y !== -1 && end.y !== -1) {
  //    const selection = getDateTimePairFromSelection(start.y, end.y, day);
  //    router.push(
  //      queryParams(
  //        [],
  //        [
  //          ["start", selection.startDateTime.toISOString()],
  //          ["end", selection.endDateTime.toISOString()],
  //        ],
  //        params.entries(),
  //        pathname + "/new",
  //      ),
  //      { scroll: false },
  //    );
  //  }
  //  // eslint-disable-next-line react-hooks/exhaustive-deps
  //}, [selecting]);

  return (
    <div
      id={`${date.day}-${date.date}-${date.month}-${date.year}-${date.week}`}>
      <span className="sticky top-14 flex flex-col sm:flex-row w-full h-12 items-center justify-center gap-2 font-bold border-b">
        <p>{date.day}</p>
        <p className={today ? "rounded-sm bg-[#EF4B46] px-[6px]" : ""}>
          {date.date}
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
            "linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: `100% ${pixelPerHour}px`,
          backgroundPosition: `0 ${pixelPerHour}px`,
        }}
        className="flex flex-col items-center justify-between gap-2 relative snap-start border-x border-b mt-14">
        <Time today={today} />
        {selecting && (
          <div
            style={preview}
            className="absolute w-full flex items-center justify-center bg-orange-500 bg-opacity-25">
            <p className="text-center text-lg font-bold"></p>
          </div>
        )}
        {extendingEvent && preview.height >= pixelPerMinute && (
          <div
            style={{
              top: preview.top,
              height: Math.max(preview.height, pixelPerQuarter),
            }}
            className="absolute z-50 w-full flex flex-col bg-orange-400">
            <p className={cn("font-bold sm:block truncate text-xs")}>
              {extendingEvent.title}
            </p>
            <p className={cn("font-semibold text-xs")}>
              {generateEventTime(
                getTimeFromPixelOffset(preview.top, day),
                getTimeFromPixelOffset(preview.top + preview.height, day),
                settings.clock,
              )}
            </p>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
