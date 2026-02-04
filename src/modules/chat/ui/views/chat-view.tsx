"use client";

import { useHeartbeat } from "@/modules/chat/hooks/use-heartbeat";
import { useChatStore } from "@/modules/chat/store/use-chat-store";
import { ChatHeader } from "@/modules/chat/ui/components/chat-header";
import { ChatList } from "@/modules/chat/ui/components/chat-list";
import { Header } from "@/modules/chat/ui/components/header";
import { MessageInput } from "@/modules/chat/ui/components/message-input";
import { MessageList } from "@/modules/chat/ui/section/message-list-section";

export const ChatView = () => {
  useHeartbeat();

  const { selectedConversationId } = useChatStore();

  return (
    <div className="grid grid-cols-12 min-h-screen bg-background ">
      <div className="col-span-2 border-r border-border bg-card">
        <Header />
        <ChatList />
      </div>
      <div className="hidden md:block col-span-10">
        {selectedConversationId ? (
          <div className="grid h-screen items-center bg-background overflow-hidden">
            <ChatHeader />
            <MessageList />
            <MessageInput />
          </div>
        ) : (
          <div className="h-screen"></div>
        )}
      </div>
    </div>
  );
};
