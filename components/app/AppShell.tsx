"use client";

import { useIsChatOpen } from "@/lib/store/chat-store-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const isChatOpen = useIsChatOpen();

  return (
    <div
      className={`min-h-screen bg-black text-white transition-all duration-300 ease-in-out ${
        isChatOpen ? "xl:mr-[448px] max-xl:overflow-hidden max-xl:h-screen" : ""
      }`}
    >
      {children}
    </div>
  );
}
