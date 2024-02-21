"use client";

import { repeatValues } from "@/lib/consts";
import { Event, PickerType, View } from "@/lib/types";
import {
	generateTimeArray,
	generateTimezoneArray,
	getUserTimezone,
} from "@/lib/utils";
import {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

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
	times: PickerType[];
	timezones: PickerType[];
	timezone: PickerType;
	repeated: PickerType[];
	view: View;
	setView: (value: View) => void;
};

const DataContext = createContext<DataContextType>({
	times: [],
	timezones: [],
	timezone: { label: "", value: "" },
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
	const [initTimezones, setInitTimezones] = useState<PickerType[]>([]);

	useEffect(() => {
		setInitTimezones(generateTimezoneArray());
	}, []);

	return (
		<EventContext.Provider value={{ events, setEvents }}>
			<DataContext.Provider
				value={{
					times: generateTimeArray(),
					timezones: initTimezones,
					timezone: getUserTimezone(initTimezones) ?? initTimezones[0],
					repeated: repeatValues,
					view,
					setView,
				}}>
				{children}
			</DataContext.Provider>
		</EventContext.Provider>
	);
}
