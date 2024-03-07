"use client";

import Event from "@/components/atoms/Event";
import Quarter from "@/components/atoms/Quarter";
import Time from "@/components/atoms/Time";
import { useDataContext, useEventContext } from "@/components/utils/Context";
import { Event as EventType } from "@/lib/types";
import {
	cn,
	getDateTimePairFromSelection,
	getDayWithDate,
	getTimeDifferenceInQuarters,
	getTimeFromQuarter,
	isStartBeforeEnd,
	isToday,
	queryParams,
} from "@/lib/utils";
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useState } from "react";

import {
	restrictToFirstScrollableAncestor,
	restrictToVerticalAxis,
} from "@dnd-kit/modifiers";

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
	const dataContext = useDataContext();
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
		(eventId: string, newStart: string) => {
			const [id, title, date, start, end] = eventId.split(",");
			const events = eventContext.events;

			for (const event of events) {
				if (event.id === id) {
					const newStartQuarter = Number(newStart.split(",")[1]);

					const diff = getTimeDifferenceInQuarters(
						start,
						end === dataContext.times[0].value ? "24:00" : end,
					);
					event.start = getTimeFromQuarter(newStartQuarter, date);
					event.end = getTimeFromQuarter(newStartQuarter + diff, date);

					if (!isStartBeforeEnd(event.start, event.end)) {
						event.start = getTimeFromQuarter(newStartQuarter - 1, date);
						event.end = getTimeFromQuarter(newStartQuarter + diff - 1, date);
					} else {
						event.start = getTimeFromQuarter(newStartQuarter, date);
						event.end = getTimeFromQuarter(newStartQuarter + diff, date);
					}

					break;
				}
			}

			eventContext.setEvents(events);
		},
		[dataContext.times, eventContext],
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
				sensors={useSensors(
					useSensor(PointerSensor),
					useSensor(KeyboardSensor),
				)}
				onDragEnd={(event) =>
					event.collisions?.[0] &&
					updateEvents(
						event.active.id.toString(),
						event.collisions?.[0].id.toString() ?? "",
					)
				}
				modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}>
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
