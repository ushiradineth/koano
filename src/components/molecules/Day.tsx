import Time from "@/components/atoms/Time";
import {
  HEADER_HEIGHT,
  PIXEL_PER_HOUR,
  SECONDARY_HEADER_HEIGHT,
} from "@/lib/consts";
import dayjs from "@/lib/dayjs";
import { useContextStore } from "@/lib/stores/context";
import { cn, getDayObjectWithDate } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { useMemo } from "react";
import PreviewEvent from "../atoms/PreviewEvent";

interface Props {
  id: string;
  height: number;
  width: number;
  children: React.ReactNode;
  day: Date;
  onMouseDown: (event: React.MouseEvent<HTMLDivElement>, day: Date) => void;
  onMouseMove: (event: React.MouseEvent<HTMLDivElement>, day: Date) => void;
  onMouseUp: (event: React.MouseEvent<HTMLDivElement>, day: Date) => void;
}

export default function Day({
  id,
  height,
  width,
  children,
  day,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: Props) {
  const { activeEvent, preview } = useContextStore();

  const dayObject = useMemo(() => getDayObjectWithDate(day), [day]);
  const today = useMemo(
    () => dayjs().startOf("day").isSame(dayjs(day).startOf("day")),
    [day],
  );

  const { setNodeRef } = useDroppable({
    id,
  });

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
        onMouseDown={(event) => onMouseDown(event, day)}
        onMouseMove={(event) => onMouseMove(event, day)}
        onMouseUp={(event) => onMouseUp(event, day)}
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

        <PreviewEvent
          preview={preview}
          day={day}
          title={activeEvent?.title ?? ""}
        />

        {children}
      </div>
    </div>
  );
}
