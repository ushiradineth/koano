import { Event } from "@/lib/types";

import {
  post as CreateEvent,
  deleteEvent as DeleteEvent,
  put as PutEvent,
} from "@/lib/api/event";
import { ErrorResponse, Status } from "@/lib/api/types";
import { useContextStore } from "@/lib/stores/context";
import dayjs from "dayjs";
import { create } from "zustand";

type EventStore = {
  events: Event[];
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  editEvent: (event: Event) => void;
  removeEvent: (id: string) => void;
  getEventById: (id: string) => Event | undefined;
};

export const useEventStore = create<EventStore>()((set, get) => ({
  events: [],
  setEvents: (events: Event[]) => set({ events }),
  addEvent: async (event: Event) => {
    useContextStore.setState({ activeEvent: event });
    set((state) => ({ events: [...state.events, event] }));

    const reset = () => {
      set((state) => ({
        events: state.events.filter((e) => e.id !== event.id),
      }));
    };

    try {
      const response = await CreateEvent({
        title: event.title,
        start_time: dayjs(event.start_time)
          .utc()
          .format("YYYY-MM-DDTHH:mm:ss[Z]"),
        end_time: dayjs(event.end_time).utc().format("YYYY-MM-DDTHH:mm:ss[Z]"),
        timezone: event.timezone,
        repeated: event.repeated,
        access_token: useContextStore.getState().accessToken ?? "",
      });

      if (response.status !== Status.Success) {
        console.error((response as any as ErrorResponse).error);
        return reset();
      }

      useContextStore.getState().setActiveEvent(response.data);

      return set((state) => ({
        events: state.events.map((e) =>
          e.id === event.id ? response.data : e,
        ),
      }));
    } catch (error) {
      console.error(error);
      return reset();
    }
  },
  editEvent: async (event: Event) => {
    const initialEvent = get().events.find((e) => e.id === event.id);
    if (!initialEvent) return;

    useContextStore.setState({ activeEvent: event });
    set((state) => ({
      events: state.events.map((e) => (e.id === event.id ? event : e)),
    }));

    const reset = () => {
      return set((state) => ({
        events: state.events.map((e) =>
          e.id === initialEvent.id ? initialEvent : e,
        ),
      }));
    };

    try {
      const response = await PutEvent({
        id: event.id,
        title: event.title,
        start_time: dayjs(event.start_time)
          .utc()
          .format("YYYY-MM-DDTHH:mm:ss[Z]"),
        end_time: dayjs(event.end_time).utc().format("YYYY-MM-DDTHH:mm:ss[Z]"),
        timezone: event.timezone,
        repeated: event.repeated,
        access_token: useContextStore.getState().accessToken ?? "",
      });

      if (response.status !== Status.Success) {
        console.error((response as any as ErrorResponse).error);
        return reset();
      }

      useContextStore.getState().setActiveEvent(response.data);

      return set((state) => ({
        events: state.events.map((e) =>
          e.id === response.data.id ? response.data : e,
        ),
      }));
    } catch (error) {
      console.error(error);
      return reset();
    }
  },
  removeEvent: async (id: string) => {
    const initialEvent = get().events.find((e) => e.id === id);
    if (!initialEvent) return;

    useContextStore.setState({ activeEvent: null });
    set((state) => ({ events: state.events.filter((e) => e.id !== id) }));

    const reset = () => {
      useContextStore.setState({ activeEvent: initialEvent });
      set((state) => ({
        events: [...state.events, initialEvent],
      }));
    };

    try {
      const response = await DeleteEvent({
        id,
        access_token: useContextStore.getState().accessToken ?? "",
      });

      if (response.status !== Status.Success) {
        console.error((response as any as ErrorResponse).error);
        return reset();
      }
    } catch (error) {
      console.error(error);
      return reset();
    }
  },
  getEventById: (id: string) => {
    return get().events.find((event) => event.id === id);
  },
}));
