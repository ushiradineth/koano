"use client";

import React, { useEffect, useState } from "react";
import Quarter from "./quarter";
import { cn, getDayWithDate, isToday } from "@/lib/utils";

interface Props {
	day: Date;
	reset: boolean;

}

export default function Day({ day, reset }: Props) {
	const [selecting, setSelecting] = useState(false);
	const [done, setDone] = useState(true);
	const [start, setStart] = useState<number>(-1);
	const [end, setEnd] = useState<number>(-1);
	const date = getDayWithDate(day);

	useEffect(() => {
		if (!selecting) {
			setStart(-1);
			setEnd(-1);
			setDone(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reset]);

	useEffect(() => {
		if (!selecting) {
			console.log(start, end);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selecting]);

	return (
		<div
			className={cn(
				"flex flex-col items-center justify-between gap-2",
				"snap-start",
				"h-full w-[500px]",
			)}>
			<span className="flex h-5 gap-2 font-bold">
				<p>{date.day}</p>
				<p className={cn(isToday(day) && "rounded-sm bg-[#EF4B46] px-[6px]")}>
					{date.date}
				</p>
			</span>
			<div
				className={cn(
					"flex flex-col items-center justify-between",
					"border",
					"h-full w-full",
				)}>
				{new Array(24 * 1 * 4).fill(0).map((_, index) => (
					<Quarter
						key={index}
						quarter={index}
						border={index !== 0 && index % 4 === 0}
						selecting={selecting}
						setSelecting={setSelecting}
						highlight={!done && index > start && index < end}
						setDone={setDone}
						setStart={setStart}
						setEnd={setEnd}
					/>
				))}
			</div>
		</div>
	);
}
