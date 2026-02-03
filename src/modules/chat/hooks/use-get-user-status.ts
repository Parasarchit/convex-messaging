import { useEffect, useState } from "react";

interface UseGetUserStatusProps {
  lastSeen: number | undefined;
}

export const useGetUserStatus = ({ lastSeen = 0 }: UseGetUserStatusProps) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 5_000);

    return () => clearInterval(interval);
  }, []);

  const diff = now - lastSeen;

  if (diff >= 20_000) {
    return "offline";
  }

  return "online";
};
