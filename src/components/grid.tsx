"use client";

import { getDateRange } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import Day from "./day";

interface Props {
	gridRef: React.RefObject<HTMLDivElement>;
	scrollToCurrentDate: () => void;
}

export default function Grid({ gridRef, scrollToCurrentDate }: Props) {
	const [init, setInit] = useState(true);
	const [days, setDays] = useState(getDateRange(new Date()));
	const [selection, setSelection] = useState();

	useEffect(() => {
		scrollToCurrentDate();
	}, [scrollToCurrentDate]);

	return (
		<div
			className="grid-col-3 grid w-full snap-x snap-mandatory grid-flow-col overflow-scroll"
			ref={gridRef}
			onMouseDown={() => setInit(!init)}>
			{days.map((day, index) => (
				<Day key={index} day={new Date(day)} init={init} />
			))}
		</div>
	);
}
