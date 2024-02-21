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

const EventContext = createContext<{
	events: Event[];
	setEvents: (value: Event[]) => void;
}>({
	events: [],
	setEvents: () => undefined,
});

const DataContext = createContext<{
	times: PickerType[];
	timezones: PickerType[];
	timezone: PickerType;
	repeated: PickerType[];
}>({
	times: [],
	timezones: [],
	timezone: { label: "", value: "" },
	repeated: [],
});

const SettingContext = createContext<{
	view: View;
	setView: (value: View) => void;
}>({
	view: 7,
	setView: (value: View) => undefined,
});

export const useEventContext = () => useContext(EventContext);
export const useDataContext = () => useContext(DataContext);
export const useSettingContext = () => useContext(SettingContext);

interface Props {
	children: ReactNode;
}

export default function Context({ children }: Props) {
	const [events, setEvents] = useState<Event[]>([]);
	const [view, setView] = useState<View>(7);
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
				}}>
				<SettingContext.Provider value={{ view, setView }}>
					{children}
				</SettingContext.Provider>
			</DataContext.Provider>
		</EventContext.Provider>
	);
}
