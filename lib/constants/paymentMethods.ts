export type PaymentMethod = "cod" | "online";

export const PAYMENT_METHODS: PaymentMethod[] = ["cod", "online"];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: "Cash on Delivery",
  online: "Pay Online",
};

export const PAYMENT_METHOD_SANITY_LIST = PAYMENT_METHODS.map((value) => ({
  title: PAYMENT_METHOD_LABELS[value],
  value,
}));
