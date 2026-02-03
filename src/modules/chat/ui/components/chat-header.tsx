"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatStore } from "@/modules/chat/store/use-chat-store";
import { UserStatus } from "@/modules/chat/ui/components/user-status";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { UserLastSeenText } from "@/modules/chat/ui/components/user-last-seen-text";

export function ChatHeader() {
  const { selectedReceiver } = useChatStore();

  const userStatus = useQuery(api.presence.getUserStatus, {
    userId: selectedReceiver?.clerkId!,
  });

  if (!selectedReceiver) {
    return null;
  }

  const lastSeenText = userStatus?.lastSeen
    ? `Last seen ${formatDistanceToNow(new Date(userStatus.lastSeen), {
        addSuffix: true,
      })}`
    : "Offline";

  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card h-[10vh]">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={selectedReceiver.imageUrl}
              alt={selectedReceiver.name}
            />
            <AvatarFallback>
              {selectedReceiver.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <UserStatus lastSeen={userStatus?.lastSeen} />
        </div>
        <div className="flex flex-col ">
          <h2 className="font-semibold text-foreground">
            {selectedReceiver.name}
          </h2>
          <UserLastSeenText lastSeen={userStatus?.lastSeen} />
        </div>
      </div>
    </div>
  );
}
