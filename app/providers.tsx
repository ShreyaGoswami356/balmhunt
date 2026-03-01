"use client";

import { HeroUIProvider } from "@heroui/react";
import { SessionProvider } from "next-auth/react";
import FloatingProgressOverlay from "@/components/FloatingProgressOverlay";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <HeroUIProvider>
        {children}
        <FloatingProgressOverlay />
      </HeroUIProvider>
    </SessionProvider>
  );
}
