"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AddToCartButton } from "@/components/app/AddToCartButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";
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
import type { PRODUCT_BY_SLUG_QUERYResult } from "@/sanity.types";

interface ProductStickyBarProps {
  product: NonNullable<PRODUCT_BY_SLUG_QUERYResult>;
}

export function ProductStickyBar({ product }: ProductStickyBarProps) {
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

  const [selectedOptions, setSelectedOptions] =
    useState<SelectedOptions>(initialSelections);

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
  const imageUrl = product.images?.[0]?.asset?.url;

  const handleOptionChange = (name: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name ?? "Product image"}
              width={48}
              height={48}
              className="h-12 w-12 rounded-md object-cover"
            />
          ) : null}
          <div>
            <p className="text-sm font-semibold text-white">{product.name}</p>
            <p className="text-xs text-zinc-400">{formatPrice(displayPrice)}</p>
          </div>
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-3">
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
              <Select
                key={name}
                value={selectedOptions[name] ?? ""}
                onValueChange={(value) => handleOptionChange(name, value)}
              >
                <SelectTrigger className="h-9 w-[120px] border-zinc-800 bg-black text-xs text-zinc-200">
                  <SelectValue placeholder={name} />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-black text-zinc-200">
                  {valuesToShow.map((value) => {
                    const isAvailable = availableValues.includes(value);
                    return (
                      <SelectItem
                        key={value}
                        value={value}
                        disabled={!isAvailable}
                      >
                        {value}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            );
          })}
        </div>

        <div className="ml-auto min-w-[180px]">
          <AddToCartButton
            productId={product._id}
            name={product.name ?? "Unknown Product"}
            price={displayPrice}
            image={imageUrl ?? undefined}
            slug={product.slug ?? undefined}
            stock={displayStock}
            variantKey={variantKey}
            variant={
              activeVariant
                ? {
                    sku: activeVariant?.sku ?? undefined,
                    options:
                      activeVariant?.optionValues?.flatMap((opt) =>
                        opt?.name && opt?.value
                          ? [{ name: opt.name, value: opt.value }]
                          : []
                      ) ?? undefined,
                  }
                : undefined
            }
            className="h-9 rounded-full bg-primary text-xs font-semibold text-black hover:bg-primary/90"
          />
        </div>
      </div>
    </div>
  );
}
