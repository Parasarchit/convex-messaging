"use client";

import { useChatStore } from "@/modules/chat/store/use-chat-store";
import { ChatHeader } from "@/modules/chat/ui/components/chat-header";
import { ChatList } from "@/modules/chat/ui/components/chat-list";
import { Header } from "@/modules/chat/ui/components/header";
import { MessageInput } from "@/modules/chat/ui/components/message-input";
import { MessageList } from "@/modules/chat/ui/section/message-list-section";

export const ChatView = () => {
  const { selectedConversationId } = useChatStore();

  return (
    <div className="flex h-screen bg-background">
      <div className="w-full md:w-80 flex flex-col border-r border-border bg-card">
        <Header />
        <ChatList />
      </div>
      <div className="hidden md:flex flex-1 flex-col">
        {selectedConversationId && (
          <div className="flex flex-col h-full bg-background">
            <ChatHeader />
            <MessageList />
            <MessageInput />
          </div>
        )}
      </div>
    </div>
  );
};
