import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import type { SubscriptionSummary } from "@/lib/ai/types";

interface SubscriptionCardWidgetProps {
  subscription: SubscriptionSummary;
  onClose: () => void;
}

export function SubscriptionCardWidget({
  subscription,
  onClose,
}: SubscriptionCardWidgetProps) {
  const handleClick = () => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      onClose();
    }
  };

  return (
    <Link
      href={subscription.subscriptionUrl}
      onClick={handleClick}
      className="group flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3 transition-all duration-200 hover:border-primary/60"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-primary">
        <BadgeCheck className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="block truncate text-sm font-medium text-white">
              {subscription.packageTitle ?? "Membership"}
            </span>
            <span className="text-xs text-zinc-400">
              {subscription.subscriptionNumber ?? "Subscription"}
            </span>
          </div>
          {subscription.priceFormatted && (
            <span className="shrink-0 text-sm font-semibold text-white">
              {subscription.priceFormatted}
            </span>
          )}
        </div>
        <div className="mt-2 text-xs text-zinc-500">
          {subscription.statusDisplay}
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-500">
          {subscription.startDate && <span>Start: {subscription.startDate}</span>}
          {subscription.endDate && <span>End: {subscription.endDate}</span>}
        </div>
      </div>
    </Link>
  );
}
