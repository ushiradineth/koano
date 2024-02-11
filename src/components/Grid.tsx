"use client";

import Day from "@/components/Day";
import { getDateRange, queryParams } from "@/lib/utils";
import dayjs from "dayjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

interface Props {
	gridRef: React.RefObject<HTMLDivElement>;
	scrollToCurrentDate: () => void;
}

export default function Grid({ gridRef, scrollToCurrentDate }: Props) {
	const router = useRouter();
	const params = useSearchParams();
	const pathname = usePathname();
	const [reset, setReset] = useState(true);
	const [days, setDays] = useState(
		getDateRange(dayjs().startOf("day").toDate()),
	);

	useEffect(() => {
		scrollToCurrentDate();
	}, [scrollToCurrentDate]);

	useEffect(() => {
		if (params.get("clear")) {
			setReset(!reset);
			const url = queryParams(["clear"], [], params.entries(), pathname);

			router.replace(url, { scroll: false });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [params]);

	return (
		<div
			className="grid-col-3 grid w-full snap-x snap-mandatory grid-flow-col overflow-scroll"
			ref={gridRef}
			onMouseDown={() => setReset(!reset)}>
			{days.map((day, index) => (
				<Day
					key={index}
					day={dayjs(day).startOf("day").toDate()}
					reset={reset}
				/>
			))}
		</div>
	);
}
