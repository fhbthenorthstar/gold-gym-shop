export type SubscriptionPaymentMethod = "online" | "offline";
export type SubscriptionPaymentStatus = "pending" | "paid" | "failed";

export const SUBSCRIPTION_PAYMENT_METHODS: SubscriptionPaymentMethod[] = [
  "online",
  "offline",
];

export const SUBSCRIPTION_PAYMENT_STATUSES: SubscriptionPaymentStatus[] = [
  "pending",
  "paid",
  "failed",
];

export const SUBSCRIPTION_PAYMENT_METHOD_LABELS: Record<
  SubscriptionPaymentMethod,
  string
> = {
  online: "Online payment",
  offline: "Onsite payment",
};

export const SUBSCRIPTION_PAYMENT_STATUS_LABELS: Record<
  SubscriptionPaymentStatus,
  string
> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
};

export const SUBSCRIPTION_PAYMENT_METHOD_SANITY_LIST =
  SUBSCRIPTION_PAYMENT_METHODS.map((value) => ({
    title: SUBSCRIPTION_PAYMENT_METHOD_LABELS[value],
    value,
  }));

export const SUBSCRIPTION_PAYMENT_STATUS_SANITY_LIST =
  SUBSCRIPTION_PAYMENT_STATUSES.map((value) => ({
    title: SUBSCRIPTION_PAYMENT_STATUS_LABELS[value],
    value,
  }));
