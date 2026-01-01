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

const DEFAULT_SHIPPING_FEE = 150;
const DHAKA_SHIPPING_FEE = 100;

export const getShippingFee = (division?: string | null): number => {
  if (!division) return 0;
  return division === "Dhaka" ? DHAKA_SHIPPING_FEE : DEFAULT_SHIPPING_FEE;
};
