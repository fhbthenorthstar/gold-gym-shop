"use client";

import { Sparkles } from "lucide-react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useChatActions } from "@/lib/store/chat-store-provider";

interface AskAISimilarButtonProps {
  productName: string;
}

export function AskAISimilarButton({ productName }: AskAISimilarButtonProps) {
  const { openChatWithMessage } = useChatActions();
  const { isSignedIn } = useAuth();

  const handleClick = () => {
    openChatWithMessage(`Show me products similar to "${productName}"`);
  };

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <Button className="w-full gap-2 border border-primary/40 bg-transparent text-primary hover:border-primary hover:text-primary/90">
          <Sparkles className="h-4 w-4" />
          Sign in to ask AI
        </Button>
      </SignInButton>
    );
  }

  return (
    <Button
      onClick={handleClick}
      className="w-full gap-2 bg-primary text-black shadow-lg hover:bg-primary/90"
    >
      <Sparkles className="h-4 w-4" />
      Ask AI for similar products
    </Button>
  );
}
