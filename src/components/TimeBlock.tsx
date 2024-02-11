import { cn, getCurrentHourTime, getHour } from "@/lib/utils";

interface Props {
	hour: number;
}

export default function TimeBlock({ hour }: Props) {
	const currentHour = getCurrentHourTime(hour - 1);

	return (
		<>
			<div className="flex h-[60px] relative w-full items-center justify-end px-2 font-mono font-medium">
				<p
					className={cn(
						"absolute top-12",
						currentHour.isPreviousHour && currentHour.minutes < 10 && "hidden",
						currentHour.isCurrentHour && currentHour.minutes > 50 && "hidden",
					)}>
					{getHour(hour)}
				</p>
				{currentHour.isCurrentHour && (
					<p
						className={cn("absolute bg-background")}
						style={{ top: currentHour.minutes - 6 }}>
						{currentHour.time}
					</p>
				)}
			</div>
		</>
	);
}
