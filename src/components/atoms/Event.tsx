"use client";

import { Event } from "@/lib/types";
import {
	calculateTimeDifference,
	cn,
	getDateFromEventTimer,
} from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import dayjs from "dayjs";
import { CSSProperties, memo } from "react";

interface Props {
	event: Event;
}

export default memo(function Event({ event }: Props) {
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({
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

	const combinedStyle: CSSProperties = {
		...defaultStyles,
		opacity: isDragging ? 0.4 : undefined,
		transform: CSS.Translate.toString(transform),
		touchAction: "none",
	};

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
