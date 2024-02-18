"use client";

import AddEvent from "@/components/AddEvent";
import Grid from "@/components/Grid";
import Header from "@/components/Header";
import TimeBlock from "@/components/TimeBlock";
import { cn, getDayWithDate } from "@/lib/utils";
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function Dashboard() {
	const params = useSearchParams();

	const [addEvent, setAddEvent] = useState(false);
	const gridRef = useRef<HTMLDivElement>(null);

	const scrollToCurrentDate = useCallback(() => {
		if (gridRef.current) {
			const children = gridRef.current.children;
			for (let i = 0; i < children.length; i++) {
				const child = children[i] as HTMLElement;
				const date = getDayWithDate(dayjs().startOf("day").toDate());

				if (child.textContent?.includes(`${date.day}${date.date}`)) {
					gridRef.current.scrollTo(
						gridRef.current.children[i].clientWidth * 7,
						0,
					);
				}
			}
		}
	}, []);

	// @ts-expect-error week exists..
	const weekNumber = useMemo(() => dayjs().week(), []);

	useEffect(() => {
		if (params.get("start") && params.get("end")) {
			setAddEvent(true);
		}
	}, [params]);

	return (
		<main className="flex min-h-screen w-full flex-col items-center justify-between bg-background">
			<Header scrollToCurrentDate={scrollToCurrentDate} />
			<AddEvent open={addEvent} setOpen={setAddEvent} />

			<div className={cn("flex justify-between", "my-10 text-sm", "w-full")}>
				<div className={cn("flex flex-col", "h-full w-20")}>
					<p className="flex items-center justify-center w-full h-7">
						W{weekNumber}
					</p>
					<span className="flex flex-col border-t">
						{new Array(23 * 1).fill(0).map((_, index) => (
							<TimeBlock key={index} hour={index + 1} />
						))}
					</span>
				</div>
				<Grid gridRef={gridRef} scrollToCurrentDate={scrollToCurrentDate} />
			</div>
		</main>
	);
}
