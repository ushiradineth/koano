import { cn } from "@/lib/utils";
import dayjs from "dayjs";

interface Props {
	today: boolean;
}

export default function Time({ today }: Props) {
	return (
		<div
			className={cn(
				today ? "absolute w-full border-b-2 border-orange-400" : "",
			)}
			style={{ top: dayjs().hour() * 60 + dayjs().minute() }}></div>
	);
}
