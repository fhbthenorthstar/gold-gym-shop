import { SignInButton } from "@clerk/nextjs";
import { Sparkles, Package, Search } from "lucide-react";

interface WelcomeScreenProps {
  onSuggestionClick: (message: { text: string }) => void;
  isSignedIn: boolean;
}

const productSuggestions = [
  "Creatine for strength",
  "Boxing gloves under ৳3000",
  "Women's activewear",
];

const orderSuggestions = [
  "Where's my order?",
  "Show me my recent orders",
  "What's my order status?",
];

export function WelcomeScreen({
  onSuggestionClick,
  isSignedIn,
}: WelcomeScreenProps) {
  const isLocked = !isSignedIn;

  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-4">
      <div className="rounded-full bg-zinc-900 p-4">
        <Sparkles className="h-8 w-8 text-lime-300" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-white">
        How can I help you today?
      </h3>
      <p className="mt-2 max-w-xs text-sm text-zinc-400">
        {isSignedIn
          ? "I can help you find gym and combat gear, check your orders, and track deliveries."
          : "Please sign in to chat with the assistant and get personalized help."}
      </p>
      {isLocked && (
        <div className="mt-4">
          <SignInButton mode="modal">
            <button
              type="button"
              className="rounded-full bg-lime-300 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black hover:bg-lime-200"
            >
              Sign In to Chat
            </button>
          </SignInButton>
        </div>
      )}

      {/* Product suggestions */}
      <div className="mt-6 w-full max-w-sm">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-500">
          <Search className="h-3 w-3" />
          Find products
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {productSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSuggestionClick({ text: suggestion })}
              disabled={isLocked}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                isLocked
                  ? "border-zinc-800 bg-zinc-900 text-zinc-500"
                  : "border-zinc-800 bg-black text-zinc-200 hover:border-lime-300/70 hover:text-lime-200"
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Order suggestions - only for signed in users */}
      {isSignedIn && (
        <div className="mt-4 w-full max-w-sm">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-500">
            <Package className="h-3 w-3" />
            Your orders
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {orderSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestionClick({ text: suggestion })}
                className="rounded-full border border-lime-300/40 bg-lime-300/10 px-3 py-1.5 text-sm text-lime-200 transition-colors hover:border-lime-300 hover:text-lime-100"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
