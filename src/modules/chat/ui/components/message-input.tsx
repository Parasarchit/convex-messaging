"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/modules/chat/store/use-chat-store";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useMutation } from "convex/react";
import { Paperclip, Send, Smile, X } from "lucide-react";
import { useRef, useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

export const MessageInput = () => {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasSentTypingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);


  const { selectedConversationId } = useChatStore();

  const isTyping = useMutation(api.conversations.isTyping);
  const sendMessage = useMutation(api.messages.sendMessage);
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);

  const uploadFile = async (file: File) => {
    const postUrl = await generateUploadUrl();
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
     const { storageId } = await result.json();
    return storageId as Id<"_storage">;
  };

  const handleSend = async () => {
    if (!selectedConversationId) return;
    if (isSending) return;

      setIsSending(true);

    const uploadedFiles =
      files.length > 0 ? await Promise.all(files.map(uploadFile)) : [];

    if (!message.trim() && uploadedFiles.length === 0) return;

    await sendMessage({
      conversationId: selectedConversationId,
      text: message.trim(),
      attachments: uploadedFiles,
    });

    setMessage("");
    setFiles([]);
    setShowEmojiPicker(false);
     setIsSending(false);
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

  return (
    <div className="relative flex flex-col gap-2 p-4 border-t border-border bg-card h-[15vh]">
      {files.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-xs bg-muted px-3 py-1 rounded-full"
            >
              <span className="truncate max-w-37.5">{file.name}</span>
              <button
                onClick={() =>
                  setFiles((prev) => prev.filter((_, i) => i !== index))
                }
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (!e.target.files) return;
            setFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
            e.target.value = "";
          }}
        />

        <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border">
          <Button
            disabled={isSending}
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <Input
            ref={inputRef}
            placeholder="Aa"
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="border-0 bg-transparent placeholder:text-muted-foreground focus-visible:ring-0 p-0 text-sm"
          />

          <Button
            disabled={isSending}
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojiPicker((v) => !v)}
          >
            <Smile className="w-5 h-5" />
          </Button>
        </div>

        <Button
          onClick={handleSend}
          disabled={isSending || (!message.trim() && files.length === 0)}
          size="icon"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4 z-50">
          <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" />
        </div>
      )}
    </div>
  );
};
