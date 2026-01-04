"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { client } from "@/sanity/lib/client";
import { PRODUCTS_BY_IDS_QUERY } from "@/lib/sanity/queries/products";
import type { CartItem } from "@/lib/store/cart-store";
import {
  getVariantBySelectedOptions,
  type ProductVariant,
} from "@/lib/utils/product-variants";
import { DEFAULT_STOCK_FALLBACK } from "@/lib/constants/stock";

export interface StockInfo {
  itemId: string;
  currentStock: number;
  isOutOfStock: boolean;
  exceedsStock: boolean;
  availableQuantity: number;
  imageUrl?: string | null;
  productSlug?: string | null;
}

export type StockMap = Map<string, StockInfo>;

interface UseCartStockReturn {
  stockMap: StockMap;
  isLoading: boolean;
  hasStockIssues: boolean;
  refetch: () => void;
}

/**
 * Fetches current stock levels for cart items
 * Returns stock info map and loading state
 */
export function useCartStock(items: CartItem[]): UseCartStockReturn {
  const [stockMap, setStockMap] = useState<StockMap>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // Memoize product IDs to use as stable dependency
  const productIds = useMemo(
    () => items.map((item) => item.productId),
    [items]
  );

  const fetchStock = useCallback(async () => {
    if (items.length === 0) {
      setStockMap(new Map());
      return;
    }

    setIsLoading(true);

    try {
      const products = await client.fetch(PRODUCTS_BY_IDS_QUERY, {
        ids: productIds,
      });

      const newStockMap = new Map<string, StockInfo>();

      for (const item of items) {
        const product = products.find(
          (p: { _id: string }) => p._id === item.productId
        );

        const baseStock =
          typeof product?.stock === "number"
            ? product.stock
            : DEFAULT_STOCK_FALLBACK;
        let currentStock = baseStock;
        if (product?.variants?.length && item.variant) {
          let variant: ProductVariant | null =
            item.variant._key
              ? (product.variants?.find(
                  (entry: { _key?: string | null }) =>
                    entry?._key === item.variant?._key
                ) as ProductVariant | null)
              : null;

          if (!variant && item.variant.sku) {
            variant =
              (product.variants?.find(
                (entry: { sku?: string | null }) =>
                  entry?.sku === item.variant?.sku
              ) as ProductVariant | null) ?? null;
          }

          if (!variant && item.variant.options?.length) {
            const selectedOptions =
              item.variant.options?.reduce<Record<string, string>>(
                (acc, option) => {
                  acc[option.name] = option.value;
                  return acc;
                },
                {}
              ) ?? {};

            variant = getVariantBySelectedOptions(product, selectedOptions);
          }

          if (variant && typeof variant.stock === "number") {
            currentStock = variant.stock;
          }
        }

        newStockMap.set(item.id, {
          itemId: item.id,
          currentStock,
          isOutOfStock: currentStock === 0,
          exceedsStock: item.quantity > currentStock,
          availableQuantity: Math.min(item.quantity, currentStock),
          imageUrl: product?.image?.asset?.url ?? null,
          productSlug: product?.slug ?? null,
        });
      }

      setStockMap(newStockMap);
    } catch (error) {
      console.error("Failed to fetch stock:", error);
    } finally {
      setIsLoading(false);
    }
  }, [items, productIds]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const hasStockIssues = Array.from(stockMap.values()).some(
    (info) => info.isOutOfStock || info.exceedsStock
  );

  return {
    stockMap,
    isLoading,
    hasStockIssues,
    refetch: fetchStock,
  };
}
