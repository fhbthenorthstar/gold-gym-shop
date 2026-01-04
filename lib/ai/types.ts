/**
 * Shared types for AI shopping assistant
 */

export interface SearchProduct {
  id: string;
  name: string | null;
  slug: string | null;
  description: string | null;
  price: number | null;
  priceFormatted: string | null;
  category: string | null;
  categorySlug: string | null;
  brand: string | null;
  productType: string | null;
  goals: string[];
  sports: string[];
  gender: string | null;
  optionNames: string[];
  variantsCount: number;
  stockCount: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock" | "unknown";
  stockMessage: string;
  featured: boolean;
  isDigital: boolean;
  imageUrl: string | null;
  productUrl: string | null;
}

export interface SearchProductsResult {
  found: boolean;
  message: string;
  products: SearchProduct[];
  totalResults?: number;
  error?: string;
  filters: {
    query: string;
    category: string;
    brand: string;
    goals: string[];
    sports: string[];
    gender: string;
    minPrice: number;
    maxPrice: number;
  };
}

export interface SearchPackage {
  id: string;
  title: string | null;
  location: string | null;
  locationLabel: string;
  tier: string | null;
  tierLabel: string;
  durationLabel: string | null;
  durationMonths: number | null;
  accessLabel: string | null;
  price: number;
  priceFormatted: string;
  packageUrl: string | null;
}

export interface SearchPackagesResult {
  found: boolean;
  message: string;
  packages: SearchPackage[];
  error?: string;
}

// Re-export order/subscription types from tools
export type { OrderSummary, GetMyOrdersResult } from "./tools/get-my-orders";
export type {
  SubscriptionSummary,
  GetMySubscriptionsResult,
} from "./tools/get-my-subscriptions";
