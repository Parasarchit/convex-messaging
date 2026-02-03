import { create } from "zustand";
import { Doc, Id } from "../../../../convex/_generated/dataModel";

interface state {
  selectedConversationId: Id<"conversations"> | null;
  selectedReceiver: Doc<"users"> | null;
}

interface action {
  setSelectedConversationId: (selectedConversationId: Id<"conversations">) => void;
  setSelectedReceiver: (selectedReceiver: state["selectedReceiver"]) => void;
}

export const useChatStore = create<state & action>((set) => ({
  selectedConversationId: null,
  setSelectedConversationId: (selectedConversationId) =>
    set({ selectedConversationId }),
  selectedReceiver: null,
  setSelectedReceiver: (selectedReceiver) => set({ selectedReceiver }),
}));
