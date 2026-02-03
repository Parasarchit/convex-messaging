"use client";

import { cn } from "@/lib/utils";
import { useGetUserStatus } from "@/modules/chat/hooks/use-get-user-status";
import { useEffect, useState } from "react";

interface UserStatusProps {
  lastSeen: number | undefined;
}

export const UserStatus = ({ lastSeen = 0 }: UserStatusProps) => {
  const status = useGetUserStatus({ lastSeen });

  return (
    <span
      className={cn(
        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
        status === "online" && "bg-green-500",
        status === "offline" && "bg-gray-400"
      )}
      title={status}
    />
  );
};
