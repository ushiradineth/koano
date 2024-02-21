import { cn } from "@/lib/utils";
import dayjs from "dayjs";

interface Props {
	today: boolean;
}

export default function Time({ today }: Props) {
	return (
		<div
			className={cn(
				"absolute w-full border-b-2 border-orange-400",
				today ? "border-opacity-100" : "border-opacity-25",
			)}
			style={{ top: dayjs().hour() * 60 + dayjs().minute() }}></div>
	);
}
