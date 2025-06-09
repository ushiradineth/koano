import { Event, Preview } from "@/lib/types";
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
};

export const useInteractionStore = create<InteractionStore>()((set) => ({
  selecting: false,
  setSelecting: (selecting: boolean) => set({ selecting }),

  extending: false,
  setExtending: (extending: boolean) => set({ extending }),

  activeEvent: null,
  setActiveEvent: (event: Event | null) => set({ activeEvent: event }),

  preview: null,
  setPreview: (preview: Preview | null) => set({ preview }),
}));
