import { cn, getCurrentHourTime, getHour } from "@/lib/utils";

interface Props {
	hour: number;
}

export default function TimeBlock({ hour }: Props) {
	const currentHour = getCurrentHourTime(hour - 1);

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
}
