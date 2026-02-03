"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatStore } from "@/modules/chat/store/use-chat-store";

export function ChatHeader() {
  const { selectedReceiver } = useChatStore();

  if(!selectedReceiver) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card h-[10vh]">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage
            src={selectedReceiver.imageUrl}
            alt={selectedReceiver.name}
          />
          <AvatarFallback>
            {selectedReceiver.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col ">
          <h2 className="font-semibold text-foreground">{selectedReceiver.name}</h2>
        </div>
      </div>
    </div>
  );
}
