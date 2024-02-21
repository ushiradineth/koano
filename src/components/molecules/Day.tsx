"use client";

import Quarter from "@/components/atoms/Quarter";
import Time from "@/components/atoms/Time";
import { useSettingContext } from "@/components/utils/Context";
import {
	cn,
	getDateTimePairFromSelection,
	getDayWithDate,
	isToday,
} from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
	day: Date;
	reset: boolean;
	width: number;
}

export default function Day({ day, reset, width }: Props) {
	const router = useRouter();
	const [selecting, setSelecting] = useState(false);
	const [done, setDone] = useState(true);
	const [start, setStart] = useState<number>(-1);
	const [end, setEnd] = useState<number>(-1);
	const date = getDayWithDate(day);
	const today = isToday(day);
	const settingContext = useSettingContext();

	useEffect(() => {
		if (!selecting) {
			setStart(-1);
			setEnd(-1);
			setDone(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reset]);

	useEffect(() => {
		if (!selecting && start !== -1 && end !== -1) {
			const selection = getDateTimePairFromSelection(start, end, day);
			const url = new URL(window.location.href);
			url.searchParams.set("start", selection.startDateTime.toISOString());
			url.searchParams.set("end", selection.endDateTime.toISOString());
			router.push(url.toString(), { scroll: false });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selecting]);

	return (
		<div
			id={`${date.day}-${date.date}-${date.month}-${date.year}-${date.week}`}
			className={cn(
				"flex flex-col items-center justify-between gap-2",
				"snap-start",
				"h-full w-[calc(100vw-64px)]",
			)}
			style={{ width: `${width / settingContext.view}px` }}>
			<span className="flex h-5 gap-2 font-bold">
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
						border={index !== 0 && index % 4 === 0}
						selecting={selecting}
						setSelecting={setSelecting}
						highlight={!done && index >= start && index <= end}
						setDone={setDone}
						setStart={setStart}
						setEnd={setEnd}
					/>
				))}
			</div>
		</div>
	);
}
