import {
  Clock,
  CheckCircle2,
  PauseCircle,
  XCircle,
  CalendarX2,
  type LucideIcon,
} from "lucide-react";

export type SubscriptionStatusValue =
  | "pending"
  | "active"
  | "paused"
  | "cancelled"
  | "expired";

export interface SubscriptionStatusConfig {
  value: SubscriptionStatusValue;
  label: string;
  color: string;
  icon: LucideIcon;
  emoji: string;
}

export const SUBSCRIPTION_STATUS_CONFIG: Record<
  SubscriptionStatusValue,
  SubscriptionStatusConfig
> = {
  pending: {
    value: "pending",
    label: "Pending",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    icon: Clock,
    emoji: "⏳",
  },
  active: {
    value: "active",
    label: "Active",
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    icon: CheckCircle2,
    emoji: "✅",
  },
  paused: {
    value: "paused",
    label: "Paused",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    icon: PauseCircle,
    emoji: "⏸️",
  },
  cancelled: {
    value: "cancelled",
    label: "Cancelled",
    color: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
    icon: XCircle,
    emoji: "❌",
  },
  expired: {
    value: "expired",
    label: "Expired",
    color: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    icon: CalendarX2,
    emoji: "🗓️",
  },
};

export const SUBSCRIPTION_STATUS_VALUES = Object.keys(
  SUBSCRIPTION_STATUS_CONFIG
) as SubscriptionStatusValue[];

export const SUBSCRIPTION_STATUS_TABS = [
  { value: "all", label: "All" },
  ...SUBSCRIPTION_STATUS_VALUES.map((value) => ({
    value,
    label: SUBSCRIPTION_STATUS_CONFIG[value].label,
  })),
] as const;

export const SUBSCRIPTION_STATUS_SANITY_LIST = SUBSCRIPTION_STATUS_VALUES.map(
  (value) => ({
    title: SUBSCRIPTION_STATUS_CONFIG[value].label,
    value,
  })
);

export const getSubscriptionStatus = (
  status: string | null | undefined
): SubscriptionStatusConfig =>
  SUBSCRIPTION_STATUS_CONFIG[
    status as SubscriptionStatusValue
  ] ?? SUBSCRIPTION_STATUS_CONFIG.pending;

export const getSubscriptionStatusEmoji = (
  status: string | null | undefined
): string => {
  const config = getSubscriptionStatus(status);
  return `${config.emoji} ${config.label}`;
};
