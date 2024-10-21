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
  const [clickPosition, setClickPosition] = useState({ x: -1, y: -1 });
  const [start, setStart] = useState({ x: -1, y: -1 });
  const [end, setEnd] = useState({ x: -1, y: -1 });
  const { addEvent } = useEventStore();
  const [preview, setPreview] = useState({ height: 0, top: 0 });
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const { setNodeRef } = useDroppable({
    id,
  });

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const divX = event.clientX - rect.left;
      const divY = Math.min(
        Math.max(event.clientY - rect.top, -1),
        gridHeight + 1,
      );

      setSelecting(dragging ? false : true);
      setClickPosition({ x: divX, y: divY });
    },
    [dragging],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (selecting) {
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
          setPreview({
            height: getQuarter(Math.max(divY - clickPosition.y, pixelPerQuarter)),
            top: getQuarter(clickPosition.y),
          });
        }
      }
    },
    [selecting, clickPosition],
  );

  const handleMouseUp = useCallback(() => {
    if (selecting) {
      // Dragging is finished
      setSelecting(false);

      if (!dragging) {
        addEvent({
          id: String(new Date().getSeconds()),
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
    }
  }, [selecting, start, end, dragging, addEvent, day]);

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
  //

  return (
    <div
      id={`${date.day}-${date.date}-${date.month}-${date.year}-${date.week}`}>
      <span className="flex flex-col sm:flex-row w-full h-12 items-center justify-center gap-2 font-bold border-b">
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
        className="flex flex-col items-center justify-between gap-2 relative snap-start border-x border-b">
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
