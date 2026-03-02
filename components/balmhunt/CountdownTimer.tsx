"use client";

import { useEffect, useMemo, useState } from "react";

function getMsUntilMarch5UTC() {
  const now = new Date();
  const resetAt = Date.UTC(2026, 2, 5, 0, 0, 0);
  return Math.max(0, resetAt - now.getTime());
}

export default function CountdownTimer() {
  const [remainingMs, setRemainingMs] = useState(getMsUntilMarch5UTC());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemainingMs(getMsUntilMarch5UTC());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const { days, hours, minutes, seconds } = useMemo(() => {
    const totalSeconds = Math.floor(remainingMs / 1000);
    const daysValue = Math.floor(totalSeconds / 86400);
    const hoursValue = Math.floor((totalSeconds % 86400) / 3600);
    const minutesValue = Math.floor((totalSeconds % 3600) / 60);
    const secondsValue = totalSeconds % 60;

    return {
      days: String(daysValue).padStart(2, "0"),
      hours: String(hoursValue).padStart(2, "0"),
      minutes: String(minutesValue).padStart(2, "0"),
      seconds: String(secondsValue).padStart(2, "0"),
    };
  }, [remainingMs]);

  return (
    <div className="rounded-xl border border-[#F6A6C1]/40 bg-[#FFF0F5] px-4 py-3 text-sm text-[#111111] shadow-sm">
      week resets in {days}:{hours}:{minutes}:{seconds} (utc)
    </div>
  );
}
