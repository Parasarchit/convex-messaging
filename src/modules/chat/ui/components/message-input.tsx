"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/modules/chat/store/use-chat-store";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useMutation } from "convex/react";
import { Send, Smile } from "lucide-react";
import React, { useRef, useState } from "react";
import { api } from "../../../../../convex/_generated/api";

export const MessageInput = () => {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasSentTypingRef = useRef(false);

  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const { selectedConversationId } = useChatStore();

  const isTyping = useMutation(api.conversations.isTyping);
  const sendMessage = useMutation(api.messages.sendMessage);

  const onSendMessage = (text: string) => {
    if (selectedConversationId) {
      sendMessage({
        conversationId: selectedConversationId,
        text,
      });
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
      setShowEmojiPicker(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    const cursorPos = inputRef.current?.selectionStart ?? message.length;
    const newMessage =
      message.slice(0, cursorPos) + emoji.native + message.slice(cursorPos);

    setMessage(newMessage);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(
        cursorPos + emoji.native.length,
        cursorPos + emoji.native.length
      );
    });
  };

  const handleTyping = (value: string) => {
    setMessage(value);

    if (!selectedConversationId) return;

    if (!hasSentTypingRef.current) {
      isTyping({
        conversationId: selectedConversationId,
        isTyping: true,
      });
      hasSentTypingRef.current = true;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTyping({
        conversationId: selectedConversationId,
        isTyping: false,
      });
      hasSentTypingRef.current = false;
    }, 1500);
  };

  return (
    <div className="relative flex items-center gap-3 p-4 border-t border-border bg-card">
      <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border">
        <Input
          ref={inputRef}
          placeholder="Aa"
          value={message}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={handleKeyPress}
          className="border-0 bg-transparent placeholder:text-muted-foreground focus-visible:ring-0 p-0 text-sm"
        />

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-auto p-0"
          onClick={() => setShowEmojiPicker((v) => !v)}
        >
          <Smile className="w-5 h-5" />
        </Button>
      </div>

      <Button
        onClick={handleSend}
        disabled={!message.trim()}
        size="icon"
        className="shrink-0"
      >
        <Send className="w-5 h-5" />
      </Button>

      {showEmojiPicker && (
        <div className="absolute bottom-16 right-4 z-50">
          <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" />
        </div>
      )}
    </div>
  );
};
