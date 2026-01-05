"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { Sparkles, Send, Loader2, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useIsChatOpen,
  useChatActions,
  usePendingMessage,
} from "@/lib/store/chat-store-provider";

import {
  getMessageText,
  getToolParts,
  WelcomeScreen,
  MessageBubble,
  ToolCallUI,
} from "./chat";

export function ChatSheet() {
  const isOpen = useIsChatOpen();
  const { closeChat, clearPendingMessage } = useChatActions();
  const pendingMessage = usePendingMessage();
  const { isSignedIn } = useAuth();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat();
  const isLoading = status === "streaming" || status === "submitted";
  const canChat = Boolean(isSignedIn);

  // Auto-scroll to bottom when new messages arrive or streaming updates
  // biome-ignore lint/correctness/useExhaustiveDependencies: trigger scroll on message/loading changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle pending message - send it when chat opens
  useEffect(() => {
    if (isOpen && pendingMessage && !isLoading && canChat) {
      sendMessage({ text: pendingMessage });
      clearPendingMessage();
    }
  }, [isOpen, pendingMessage, isLoading, sendMessage, clearPendingMessage, canChat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !canChat) return;

    sendMessage({ text: input });
    setInput("");
  };

  const handleSuggestionClick = (message: { text: string }) => {
    if (!canChat) return;
    sendMessage(message);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - only visible on mobile/tablet (< xl) */}
      <div
        className="fixed inset-0 z-40 bg-black/60 xl:hidden"
        onClick={closeChat}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 z-50 flex h-full w-full flex-col border-l border-zinc-800 bg-zinc-950 text-zinc-100 overscroll-contain sm:w-[448px] animate-in slide-in-from-right duration-300">
        {/* Header */}
        <header className="shrink-0 border-b border-zinc-800">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Sparkles className="h-5 w-5 text-primary" />
              Shopping Assistant
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeChat}
              className="text-zinc-200 hover:bg-primary hover:text-black"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {messages.length === 0 ? (
            <WelcomeScreen
              onSuggestionClick={handleSuggestionClick}
              isSignedIn={isSignedIn ?? false}
            />
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const content = getMessageText(message);
                const toolParts = getToolParts(message);
                const hasContent = content.length > 0;
                const hasTools = toolParts.length > 0;

                if (!hasContent && !hasTools) return null;

                return (
                  <div key={message.id} className="space-y-3">
                    {/* Tool call indicators */}
                    {hasTools &&
                      toolParts.map((toolPart) => (
                        <ToolCallUI
                          key={`tool-${message.id}-${toolPart.toolCallId}`}
                          toolPart={toolPart}
                          closeChat={closeChat}
                        />
                      ))}

                    {/* Message content */}
                    {hasContent && (
                      <MessageBubble
                        role={message.role}
                        content={content}
                        closeChat={closeChat}
                      />
                    )}
                  </div>
                );
              })}

              {/* Loading indicator */}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-zinc-900 px-4 py-2">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                    </div>
                  </div>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-zinc-800 px-4 py-4">
          {!canChat && (
            <div className="mb-3 rounded-xl border border-primary/30 bg-black/60 px-4 py-3 text-xs text-zinc-300">
              Sign in to chat with the shopping assistant.
              <div className="mt-3">
                <SignInButton mode="modal">
                  <Button className="h-9 rounded-full bg-primary px-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-black hover:bg-primary/90">
                    Sign In
                  </Button>
                </SignInButton>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about supplements, gear, or memberships..."
              disabled={isLoading || !canChat}
              className="flex-1 border-zinc-800 bg-black text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-primary"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading || !canChat}
              className="bg-primary text-black hover:bg-primary/90"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
