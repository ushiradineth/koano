"use client";

import { cn } from "@/lib/utils";
import { memo, useCallback } from "react";

interface Props {
	quarter: number;
	border: boolean;
	selecting: boolean;
	setSelecting: (value: boolean) => void;
	highlight: boolean;
	setDone: (value: boolean) => void;
	setStart: (value: number) => void;
	setEnd: (value: number) => void;
}

export default memo(function Quarter({
	quarter,
	border,
	selecting,
	setSelecting,
	highlight,
	setDone,
	setStart,
	setEnd,
}: Props) {
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
			className={cn(
				"flex items-center justify-center",
				border && "border-t",
				"h-[15px] w-full",
				highlight &&
					"border-purple-400 border-opacity-25 bg-purple-300 bg-opacity-50",
			)}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseOver={handleMouseOver}
		/>
	);
});
