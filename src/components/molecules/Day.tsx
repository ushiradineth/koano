import Time from "@/components/atoms/Time";
import {
  draggerId,
  gridHeight,
  pixelPerHour,
  pixelPerQuarter,
} from "@/lib/consts";
import { useEventStore } from "@/lib/stores/event";
import { Event as EventType } from "@/lib/types";
import {
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
  const [preview, setPreview] = useState({ height: 0, top: 0 });
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const { setNodeRef } = useDroppable({
    id,
  });

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
          if (!event) return;

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

      // Dragging upwards
      if (currentMouseY < clickPosition.y) {
        setEnd(clickPosition);
        setStart({ x: currentMouseX, y: currentMouseY });
      }
      // Dragging downwards
      else {
        setStart(clickPosition);
        setEnd({ x: currentMouseX, y: currentMouseY });
      }

      if (selecting) {
        // Dragging upwards
        if (currentMouseY < clickPosition.y) {
          const previewHeight = getQuarter(
            Math.max(clickPosition.y - currentMouseY, pixelPerQuarter),
          );
          setPreview({
            height: previewHeight,
            top: getQuarter(clickPosition.y) - previewHeight,
          });
        }
        // Dragging downwards
        else {
          selecting &&
            setPreview({
              height: getQuarter(
                Math.max(currentMouseY - clickPosition.y, pixelPerQuarter),
              ),
              top: getQuarter(clickPosition.y),
            });
        }

        return;
      }

      if (extendingEvent) {
        const endOffset = getPixelOffsetFromTime(extendingEvent.end, day);
        const startOffset = getPixelOffsetFromTime(extendingEvent.start, day);
        const currentMouseQuarter = getQuarter(currentMouseY);
        const clickPositionQuarter = getQuarter(clickPosition.y);

        if (
          clickPositionQuarter === startOffset &&
          currentMouseQuarter > endOffset
        ) {
          console.debug("start is pulled over the end");
          return;
        }

        if (
          (clickPositionQuarter === endOffset ||
            clickPositionQuarter === endOffset - 15) &&
          currentMouseQuarter < startOffset
        ) {
          console.debug("end is pulled over the start");
          return;
        }

        // If the event is pulled up from the start
        if (
          currentMouseQuarter < clickPositionQuarter &&
          currentMouseQuarter < startOffset
        ) {
          console.debug("1 event is pulled up from the start");
          const previewHeight = getQuarter(endOffset - currentMouseQuarter);
          setPreview({
            height: previewHeight,
            top: endOffset - previewHeight,
          });
          return;
        }

        // If the event is pulled down from the start
        if (
          currentMouseQuarter > clickPositionQuarter &&
          currentMouseQuarter > startOffset &&
          currentMouseQuarter < endOffset
        ) {
          console.debug("2 event is pulled down from the start");
          setPreview({
            height: getQuarter(endOffset - currentMouseQuarter),
            top:
              clickPositionQuarter +
              getQuarter(currentMouseQuarter - startOffset),
          });
          return;
        }

        // If the event is pulled up from the end
        if (
          currentMouseQuarter < clickPositionQuarter &&
          currentMouseQuarter > startOffset
        ) {
          console.debug("3 event is pulled up from the end");
          setPreview({
            height: getQuarter(currentMouseQuarter - startOffset),
            top: startOffset,
          });

          return;
        }

        // If the event is pulled down from the end
        if (
          currentMouseQuarter > clickPositionQuarter &&
          currentMouseQuarter > endOffset
        ) {
          console.debug("4 event is pulled down from the end");
          setPreview({
            height: getQuarter(currentMouseQuarter - startOffset),
            top: startOffset,
          });
          return;
        }
      }

      setPreview({ height: 0, top: 0 });
    },
    [selecting, clickPosition, extendingEvent, day],
  );

  const handleMouseUp = useCallback(() => {
    // When extending an existing event
    if (extendingEvent) {
      const startTime = dayjs(getTimeFromPixelOffset(start.y, day));
      const endTime = dayjs(getTimeFromPixelOffset(end.y, day));
      const eventStart = dayjs(extendingEvent.start);
      const eventEnd = dayjs(extendingEvent.end);

      // If the event is pulled down from the end
      if (
        startTime.isAfter(eventStart) &&
        startTime.isBefore(eventEnd) &&
        endTime.isAfter(eventEnd)
      ) {
        console.debug("event is pulled down from the end");
        editEvent({ ...extendingEvent, end: endTime.toDate() });
        setExtendingEvent(undefined);
        return;
      }

      // If the event is pulled up from the end
      if (startTime.isAfter(eventStart) && endTime.isBefore(eventEnd)) {
        console.debug("event is pulled up from the end");
        editEvent({ ...extendingEvent, end: startTime.toDate() });
        setExtendingEvent(undefined);
        return;
      }

      // If the event is pulled up from the start
      if (startTime.isBefore(eventStart) && endTime.isSame(eventStart)) {
        console.debug("event is pulled up from the start");
        editEvent({ ...extendingEvent, start: startTime.toDate() });
        setExtendingEvent(undefined);
        return;
      }

      // If the event is pulled down from the start
      if (startTime.isSame(eventStart) && endTime.isBefore(eventEnd)) {
        console.debug("event is pulled down from the start");
        editEvent({ ...extendingEvent, start: endTime.toDate() });
        setExtendingEvent(undefined);
        return;
      }

      console.debug("event is not pulled");
      setExtendingEvent(undefined);
      return;
    }

    if (start.y === end.y) {
      setSelecting(false);
      return;
    }

    // When dragging a range to create a new event
    if (selecting && !dragging) {
      addEvent({
        id: String(window.performance.now()),
        title: "asd",
        start: getTimeFromPixelOffset(start.y, day),
        end: getTimeFromPixelOffset(
          Math.max(end.y, start.y + pixelPerQuarter),
          day,
        ),
        repeated: { label: "asd", value: "asd" },
        timezone: { label: "asd", value: "asd" },
      });
    }

    // Reset all states
    setExtendingEvent(undefined);
    setSelecting(false);
    setStart({ x: -1, y: -1 });
    setEnd({ x: -1, y: -1 });
  }, [
    selecting,
    start,
    end,
    dragging,
    addEvent,
    day,
    extendingEvent,
    editEvent,
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
        {extendingEvent && (
          <div
            style={preview}
            className="absolute z-50 w-full flex items-center justify-center bg-red-500">
            <p className="text-center text-lg font-bold"></p>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
