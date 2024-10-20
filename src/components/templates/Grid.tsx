"use client";

import Event from "@/components/atoms/Event";
import Logo from "@/components/atoms/Logo";
import Day from "@/components/molecules/Day";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { useDebounceCallback, useWindowSize } from "usehooks-ts";

import { gridHeight, pixelPerMinute, pixelPerQuarter } from "@/lib/consts";
import { useEventStore } from "@/lib/stores/event";
import { useSettingStore } from "@/lib/stores/settings";

interface Props {
	gridRef: React.RefObject<HTMLDivElement>;
	scrollToCurrentDate: () => void;
	setCurrentMonth: () => void;
}

export default function Grid({
	gridRef,
	scrollToCurrentDate,
	setCurrentMonth,
}: Props) {
	const [days, setDays] = useState<Date[]>(
		getDateRange(dayjs().startOf("day").toDate()),
	);
	const { events, editEvent, getEventById } = useEventStore();
	const { width: windowWidth } = useWindowSize({
		debounceDelay: 100,
		initializeWithValue: true,
	});
	const [dayWidth, setDayWidth] = useState(0);
	const prevDayWidth = useRef(0);
	const { settings } = useSettingStore();
	const [dragging, setDragging] = useState(false);

	useEffect(() => {
		console.debug(events); //! DEBUG: Remove
	}, [events]);

	useEffect(() => {
		if (prevDayWidth.current === 0) {
			prevDayWidth.current = dayWidth;
			scrollToCurrentDate();
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dayWidth]);

	useEffect(() => {
		if (gridRef.current) {
			const newDayWidth = gridRef.current.offsetWidth / settings.view;
			prevDayWidth.current = dayWidth; // Update previous value
			setDayWidth(newDayWidth);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [settings.view, windowWidth]);

	return (
		<DndContext
			onDragStart={() => setDragging(true)}
			onDragEnd={handleDragEnd}
			collisionDetection={closestCenter}>
			<div
				className="grid-col-3 grid w-full snap-x snap-mandatory grid-flow-col overflow-scroll no-scrollbar"
				ref={gridRef}
				onScroll={useDebounceCallback(setCurrentMonth, 100)}>
				{dayWidth === 0 ? (
					<div className="h-[calc(100vh-120px)] w-full flex justify-center items-center">
						<Logo />
					</div>
				) : (
					days.map((date: Date) => (
						<Day
							key={date.toString()}
							id={date.toString()}
							height={gridHeight}
							width={dayWidth}
							dragging={dragging}
							day={dayjs(date).startOf("day").toDate()}>
							{events
								.filter(
									(event) =>
										dayjs(event.start).format("DD/MM/YYYY") ===
										dayjs(date).format("DD/MM/YYYY"),
								)
								.map((event) => (
									<Event
										key={event.id}
										event={event}
										containerHeight={gridHeight}
									/>
								))}
						</Day>
					))
				)}
			</div>
		</DndContext>
	);

	function handleDragEnd(event: DragEndEvent) {
		const { over, delta, active } = event;

		if (over) {
			const eventId = active.id as string;
			const event = getEventById(eventId);

			if (!event) return;
			//const { start, end } = getNewStartEndTime(
			//  active.data.current?.y * pixelPerMinute ?? 0, // The delta in pixels the event is being dragged
			//  event.start,
			//  event.end,
			//  new Date(over.id), // The date of the day the event is being dragged to
			//);

			const pixelOffset = active.data.current?.y * pixelPerMinute ?? 0;
			const start = getTimeFromYOffsetAndTime(
				pixelOffset,
				event.start,
				new Date(over.id),
			);
			const end = getTimeFromYOffsetAndTime(
				pixelOffset,
				event.end,
				new Date(over.id),
			);

			editEvent({ ...event, start, end });
		}

		setDragging(false);
	}
}

export function getTimeFromYOffsetAndTime(
	offset: number,
	time: Date,
	day: Date,
): Date {
	const minutes =
		Math.floor((offset * pixelPerMinute) / pixelPerQuarter) * pixelPerQuarter;

	const i = dayjs(time)
		.set("date", dayjs(day).date())
		.set("month", dayjs(day).month())
		.set("year", dayjs(day).year())
		.add(minutes, "minute")
		.toDate();

	return i;
}

function getDateRange(date: Date): Date[] {
	const currentDate = dayjs(date);
	const dateRange: Date[] = [];
	const range = 60;

	// Add 60 previous days
	for (let i = range; i > 0; i--) {
		const previousDate = currentDate.subtract(i, "day");
		dateRange.push(previousDate.toDate());
	}

	// Add current date
	dateRange.push(currentDate.toDate());

	// Add 60 next days
	for (let i = 1; i <= range; i++) {
		const nextDate = currentDate.add(i, "day");
		dateRange.push(nextDate.toDate());
	}

	return dateRange;
}
