"use client";

import { useEffect, useState } from "react";

/** Returns remaining milliseconds until `deadlineIso`, ticking every second. */
export function useCountdown(deadlineIso: string | null | undefined) {
  const [msLeft, setMsLeft] = useState<number>(() =>
    deadlineIso ? new Date(deadlineIso).getTime() - Date.now() : 0,
  );

  useEffect(() => {
    if (!deadlineIso) return;
    const tick = () => setMsLeft(new Date(deadlineIso).getTime() - Date.now());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadlineIso]);

  const isExpired = msLeft <= 0;
  const totalSeconds = Math.max(0, Math.floor(msLeft / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const label = hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;

  return { msLeft, isExpired, label };
}
