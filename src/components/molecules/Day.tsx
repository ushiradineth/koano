import Time from "@/components/atoms/Time";
import { pixelPerHour } from "@/lib/consts";
import { useEventStore } from "@/lib/stores/event";
import { getDayWithDate, getTimeFromPixelOffset } from "@/lib/utils";
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
	const [start, setStart] = useState({ x: -1, y: -1 });
	const [end, setEnd] = useState({ x: -1, y: -1 });
	const { addEvent } = useEventStore();
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
			const divY = event.clientY - rect.top;

			setSelecting(dragging ? false : true);
			setStart({
				x: divX,
				y: divY,
			});
			setEnd({ x: -1, y: -1 });
		},
		[dragging],
	);

	const handleMouseMove = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			if (selecting) {
				const rect = event.currentTarget.getBoundingClientRect();
				const divX = event.clientX - rect.left;
				const divY = event.clientY - rect.top;

				setEnd({
					x: divX,
					y: divY,
				});
			}
		},
		[selecting],
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
					end: getTimeFromPixelOffset(end.y, day),
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
				{children}
			</div>
		</div>
	);
}
//{selecting && (
//  <div style={{ height }} className="absolute w-full h-full bg-background bg-opacity-50 flex items-center justify-center">
//    <p className="text-center text-lg font-bold">
//      {date.day}
//    </p>
//  </div>
//)}
