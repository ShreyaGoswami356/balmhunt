"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoRefresh({ everyMs = 12000 }: { everyMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const interval = window.setInterval(() => {
      router.refresh();
    }, everyMs);

    return () => window.clearInterval(interval);
  }, [everyMs, router]);

  return null;
}
