"use client";

import Grid from "@/components/grid";
import Header from "@/components/header";
import TimeBlock from "@/components/timeblock";
import { cn } from "@/lib/utils";
import { useRef } from "react";

export default function Dashboard() {
	const gridRef = useRef<HTMLDivElement>(null);

	const scrollToCurrentDate = (behavior: "smooth" | "instant") => {
		if (gridRef.current) {
			gridRef.current.children[7].scrollIntoView({
				behavior,
				inline: "start",
				block: "start",
			});
		}
	};

	return (
		<main className="flex min-h-screen w-full flex-col items-center justify-between bg-background">
			<Header scrollToCurrentDate={scrollToCurrentDate} />
			<div
				className={cn(
					"flex items-center justify-between",
					"py-8 text-sm",
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
