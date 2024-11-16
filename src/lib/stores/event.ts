import { Event } from "@/lib/types";

import { useContextStore } from "@/lib/stores/context";
import { create } from "zustand";

type EventStore = {
  events: Event[];
  addEvent: (event: Event) => void;
  editEvent: (event: Event) => void;
  removeEvent: (id: string) => void;
  getEventById: (id: string) => Event | undefined;
};

export const useEventStore = create<EventStore>()((set, get) => ({
  events: [],
  addEvent: (event: Event) => {
    useContextStore.setState({ activeEvent: event });
    return set((state) => ({ events: [...state.events, event] }));
  },
  editEvent: (event: Event) => {
    useContextStore.setState({ activeEvent: event });
    return set((state) => ({
      events: state.events.map((e) => (e.id === event.id ? event : e)),
    }));
  },
  removeEvent: (id: string) =>
    set((state) => ({ events: state.events.filter((e) => e.id !== id) })),
  getEventById: (id: string) => {
    return get().events.find((event) => event.id === id);
  },
}));
