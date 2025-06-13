import type { Event, Preview } from "@/lib/types";
import { create } from "zustand";

type InteractionStore = {
  // When a user is dragging a selection to create a new event
  selecting: boolean;
  setSelecting: (selecting: boolean) => void;

  // When a user is extending an existing event by dragging either the top or bottom of the event
  extending: boolean;
  setExtending: (extending: boolean) => void;

  // Currently active event shown on the sidebar
  activeEvent: Event | null;
  setActiveEvent: (event: Event | null) => void;

  // Preview of the event being selected or extended
  preview: Preview | null;
  setPreview: (preview: Preview | null) => void;

  copiedEvents: Event[];
  setCopiedEvents: (copiedEvents: Event[]) => void;

  selectedEvents: Event[];
  setSelectedEvents: (selectedEvents: Event[]) => void;
  toggleSelectedEvent: (event: Event) => void;
  isEventSelected: (id: string) => boolean;

  modifierKeyPressed: boolean;
  setModifierKeyPressed: (metaClicked: boolean) => void;
};

export const useInteractionStore = create<InteractionStore>()((set, get) => ({
  selecting: false,
  setSelecting: (selecting: boolean) => set({ selecting }),

  extending: false,
  setExtending: (extending: boolean) => set({ extending }),

  activeEvent: null,
  setActiveEvent: (event: Event | null) => set({ activeEvent: event }),

  preview: null,
  setPreview: (preview: Preview | null) => set({ preview }),

  copiedEvents: [],
  setCopiedEvents: (copiedEvents: Event[]) => set({ copiedEvents }),

  selectedEvents: [],
  setSelectedEvents: (selectedEvents: Event[]) => set({ selectedEvents }),
  toggleSelectedEvent: (event: Event) => {
    const selectedEvents = get().selectedEvents;
    if (!selectedEvents.some((e) => e.id === event.id)) {
      set((state) => ({
        selectedEvents: [...state.selectedEvents, event],
      }));
    } else {
      set((state) => ({
        selectedEvents: state.selectedEvents.filter((e) => e.id !== event.id),
      }));
    }
  },
  isEventSelected: (id: string) => {
    const selectedEvents = get().selectedEvents;
    return selectedEvents.some((e) => e.id === id);
  },

  modifierKeyPressed: false,
  setModifierKeyPressed: (clicked: boolean) =>
    set({ modifierKeyPressed: clicked }),
}));
