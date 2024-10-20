import { pixelPerHour, pixelPerMinute } from "@/lib/consts";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";

interface Props {
  today: boolean;
}

export default function Time({ today }: Props) {
  return (
    <div
      className={cn("absolute w-full flex")}
      style={{
        top: dayjs().hour() * pixelPerHour + dayjs().minute() * pixelPerMinute,
      }}>
      {today && <p className="absolute -top-2.5 -left-1">•</p>}
      <div
        className={cn(
          "w-full h-[2px] bg-orange-400",
          today ? "bg-opacity-100" : "bg-opacity-25",
        )}
      />
    </div>
  );
}
