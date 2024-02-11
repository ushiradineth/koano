import { getHour } from "@/lib/utils";
import React from "react";

interface Props {
	hour: number;
}

export default function TimeBlock({ hour }: Props) {
	return (
		<div className="flex h-16 w-full items-center justify-end px-2 font-mono font-medium">
			{getHour(hour)}
		</div>
	);
}
