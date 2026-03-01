"use client";

import { useEffect, useMemo, useState } from "react";

function getMsUntilNextWeekUTC() {
  const now = new Date();
  const day = now.getUTCDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  const nextMonday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilMonday);
  return Math.max(0, nextMonday - now.getTime());
}

export default function CountdownTimer() {
  const [remainingMs, setRemainingMs] = useState(getMsUntilNextWeekUTC());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemainingMs(getMsUntilNextWeekUTC());
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