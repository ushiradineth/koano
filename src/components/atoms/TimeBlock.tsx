"use client";

import { cn, getCurrentHourTime, getHour } from "@/lib/utils";
import dayjs from "dayjs";
import { memo, useEffect, useState } from "react";

interface Props {
	hour: number;
}

export default memo(function TimeBlock({ hour }: Props) {
	const [currentHour, setCurrentHour] = useState(getCurrentHourTime(hour - 1));

	useEffect(() => {
		if (currentHour.isCurrentHour) {
			const interval = setInterval(
				() => setCurrentHour(getCurrentHourTime(hour - 1)),
				(60 - dayjs().second()) * 1000,
			);
			return () => {
				clearInterval(interval);
			};
		}
	}, [currentHour.isCurrentHour, hour]);

	return (
		<div className="flex h-[60px] relative w-full items-center justify-center px-2 font-mono font-medium text-xs">
			<p
				className={cn(
					"absolute top-[52px]",
					currentHour.isPreviousHour && currentHour.minutes < 15 && "hidden",
					currentHour.isCurrentHour && currentHour.minutes > 45 && "hidden",
				)}>
				{getHour(hour)}
			</p>
			{currentHour.isCurrentHour && (
				<p
					className={cn("absolute bg-background")}
					style={{ top: currentHour.minutes - 8 }}>
					{currentHour.time}
				</p>
			)}
		</div>
	);
});
