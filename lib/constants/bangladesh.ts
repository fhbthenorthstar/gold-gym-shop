export const DEFAULT_COUNTRY = "Bangladesh";

export const BANGLADESH_DIVISIONS = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
] as const;

export type BangladeshDivision = (typeof BANGLADESH_DIVISIONS)[number];

export const FREE_SHIPPING_THRESHOLD = 2500;
const DEFAULT_SHIPPING_FEE = 100;
const DHAKA_SHIPPING_FEE = 60;

export const getShippingFee = (
  division?: string | null,
  subtotal = 0
): number => {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  if (!division) return 0;
  return division === "Dhaka" ? DHAKA_SHIPPING_FEE : DEFAULT_SHIPPING_FEE;
};
