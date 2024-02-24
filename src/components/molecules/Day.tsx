"use client";

import Event from "@/components/atoms/Event";
import Quarter from "@/components/atoms/Quarter";
import Time from "@/components/atoms/Time";
import { Event as EventType } from "@/lib/types";
import {
	cn,
	getDateTimePairFromSelection,
	getDayWithDate,
	getTimeDifferenceInQuarters,
	getTimeFromQuarter,
	isToday,
	queryParams,
} from "@/lib/utils";
import { DndContext } from "@dnd-kit/core";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useState } from "react";
import { useEventContext } from "../utils/Context";

interface Props {
	day: Date;
	width: number;
	events: EventType[];
}

export default memo(function Day({ day, width, events }: Props) {
	const router = useRouter();
	const pathname = usePathname();
	const params = useSearchParams();
	const [selecting, setSelecting] = useState(false);
	const [done, setDone] = useState(true);
	const [start, setStart] = useState<number>(-1);
	const [end, setEnd] = useState<number>(-1);
	const date = getDayWithDate(day);
	const today = isToday(day);
	const eventContext = useEventContext();

	useEffect(() => {
		if (!selecting) {
			setStart(-1);
			setEnd(-1);
			setDone(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname]);

	useEffect(() => {
		if (!selecting && start !== -1 && end !== -1) {
			const selection = getDateTimePairFromSelection(start, end, day);
			router.push(
				queryParams(
					[],
					[
						["start", selection.startDateTime.toISOString()],
						["end", selection.endDateTime.toISOString()],
					],
					params.entries(),
					pathname + "/new",
				),
				{ scroll: false },
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selecting]);


	const updateEvents = useCallback(
		(id: string, newStart: string) => {
			const [title, date, start, end] = id.split(",");
			const events = eventContext.events;

			for (const event of events) {
				if (event.title === title) {
					const newStartQuarter = Number(newStart.split(",")[1]);

					event.start = getTimeFromQuarter(newStartQuarter, date);
					event.end = getTimeFromQuarter(
						newStartQuarter + getTimeDifferenceInQuarters(start, end),
						date,
					);
				}
			}

			eventContext.setEvents(events);
		},
		[eventContext],
	);

	return (
		<div
			id={`${date.day}-${date.date}-${date.month}-${date.year}-${date.week}`}
			className={cn(
				"flex flex-col items-center justify-between gap-2",
				"snap-start",
				"h-full",
			)}
			style={{ width: `${width}px` }}>
			<DndContext
				onDragEnd={(event) =>
					event.collisions?.[0] &&
					updateEvents(
						event.active.id.toString(),
						event.collisions?.[0].id.toString() ?? "",
					)
				}>
				<span className="flex flex-col sm:flex-row h-12 sm:h-5 items-center justify-center gap-2 font-bold">
					<p>{date.day}</p>
					<p className={cn(today && "rounded-sm bg-[#EF4B46] px-[6px]")}>
						{date.date}
					</p>
				</span>
				<div
					className={cn(
						"flex flex-col items-center justify-between",
						"border",
						"h-full w-full relative",
					)}>
					<Time today={today} />
					{new Array(24 * 1 * 4).fill(0).map((_, index) => (
						<Quarter
							key={index}
							quarter={index}
							day={day}
							border={index !== 0 && index % 4 === 0}
							selecting={selecting}
							setSelecting={setSelecting}
							highlight={!done && index >= start && index <= end}
							setDone={setDone}
							start={start}
							setStart={setStart}
							end={end}
							setEnd={setEnd}
						/>
					))}
					{events.map((event, index) => (
						<Event key={event.title + index} event={event} />
					))}
				</div>
			</DndContext>
		</div>
	);
});
