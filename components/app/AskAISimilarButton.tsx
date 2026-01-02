"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatActions } from "@/lib/store/chat-store-provider";

interface AskAISimilarButtonProps {
  productName: string;
}

export function AskAISimilarButton({ productName }: AskAISimilarButtonProps) {
  const { openChatWithMessage } = useChatActions();

  const handleClick = () => {
    openChatWithMessage(`Show me products similar to "${productName}"`);
  };

  return (
    <Button
      onClick={handleClick}
      className="w-full gap-2 bg-lime-300 text-black shadow-lg hover:bg-lime-200"
    >
      <Sparkles className="h-4 w-4" />
      Ask AI for similar products
    </Button>
  );
}
