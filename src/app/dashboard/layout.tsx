"use client";

import { repeatValues } from "@/lib/consts";
import { Event, PickerType } from "@/lib/types";
import { generateTimeArray, generateTimezoneArray } from "@/lib/utils";
import { Suspense, createContext, useContext, useState } from "react";

type EventContextType = {
	events: Event[];
	setEvents: (value: Event[]) => void;
};

const EventContext = createContext<EventContextType>({
	events: [],
	setEvents: () => undefined,
});

export const useEventContext = () => useContext(EventContext);

type DataContextType = {
	time: PickerType[];
	timezone: PickerType[];
	repeated: PickerType[];
};

const DataContext = createContext<DataContextType>({
	time: [],
	timezone: [],
	repeated: [],
});

export const useDataContext = () => useContext(DataContext);

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [events, setEvents] = useState<Event[]>([]);

	return (
		<section>
			<EventContext.Provider value={{ events, setEvents }}>
				<DataContext.Provider
					value={{
						time: generateTimeArray(),
						timezone: generateTimezoneArray(),
						repeated: repeatValues,
					}}>
					<Suspense>{children}</Suspense>
				</DataContext.Provider>
			</EventContext.Provider>
		</section>
	);
}
