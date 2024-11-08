import Time from "@/components/atoms/Time";
import { gridHeight, pixelPerHour, pixelPerQuarter } from "@/lib/consts";
import { useEventStore } from "@/lib/stores/event";
import {
  getDayWithDate,
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
  const [extendingEventId, setExtendingEventId] = useState();
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
      if (["up", "down"].includes(mouseEvent.target.name ?? "")) {
        const eventId = mouseEvent.nativeEvent.srcElement.offsetParent.id;
        setExtendingEventId(eventId);
        return;
      }

      // When dragging a range to create a new event
      setSelecting(dragging ? false : true);
    },
    [dragging],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (selecting || extendingEventId) {
        const rect = event.currentTarget.getBoundingClientRect();
        const divX = event.clientX - rect.left;
        const divY = Math.min(
          Math.max(event.clientY - rect.top, -1),
          gridHeight + 1,
        );

        // Dragging upwards
        if (divY < clickPosition.y) {
          setEnd(clickPosition);
          setStart({ x: divX, y: divY });
          const previewHeight = getQuarter(
            Math.max(clickPosition.y - divY, pixelPerQuarter),
          );
          setPreview({
            height: previewHeight,
            top: getQuarter(clickPosition.y) - previewHeight,
          });
        } else {
          setStart(clickPosition);
          setEnd({ x: divX, y: divY });
          selecting &&
            setPreview({
              height: getQuarter(
                Math.max(divY - clickPosition.y, pixelPerQuarter),
              ),
              top: getQuarter(clickPosition.y),
            });
        }
      }
    },
    [selecting, clickPosition, extendingEventId],
  );

  const handleMouseUp = useCallback(() => {
    // When extending an existing event
    if (extendingEventId) {
      const event = getEventById(extendingEventId);

      if (!event) return;
      const startTime = getTimeFromPixelOffset(start.y, day);
      const endTime = getTimeFromPixelOffset(end.y, day);

      if (
        dayjs(startTime).isBefore(dayjs(event.end)) &&
        dayjs(endTime).isBefore(dayjs(event.end))
      ) {
        editEvent({ ...event, start: startTime });
      } else {
        editEvent({ ...event, end: endTime });
      }
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
    setExtendingEventId(undefined);
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
    extendingEventId,
    getEventById,
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
        {children}
      </div>
    </div>
  );
}
