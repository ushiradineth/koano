"use client";

import { repeatValues } from "@/lib/consts";
import { Event, PickerType } from "@/lib/types";
import { generateTimeArray, generateTimezoneArray } from "@/lib/utils";
import { ReactNode, createContext, useContext, useState } from "react";

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

interface Props {
	children: ReactNode;
}

export default function Context({ children }: Props) {
	const [events, setEvents] = useState<Event[]>([]);

	return (
		<EventContext.Provider value={{ events, setEvents }}>
			<DataContext.Provider
				value={{
					time: generateTimeArray(),
					timezone: generateTimezoneArray(),
					repeated: repeatValues,
				}}>
				{children}
			</DataContext.Provider>
		</EventContext.Provider>
	);
}
