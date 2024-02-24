"use client";

import TimeBlock from "@/components/atoms/TimeBlock";
import Header from "@/components/molecules/Header";
import Grid from "@/components/templates/Grid";
import { useSettingContext } from "@/components/utils/Context";
import { calculateDaysToPreviousMonday, cn, getDayWithDate } from "@/lib/utils";
import dayjs from "dayjs";

import { useCallback, useRef, useState } from "react";

export default function Dashboard() {
	const gridRef = useRef<HTMLDivElement>(null);
	// @ts-expect-error week exists
	const [week, setWeek] = useState(dayjs(new Date()).week());
	const [month, setMonth] = useState(dayjs(new Date()).format("MMMM"));
	const [year, setYear] = useState(dayjs(new Date()).format("YYYY"));
	const settingContext = useSettingContext();

	const scrollToCurrentDate = useCallback(() => {
		if (gridRef.current) {
			const children = gridRef.current.children;
			for (let i = 0; i < children.length; i++) {
				const child = children[i] as HTMLElement;
				const date = getDayWithDate(dayjs().startOf("day").toDate());

				if (
					child.id ==
					`${date.day}-${date.date}-${date.month}-${date.year}-${date.week}`
				) {
					let reduce = 0;
					if (settingContext.view === 7) {
						reduce = calculateDaysToPreviousMonday(date.day);
					}
					gridRef.current.scrollTo(
						gridRef.current.children[i].clientWidth * (i + reduce),
						0,
					);
				}
			}
		}
	}, [settingContext.view]);

	const setCurrentMonth = useCallback(() => {
		if (gridRef.current) {
			const children = gridRef.current.children;
			for (let i = 0; i < children.length; i++) {
				const child = children[i];
				const rect = child.getBoundingClientRect();

				if (rect.x > 0) {
					setMonth(child.id.split("-")[2]);
					setYear(child.id.split("-")[3]);
					setWeek(child.id.split("-")[4]);

					break;
				}
			}
		}
	}, []);

	return (
		<main className="flex w-full flex-col items-center justify-between bg-background">
			<Header
				scrollToCurrentDate={scrollToCurrentDate}
				month={month}
				year={year}
			/>

			{settingContext.view !== 30 ? (
				<div className={cn("flex justify-between", "my-2 text-sm", "w-full")}>
					<div className={cn("flex flex-col", "h-full w-20")}>
						<p className="flex items-center justify-center w-full h-14 sm:h-7 pb-1.5">
							W{week}
						</p>
						<span className="flex flex-col border-t">
							{new Array(23 * 1).fill(0).map((_, index) => (
								<TimeBlock key={index} hour={index + 1} />
							))}
						</span>
					</div>
					<Grid
						gridRef={gridRef}
						scrollToCurrentDate={scrollToCurrentDate}
						setCurrentMonth={setCurrentMonth}
					/>
				</div>
			) : (
				<p className="h-[calc(100vh-64px)] flex items-center justify-center font-semibold text-2xl">
					Month view coming soon
				</p>
			)}
		</main>
	);
}
