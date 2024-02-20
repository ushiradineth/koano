"use client";

import { repeatValues } from "@/lib/consts";
import { Event, PickerType, View } from "@/lib/types";
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
	view: View;
	setView: (value: View) => void;
};

const DataContext = createContext<DataContextType>({
	time: [],
	timezone: [],
	repeated: [],
	view: 1,
	setView: (value: View) => undefined,
});

export const useDataContext = () => useContext(DataContext);

interface Props {
	children: ReactNode;
}

export default function Context({ children }: Props) {
	const [events, setEvents] = useState<Event[]>([]);
	const [view, setView] = useState<View>(1);

	return (
		<EventContext.Provider value={{ events, setEvents }}>
			<DataContext.Provider
				value={{
					time: generateTimeArray(),
					timezone: generateTimezoneArray(),
					repeated: repeatValues,
					view,
					setView,
				}}>
				{children}
			</DataContext.Provider>
		</EventContext.Provider>
	);
}
