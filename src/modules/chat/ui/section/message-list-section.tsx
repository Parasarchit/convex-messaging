"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/modules/chat/store/use-chat-store";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "../../../../../convex/_generated/api";

export function MessageList() {
  const bottomRef = useRef<HTMLDivElement>(null);

  const { user, isLoaded } = useUser();
  const { selectedConversationId } = useChatStore();

  const conversation = useQuery(api.conversations.getConversationById, {
    conversationId: selectedConversationId!,
  });

  const messages = useQuery(api.messages.getMessages, {
    conversationId: selectedConversationId!,
  });

  const markConversationAsRead = useMutation(
    api.conversations.markConversationAsRead
  );

  const lastReadMessage = useQuery(api.conversations.getLastReadMessage, {
    conversationId: selectedConversationId!,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView(false);
  }, [messages]);

  useEffect(() => {
    if (!selectedConversationId || !messages?.length) {
      return;
    }

    markConversationAsRead({
      conversationId: selectedConversationId,
    });

    return () => {
      markConversationAsRead({
        conversationId: selectedConversationId,
      });
    };
  }, [selectedConversationId, messages?.length]);

  if (!messages || !isLoaded || !user || !lastReadMessage) {
    return <div className="min-h-full" />;
  }

  const otherUserTyping = conversation?.typing?.some((id) => id !== user.id);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 max-h-112">
        <div className="p-4 flex flex-col gap-3">
          {messages.map((message) => {
            const isSelf = message.senderId === user.id;

            return (
              <div
                key={message._id}
                className={cn("flex w-full", {
                  "justify-end": isSelf,
                  "justify-start": !isSelf,
                })}
              >
                <div
                  className={cn(
                    "max-w-[75%] px-4 py-2 rounded-2xl text-sm wrap-break-word",
                    isSelf
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}
                >
                  {message.text}
                </div>
                {isSelf &&
                  message._id === lastReadMessage.lastReadMessageId && (
                    <div className="ml-2 mt-auto mb-1 text-[11px] text-muted-foreground italic">
                      Seen
                    </div>
                  )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {otherUserTyping && (
        <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
          </span>
          <span>typing…</span>
        </div>
      )}
    </div>
  );
}
