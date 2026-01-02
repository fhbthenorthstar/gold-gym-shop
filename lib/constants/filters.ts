// ============================================
// Product Attribute Constants
// Shared between frontend filters, Sanity schema, and admin tooling
// ============================================

export const PRODUCT_TYPES = [
  { value: "supplement", label: "Supplement" },
  { value: "activewear", label: "Activewear" },
  { value: "equipment", label: "Equipment" },
  { value: "accessory", label: "Accessory" },
  { value: "recovery", label: "Recovery" },
  { value: "combat_gear", label: "Combat Gear" },
  { value: "digital", label: "Digital" },
] as const;

export const GOALS = [
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "fat_loss", label: "Fat Loss" },
  { value: "strength", label: "Strength" },
  { value: "endurance", label: "Endurance" },
  { value: "recovery", label: "Recovery" },
  { value: "fighting_performance", label: "Fighting Performance" },
] as const;

export const SPORTS = [
  { value: "fitness", label: "Fitness" },
  { value: "boxing", label: "Boxing" },
  { value: "mma", label: "MMA" },
  { value: "kickboxing", label: "Kickboxing" },
  { value: "muay_thai", label: "Muay Thai" },
] as const;

export const GENDERS = [
  { value: "unisex", label: "Unisex" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
] as const;

export const SORT_OPTIONS = [
  { value: "best_selling", label: "Best Selling" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const;

// Type exports
export type ProductTypeValue = (typeof PRODUCT_TYPES)[number]["value"];
export type GoalValue = (typeof GOALS)[number]["value"];
export type SportValue = (typeof SPORTS)[number]["value"];
export type GenderValue = (typeof GENDERS)[number]["value"];
export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

// ============================================
// Sanity Schema Format Exports
// Format compatible with Sanity's options.list
// ============================================

export const PRODUCT_TYPE_SANITY_LIST = PRODUCT_TYPES.map(({ value, label }) => ({
  title: label,
  value,
}));

export const GOAL_SANITY_LIST = GOALS.map(({ value, label }) => ({
  title: label,
  value,
}));

export const SPORT_SANITY_LIST = SPORTS.map(({ value, label }) => ({
  title: label,
  value,
}));

export const GENDER_SANITY_LIST = GENDERS.map(({ value, label }) => ({
  title: label,
  value,
}));

// ============================================
// Enum values for validation (zod, etc.)
// ============================================

export const PRODUCT_TYPE_VALUES = PRODUCT_TYPES.map((item) => item.value) as [
  ProductTypeValue,
  ...ProductTypeValue[],
];

export const GOAL_VALUES = GOALS.map((item) => item.value) as [
  GoalValue,
  ...GoalValue[],
];

export const SPORT_VALUES = SPORTS.map((item) => item.value) as [
  SportValue,
  ...SportValue[],
];

export const GENDER_VALUES = GENDERS.map((item) => item.value) as [
  GenderValue,
  ...GenderValue[],
];
