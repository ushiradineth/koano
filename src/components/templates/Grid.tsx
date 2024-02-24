"use client";

import Day from "@/components/molecules/Day";
import { useEventContext, useSettingContext } from "@/components/utils/Context";
import { getDateRange } from "@/lib/utils";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { useDebounceCallback, useWindowSize } from "usehooks-ts";
import Logo from "../atoms/Logo";

interface Props {
	gridRef: React.RefObject<HTMLDivElement>;
	scrollToCurrentDate: () => void;
	setCurrentMonth: () => void;
}

export default function Grid({
	gridRef,
	scrollToCurrentDate,
	setCurrentMonth,
}: Props) {
	const [days, setDays] = useState(
		getDateRange(dayjs().startOf("day").toDate()),
	);
	const eventContext = useEventContext();
	const { width: windowWidth } = useWindowSize({
		debounceDelay: 100,
		initializeWithValue: true,
	});
	const [dayWidth, setDayWidth] = useState(0);
	const prevDayWidth = useRef(0);
	const settingContext = useSettingContext();

	useEffect(() => {
		console.log(eventContext.events);
	}, [eventContext.events]);

	useEffect(() => {
		if (prevDayWidth.current === 0) {
			prevDayWidth.current = dayWidth;
			scrollToCurrentDate();
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dayWidth]);

	useEffect(() => {
		if (gridRef.current) {
			const newDayWidth = gridRef.current.offsetWidth / settingContext.view;
			prevDayWidth.current = dayWidth; // Update previous value
			setDayWidth(newDayWidth);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [settingContext.view, windowWidth]);

	return (
		<div
			className="grid-col-3 grid w-full snap-x snap-mandatory grid-flow-col overflow-scroll"
			ref={gridRef}
			onScroll={useDebounceCallback(setCurrentMonth, 100)}>
			{dayWidth === 0 ? (
				<div className="h-[calc(100vh-120px)] w-full flex justify-center items-center">
					<Logo />
				</div>
			) : (
				days.map((day, index) => (
					<Day
						key={index}
						day={dayjs(day).startOf("day").toDate()}
						width={dayWidth}
					/>
				))
			)}
		</div>
	);
}
