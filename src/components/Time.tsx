import { cn } from "@/lib/utils";
import dayjs from "dayjs";

interface Props {
	today: boolean;
}

export default function Time({ today }: Props) {
	return (
		<div
			className={cn(
				"absolute w-full border-b-2",
				today ? "border-purple-400" : "border-pink-200",
			)}
			style={{ top: dayjs().hour() * 60 + dayjs().minute() }}></div>
	);
}
