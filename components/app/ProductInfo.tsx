"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AddToCartButton } from "@/components/app/AddToCartButton";
import { AskAISimilarButton } from "@/components/app/AskAISimilarButton";
import { StockBadge } from "@/components/app/StockBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";
import { buildCartItemId } from "@/lib/utils/cart";
import type { CartItemVariant } from "@/lib/store/cart-store";
import type { PRODUCT_BY_SLUG_QUERYResult } from "@/sanity.types";
import {
  getAvailableOptionValues,
  getDefaultVariant,
  getDisplayPrice,
  getDisplayStock,
  getSelectedOptionsFromVariant,
  getVariantBySelectedOptions,
  getVariantKey,
  type SelectedOptions,
} from "@/lib/utils/product-variants";

interface ProductInfoProps {
  product: NonNullable<PRODUCT_BY_SLUG_QUERYResult>;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const imageUrl = product.images?.[0]?.asset?.url;
  const options = product.options ?? [];

  const defaultVariant = useMemo(() => getDefaultVariant(product), [product]);
  const initialSelections = useMemo<SelectedOptions>(() => {
    const fromVariant = getSelectedOptionsFromVariant(defaultVariant);
    if (Object.keys(fromVariant).length > 0) return fromVariant;

    return options.reduce<SelectedOptions>((acc, option) => {
      const name = option?.name?.trim();
      const values = option?.values?.filter(Boolean) ?? [];
      if (name && values.length > 0) {
        acc[name] = values[0];
      }
      return acc;
    }, {});
  }, [defaultVariant, options]);

  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(
    initialSelections
  );

  useEffect(() => {
    setSelectedOptions(initialSelections);
  }, [initialSelections]);

  const availableOptionValues = useMemo(
    () => getAvailableOptionValues(product, selectedOptions),
    [product, selectedOptions]
  );

  const selectedVariant = useMemo(
    () => getVariantBySelectedOptions(product, selectedOptions),
    [product, selectedOptions]
  );

  const activeVariant = selectedVariant ?? defaultVariant;
  const displayPrice = getDisplayPrice(product, activeVariant);
  const displayStock = getDisplayStock(product, activeVariant);
  const variantKey = getVariantKey(activeVariant);
  const itemId = buildCartItemId(product._id, variantKey);
  const cartVariant: CartItemVariant | undefined = activeVariant
    ? {
        sku: activeVariant?.sku ?? undefined,
        options:
          activeVariant?.optionValues?.flatMap((opt) =>
            opt?.name && opt?.value ? [{ name: opt.name, value: opt.value }] : []
          ) ?? undefined,
      }
    : undefined;

  const handleOptionChange = (name: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="flex flex-col">
      {/* Category */}
      {product.category && (
        <Link
          href={`/?category=${product.category.slug}`}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          {product.category.title}
        </Link>
      )}

      {/* Title */}
      <h1 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        {product.name}
      </h1>

      {/* Price */}
      <p className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        {formatPrice(displayPrice)}
      </p>

      {/* Description */}
      {product.description && (
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          {product.description}
        </p>
      )}

      {/* Options */}
      {options.length > 0 && (
        <div className="mt-6 space-y-4">
          {options.map((option) => {
            const name = option?.name?.trim();
            if (!name) return null;

            const configuredValues = option?.values?.filter(Boolean) ?? [];
            const availableValues = availableOptionValues[name] ?? [];
            const valuesToShow = configuredValues.length
              ? configuredValues
              : availableValues;

            if (valuesToShow.length === 0) return null;

            return (
              <div key={name} className="space-y-2">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {name}
                </p>
                <Select
                  value={selectedOptions[name] ?? ""}
                  onValueChange={(value) => handleOptionChange(name, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${name}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {valuesToShow.map((value) => {
                      const isAvailable = availableValues.includes(value);
                      return (
                        <SelectItem key={value} value={value} disabled={!isAvailable}>
                          {value}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      )}

      {/* Stock & Add to Cart */}
      <div className="mt-6 flex flex-col gap-3">
        <StockBadge itemId={itemId} stock={displayStock} />
        <AddToCartButton
          productId={product._id}
          name={product.name ?? "Unknown Product"}
          price={displayPrice}
          image={imageUrl ?? undefined}
          stock={displayStock}
          variantKey={variantKey}
          variant={cartVariant}
        />
        <AskAISimilarButton productName={product.name ?? "this product"} />
      </div>

      {/* Metadata */}
      <div className="mt-6 space-y-2 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        {product.brand && (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Brand</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {product.brand}
            </span>
          </div>
        )}
        {product.productType && (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Type</span>
            <span className="font-medium capitalize text-zinc-900 dark:text-zinc-100">
              {product.productType.replace(/_/g, " ")}
            </span>
          </div>
        )}
        {product.gender && (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Gender</span>
            <span className="font-medium capitalize text-zinc-900 dark:text-zinc-100">
              {product.gender}
            </span>
          </div>
        )}
        {product.goals?.length ? (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Goals</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {product.goals.map((goal) => goal.replace(/_/g, " ")).join(", ")}
            </span>
          </div>
        ) : null}
        {product.sports?.length ? (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Sports</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {product.sports.map((sport) => sport.replace(/_/g, " ")).join(", ")}
            </span>
          </div>
        ) : null}
        {product.isDigital && (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Delivery</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              Digital access
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
