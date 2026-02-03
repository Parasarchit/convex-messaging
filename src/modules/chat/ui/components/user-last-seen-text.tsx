import { useGetUserStatus } from "@/modules/chat/hooks/use-get-user-status";
import { formatDistanceToNow } from "date-fns";

interface UserLastSeenTextProps {
  lastSeen: number | undefined;
}

export const UserLastSeenText = ({ lastSeen = 0 }: UserLastSeenTextProps) => {
  const status = useGetUserStatus({ lastSeen });

  const lastSeenText = lastSeen
    ? `Last seen ${formatDistanceToNow(new Date(lastSeen), {
        addSuffix: true,
      })}`
    : "Offline";

  return (
    status !== "online" && (
      <span className="text-xs text-muted-foreground">{lastSeenText}</span>
    )
  );
};
