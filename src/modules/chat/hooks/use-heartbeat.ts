"use client";

import { useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "../../../../convex/_generated/api";

export function useHeartbeat() {
  const heartbeat = useMutation(api.presence.heartbeat);

  useEffect(() => {
    const send = () => heartbeat();

    send();

    const interval = setInterval(send, 10_000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        send();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [heartbeat]);
}
