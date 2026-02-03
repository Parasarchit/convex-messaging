"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/modules/chat/store/use-chat-store";
import { UserStatus } from "@/modules/chat/ui/components/user-status";
import { UserButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { format, isToday } from "date-fns";
import { api } from "../../../../../convex/_generated/api";
import { Doc } from "../../../../../convex/_generated/dataModel";

export const ChatList = () => {
  const { selectedReceiver, setSelectedConversationId, setSelectedReceiver } =
    useChatStore();

  const conversations = useQuery(api.conversations.list);
  const getOrCreateConversation = useMutation(
    api.conversations.getOrCreateConversation
  );

  if (!conversations) {
    return (
      <ScrollArea className="flex-1">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Loading conversations...
        </div>
      </ScrollArea>
    );
  }

  const onSelectConversation = async (receiver: Doc<"users">) => {
    setSelectedReceiver(receiver);
    const conversation = await getOrCreateConversation({
      receiverClerkId: receiver.clerkId,
    });
    if (conversation) {
      setSelectedConversationId(conversation._id);
    }
  };

  return (
    <>
      <ScrollArea className="flex-1">
        <div className="flex flex-col h-[80vh]">
          {conversations.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No conversations found
            </div>
          ) : (
            conversations.map(
              ({ conversation, user, lastMessage, unreadCount, presence }) => {
                return (
                  <button
                    key={user._id}
                    onClick={() => onSelectConversation(user)}
                    className={cn(
                      "flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b border-border last:border-b-0 text-left cursor-pointer",
                      selectedReceiver?.clerkId === user.clerkId &&
                        "bg-muted hover:bg-muted"
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.imageUrl} alt={user.name} />
                        <AvatarFallback>
                          {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <UserStatus lastSeen={presence?.lastSeen} />
                      {(unreadCount ?? 0) > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-2">
                        <h3 className="font-medium text-foreground truncate">
                          {user.name}
                        </h3>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {lastMessage?._creationTime &&
                            (isToday(new Date(lastMessage?._creationTime))
                              ? format(
                                  new Date(lastMessage?._creationTime),
                                  "hh:mm a"
                                )
                              : format(
                                  new Date(lastMessage?._creationTime),
                                  "dd MMM"
                                ))}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {(() => {
                          const isTyping = conversation?.typing?.some(
                            (id) => id === user.clerkId
                          );

                          if (isTyping) {
                            return "Typing...";
                          }

                          if (!lastMessage || !lastMessage.text) {
                            return "";
                          }

                          if (lastMessage.senderId === user.clerkId) {
                            return lastMessage.text;
                          } else {
                            return `You: ${lastMessage.text}`;
                          }
                        })()}
                      </p>
                    </div>
                  </button>
                );
              }
            )
          )}
        </div>
      </ScrollArea>
      <div className="shrink-0 border-t border-border bg-background p-3">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-9 w-9",
            },
          }}
        />
      </div>
    </>
  );
};
