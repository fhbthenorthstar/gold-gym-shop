import {
  Banknote,
  CreditCard,
  Package,
  Truck,
  RotateCcw,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export type OrderStatusValue =
  | "cod"
  | "paid"
  | "preparing"
  | "shipped"
  | "refunded"
  | "cancelled";

export interface OrderStatusConfig {
  /** The status value/key */
  value: OrderStatusValue;
  /** Display label */
  label: string;
  /** Badge color classes (combined bg + text) */
  color: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Emoji for AI/chat display */
  emoji: string;
  /** Icon text color for widgets */
  iconColor: string;
  /** Icon background color for widgets */
  iconBgColor: string;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatusValue, OrderStatusConfig> =
  {
    cod: {
      value: "cod",
      label: "COD",
      color: "bg-amber-100 text-amber-800",
      icon: Banknote,
      emoji: "💵",
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    paid: {
      value: "paid",
      label: "Paid",
      color: "bg-emerald-100 text-emerald-800",
      icon: CreditCard,
      emoji: "✅",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    preparing: {
      value: "preparing",
      label: "Preparing Product",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      icon: Package,
      emoji: "📦",
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    shipped: {
      value: "shipped",
      label: "Shipped",
      color:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
      icon: Truck,
      emoji: "🚚",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    refunded: {
      value: "refunded",
      label: "Refunded",
      color: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
      icon: RotateCcw,
      emoji: "↩️",
      iconColor: "text-rose-600 dark:text-rose-400",
      iconBgColor: "bg-rose-100 dark:bg-rose-900/30",
    },
    cancelled: {
      value: "cancelled",
      label: "Cancelled",
      color:
        "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
      icon: XCircle,
      emoji: "❌",
      iconColor: "text-zinc-600 dark:text-zinc-300",
      iconBgColor: "bg-zinc-200 dark:bg-zinc-800",
    },
  };

/** All valid order status values */
export const ORDER_STATUS_VALUES = Object.keys(
  ORDER_STATUS_CONFIG
) as OrderStatusValue[];

/** Tabs for admin order filtering (includes "all" option) */
export const ORDER_STATUS_TABS = [
  { value: "all", label: "All" },
  ...ORDER_STATUS_VALUES.map((value) => ({
    value,
    label: ORDER_STATUS_CONFIG[value].label,
  })),
] as const;

/** Format for Sanity schema options.list */
export const ORDER_STATUS_SANITY_LIST = ORDER_STATUS_VALUES.map((value) => ({
  title: ORDER_STATUS_CONFIG[value].label,
  value,
}));

/** Get order status config with fallback to "cod" */
export const getOrderStatus = (
  status: string | null | undefined
): OrderStatusConfig =>
  ORDER_STATUS_CONFIG[status as OrderStatusValue] ?? ORDER_STATUS_CONFIG.cod;

/** Get emoji display for status (for AI/chat) */
export const getOrderStatusEmoji = (
  status: string | null | undefined
): string => {
  const config = getOrderStatus(status);
  return `${config.emoji} ${config.label}`;
};
