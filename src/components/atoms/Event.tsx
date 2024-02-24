"use client";

import { Event } from "@/lib/types";
import {
	calculateTimeDifference,
	cn,
	getDateFromEventTimer,
} from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import dayjs from "dayjs";
import { memo } from "react";

interface Props {
	event: Event;
}

export default memo(function Event({ event }: Props) {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: `${event.title},${event.date},${event.start},${event.end}`,
	});

	const offset = dayjs(getDateFromEventTimer(event.date, event.start)).diff(
		dayjs(event.date).startOf("d"),
		"m",
	);
	const height = calculateTimeDifference(event.date, event.start, event.end);

	const defaultStyles = {
		top: offset,
		height: height,
	};

	const combinedStyle = transform
		? {
				...defaultStyles,
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
				"touch-action": "manipulation",
			}
		: defaultStyles;

	return (
		<span
			ref={setNodeRef}
			{...listeners}
			{...attributes}
			className={cn(
				"absolute flex",
				"w-full bg-orange-500 bg-opacity-75",
				height === 15 ? "items-center gap-2 pl-1" : " flex-col p-1",
			)}
			style={combinedStyle}>
			<p className="font-bold hidden sm:block">{event.title}</p>
			<p className="font-semibold text-xs hidden lg:block">
				{event.start}
				{" - "}
				{event.end}
			</p>
		</span>
	);
});
