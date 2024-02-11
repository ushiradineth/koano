import { getHour } from "@/lib/utils";

interface Props {
	hour: number;
}

export default function TimeBlock({ hour }: Props) {
	return (
		<div className="flex h-[60px] w-full items-center justify-end px-2 font-mono font-medium">
			{getHour(hour)}
		</div>
	);
}
