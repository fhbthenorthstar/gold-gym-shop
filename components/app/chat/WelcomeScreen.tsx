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

const packageSuggestions = [
  "Gold packages at Bashundhara Sports City",
  "Pool & spa packages under ৳50,000",
  "6 month silver membership",
];

const orderSuggestions = [
  "Where's my order?",
  "Show me my recent orders",
  "What's my order status?",
];

const subscriptionSuggestions = [
  "Show my active membership",
  "When does my subscription renew?",
  "What membership packages are available?",
];

export function WelcomeScreen({
  onSuggestionClick,
  isSignedIn,
}: WelcomeScreenProps) {
  const isLocked = !isSignedIn;

  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-4">
      <div className="rounded-full bg-zinc-900 p-4">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-white">
        How can I help you today?
      </h3>
      <p className="mt-2 max-w-xs text-sm text-zinc-400">
        {isSignedIn
          ? "I can help you find products, explore membership packages, and track your orders."
          : "Please sign in to chat with the assistant and get personalized help."}
      </p>
      {isLocked && (
        <div className="mt-4">
          <SignInButton mode="modal">
            <button
              type="button"
              className="rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black hover:bg-primary/90"
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
                  : "border-zinc-800 bg-black text-zinc-200 hover:border-primary/70 hover:text-primary/90"
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 w-full max-w-sm">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-500">
          <Package className="h-3 w-3" />
          Membership packages
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {packageSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSuggestionClick({ text: suggestion })}
              disabled={isLocked}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                isLocked
                  ? "border-zinc-800 bg-zinc-900 text-zinc-500"
                  : "border-zinc-800 bg-black text-zinc-200 hover:border-primary/70 hover:text-primary/90"
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Order + Subscription suggestions - only for signed in users */}
      {isSignedIn && (
        <div className="mt-4 w-full max-w-sm space-y-4">
          <div>
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
                  className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm text-primary/90 transition-colors hover:border-primary hover:text-primary/80"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-500">
              <Package className="h-3 w-3" />
              Your membership
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {subscriptionSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onSuggestionClick({ text: suggestion })}
                  className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm text-primary/90 transition-colors hover:border-primary hover:text-primary/80"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
