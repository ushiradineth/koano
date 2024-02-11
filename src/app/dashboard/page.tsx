"use client";

import Grid from "@/components/grid";
import Header from "@/components/header";
import TimeBlock from "@/components/timeblock";
import { cn, getDayWithDate } from "@/lib/utils";
import { useCallback, useRef } from "react";

export default function Dashboard() {
	const gridRef = useRef<HTMLDivElement>(null);

	const scrollToCurrentDate = useCallback(() => {
		if (gridRef.current) {
			const children = gridRef.current.children;
			for (let i = 0; i < children.length; i++) {
				const child = children[i] as HTMLElement;
				const date = getDayWithDate(new Date());

				if (child.textContent?.includes(`${date.day}${date.date}`)) {
					gridRef.current.scrollTo(
						gridRef.current.children[i].clientWidth * 7,
						0,
					);
				}
			}
		}
	}, []);

	return (
		<main className="flex min-h-screen w-full flex-col items-center justify-between bg-background">
			<Header scrollToCurrentDate={scrollToCurrentDate} />
			<div
				className={cn(
					"flex items-center justify-between",
					"my-10 text-sm",
					"w-full",
				)}>
				<div className={cn("flex flex-col", "h-full w-fit pt-6")}>
					{new Array(23 * 1).fill(0).map((_, index) => (
						<TimeBlock key={index} hour={index + 1} />
					))}
				</div>
				<Grid gridRef={gridRef} scrollToCurrentDate={scrollToCurrentDate} />
			</div>
		</main>
	);
}
