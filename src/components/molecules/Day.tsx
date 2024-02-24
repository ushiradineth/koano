"use client";

import Quarter from "@/components/atoms/Quarter";
import Time from "@/components/atoms/Time";
import {
	cn,
	getDateTimePairFromSelection,
	getDayWithDate,
	isToday,
	queryParams,
} from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { memo, useEffect, useState } from "react";

interface Props {
	day: Date;
	width: number;
}

export default memo(function Day({ day, width }: Props) {
	const router = useRouter();
	const pathname = usePathname();
	const params = useSearchParams();
	const [selecting, setSelecting] = useState(false);
	const [done, setDone] = useState(true);
	const [start, setStart] = useState<number>(-1);
	const [end, setEnd] = useState<number>(-1);
	const date = getDayWithDate(day);
	const today = isToday(day);

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

	return (
		<div
			id={`${date.day}-${date.date}-${date.month}-${date.year}-${date.week}`}
			className={cn(
				"flex flex-col items-center justify-between gap-2",
				"snap-start",
				"h-full",
			)}
			style={{ width: `${width}px` }}>
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
});
