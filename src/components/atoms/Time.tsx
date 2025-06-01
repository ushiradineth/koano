import { PIXEL_PER_HOUR, PIXEL_PER_MINUTE } from "@/lib/consts";
import { useDataStore } from "@/lib/stores/data";
import { cn } from "@/lib/utils";

interface Props {
  today: boolean;
}

export default function Time({ today }: Props) {
  const { time } = useDataStore();

  return (
    <div
      className="absolute flex w-full"
      style={{
        top: time.hour * PIXEL_PER_HOUR + time.minutes * PIXEL_PER_MINUTE,
      }}>
      {today && <p className="absolute -left-1 -top-3">•</p>}
      <div
        className={cn(
          "h-0.5 w-full bg-orange-400",
          today ? "bg-opacity-100" : "bg-opacity-25",
        )}
      />
    </div>
  );
}
