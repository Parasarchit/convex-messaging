"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/modules/chat/store/use-chat-store";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "../../../../../convex/_generated/api";
import Image from "next/image";

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
    return <div className="h-[75vh]" />;
  }

  const otherUserTyping = conversation?.typing?.some((id) => id !== user.id);

  return (
    <div className="flex flex-col h-[75vh]">
      <ScrollArea className="h-[80vh] overflow-y-auto">
        <div className="p-4 flex flex-col gap-3 ">
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
                <div className="flex flex-col gap-2 max-w-[75%]">
                  {message.attachments?.length > 0 && (
                    <div
                      className={cn(
                        "flex flex-col gap-2",
                        isSelf ? "items-end" : "items-start"
                      )}
                    >
                      {message.attachments?.length > 0 && (
                        <div
                          className={cn(
                            "grid gap-2",
                            message.attachments.length === 1
                              ? "grid-cols-1"
                              : message.attachments.length === 2
                                ? "grid-cols-2"
                                : "grid-cols-3",
                            isSelf ? "justify-items-end" : "justify-items-start"
                          )}
                        >
                          {message.attachments.map((attachment, idx) =>
                            attachment ? (
                              <Image
                                key={idx}
                                src={attachment}
                                alt={`Attachment ${idx + 1}`}
                                width={120}
                                height={120}
                                className="rounded-lg border object-cover"
                              />
                            ) : null
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {message.text && (
                    <div
                      className={cn(
                        "px-4 py-2 rounded-2xl text-sm wrap-break-word w-fit",
                        isSelf
                          ? "bg-primary text-primary-foreground rounded-br-sm self-end"
                          : "bg-muted text-foreground rounded-bl-sm self-start"
                      )}
                    >
                      {message.text}
                    </div>
                  )}

                  {isSelf &&
                    message._id === lastReadMessage.lastReadMessageId && (
                      <div className="text-[11px] text-muted-foreground italic self-end">
                        Seen
                      </div>
                    )}
                </div>
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
