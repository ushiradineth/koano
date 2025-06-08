import { Event } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function AllDayEvent({ event }: { event: Event }) {
  return (
    <div
      className={cn("rounded-sm bg-orange-500 px-1 text-xs text-foreground")}>
      {event.title}
    </div>
  );
}
