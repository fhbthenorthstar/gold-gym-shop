import { Banknote, CreditCard, type LucideIcon } from "lucide-react";

export type OrderStatusValue = "cod" | "paid";

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
