import { pixelPerHour, pixelPerMinute } from "@/lib/consts";
import { useDataStore } from "@/lib/stores/data";
import { cn } from "@/lib/utils";

interface Props {
  today: boolean;
}

export default function Time({ today }: Props) {
  const { time } = useDataStore();

  return (
    <div
      className="flex absolute w-full"
      style={{
        top: time.hour * pixelPerHour + time.minutes * pixelPerMinute,
      }}>
      {today && <p className="absolute -top-3 -left-1">•</p>}
      <div
        className={cn(
          "h-0.5 w-full bg-orange-400",
          today ? "bg-opacity-100" : "bg-opacity-25",
        )}
      />
    </div>
  );
}
