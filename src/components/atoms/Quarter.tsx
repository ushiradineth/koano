"use client";

import {
	cn,
	convertISOToTime,
	getDateTimePairFromSelection,
} from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { memo, useCallback } from "react";

interface Props {
	quarter: number;
	day: Date;
	border: boolean;
	selecting: boolean;
	setSelecting: (value: boolean) => void;
	highlight: boolean;
	setDone: (value: boolean) => void;
	start: number;
	setStart: (value: number) => void;
	end: number;
	setEnd: (value: number) => void;
}

export default memo(function Quarter({
	quarter,
	day,
	border,
	selecting,
	setSelecting,
	highlight,
	setDone,
	start,
	setStart,
	end,
	setEnd,
}: Props) {
	const selection = getDateTimePairFromSelection(start, end, day);

	const { setNodeRef } = useDroppable({
		id: `${day.toISOString()},${quarter}`,
	});

	const handleMouseDown = useCallback(() => {
		if (!highlight) {
			// Reset previous selection
			setEnd(-1);
		}

		setSelecting(true);
		setDone(false);

		// Start selecting from the current quarter
		setStart(quarter);
	}, [highlight, quarter, setEnd, setSelecting, setStart, setDone]);

	const handleMouseUp = useCallback(() => {
		setSelecting(false);
		setEnd(quarter);
	}, [quarter, setEnd, setSelecting]);

	const handleMouseOver = useCallback(() => {
		if (selecting) {
			setEnd(quarter);
		}
	}, [quarter, selecting, setEnd]);

	return (
		<span
			ref={setNodeRef}
			className={cn(
				"flex items-center justify-center",
				border && "border-t",
				"h-[15px] w-full",
				highlight &&
					"border-purple-400 border-opacity-25 bg-purple-300 bg-opacity-50",
			)}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseOver={handleMouseOver}>
			{quarter === start && (
				<p
					className={cn(
						"select-none text-left font-bold w-full",
						start !== end && "pl-1 pt-2",
					)}>
					{convertISOToTime(selection.startDateTime.toISOString()).label}
					{" - "}
					{convertISOToTime(selection.endDateTime.toISOString()).label}
				</p>
			)}
		</span>
	);
});
