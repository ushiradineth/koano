"use client";

import { getDateRange } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import Day from "./day";

interface Props {
	gridRef: React.RefObject<HTMLDivElement>;
	scrollToCurrentDate: () => void;
}

export default function Grid({ gridRef, scrollToCurrentDate }: Props) {
	const [reset, setReset] = useState(true);
	const [days, setDays] = useState(getDateRange(new Date()));
	const [selection, setSelection] = useState();

	useEffect(() => {
		scrollToCurrentDate();
	}, [scrollToCurrentDate]);

	return (
		<div
			className="grid-col-3 grid w-full snap-x snap-mandatory grid-flow-col overflow-scroll"
			ref={gridRef}
			onMouseDown={() => setReset(!reset)}>
			{days.map((day, index) => (
				<Day key={index} day={new Date(day)} reset={reset} />
			))}
		</div>
	);
}
