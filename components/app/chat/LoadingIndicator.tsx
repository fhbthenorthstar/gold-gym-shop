import { Bot } from "lucide-react";

export function LoadingIndicator() {
  return (
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
  );
}
