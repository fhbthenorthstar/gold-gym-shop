"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import { PRODUCT_TYPES } from "@/lib/constants/filters";
import { useCartActions } from "@/lib/store/cart-store-provider";
import {
  useWishlistActions,
  useWishlistItems,
} from "@/lib/store/wishlist-store-provider";
import {
  useCompareActions,
  useCompareItems,
} from "@/lib/store/compare-store-provider";
import { Button } from "@/components/ui/button";
import { Heart, Scale, Share2 } from "lucide-react";
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
  const { addItem } = useCartActions();
  const wishlistItems = useWishlistItems();
  const compareItems = useCompareItems();
  const { toggleItem: toggleWishlist } = useWishlistActions();
  const { toggleItem: toggleCompare } = useCompareActions();
  const [quantity, setQuantity] = useState(1);

  const getMetafieldString = (key: string) =>
    product.metafields?.find((field) => field?.key === key)?.valueString ?? "";

  const shopifyType = getMetafieldString("shopifyType");
  const shopifyVendor = getMetafieldString("shopifyVendor");
  const productTypeLabel =
    PRODUCT_TYPES.find((type) => type.value === product.productType)?.label ??
    (product.productType ? product.productType.replace(/_/g, " ") : "");
  const brandLabel = product.brand ?? shopifyVendor;
  const typeLabel = shopifyType || productTypeLabel;

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

  const wishlistItem = {
    id: itemId,
    productId: product._id,
    name: product.name ?? "Unknown Product",
    price: displayPrice,
    image: imageUrl ?? undefined,
    slug: product.slug ?? undefined,
  };

  const isWishlisted = wishlistItems.some((item) => item.id === itemId);
  const isCompared = compareItems.some((item) => item.id === itemId);

  const handleAddToCart = () => {
    if (displayStock <= 0) return;
    addItem(
      { id: itemId, productId: product._id, name: product.name ?? "", price: displayPrice, image: imageUrl ?? undefined, variant: cartVariant },
      quantity
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Category */}
      {product.category && (
        <Link
          href={`/shop?category=${product.category.slug}`}
          className="text-xs uppercase tracking-[0.2em] text-lime-300"
        >
          {product.category.title}
        </Link>
      )}

      {/* Title */}
      <h1 className="font-heading text-3xl font-semibold text-white">
        {product.name}
      </h1>

      {/* Price */}
      <div className="flex items-center gap-4">
        <p className="text-2xl font-semibold text-white">
          {formatPrice(displayPrice)}
        </p>
        <StockBadge itemId={itemId} stock={displayStock} />
      </div>

      {/* Description */}
      {product.description && (
        <p className="text-sm leading-relaxed text-zinc-300">
          {product.description}
        </p>
      )}

      {/* Options */}
      {options.length > 0 && (
        <div className="space-y-4">
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
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-200">
                  {name}
                </p>
                <Select
                  value={selectedOptions[name] ?? ""}
                  onValueChange={(value) => handleOptionChange(name, value)}
                >
                  <SelectTrigger className="border-zinc-800 bg-zinc-950 text-zinc-200">
                    <SelectValue placeholder={`Select ${name}`} />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-800 bg-zinc-950 text-zinc-200">
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

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center rounded-md border border-zinc-800 bg-zinc-950">
          <button
            type="button"
            className="px-3 py-2 text-zinc-300 hover:text-white"
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="min-w-[40px] text-center text-sm text-white">
            {quantity}
          </span>
          <button
            type="button"
            className="px-3 py-2 text-zinc-300 hover:text-white"
            onClick={() => setQuantity((prev) => Math.min(prev + 1, displayStock))}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <Button
          onClick={handleAddToCart}
          className="h-11 flex-1 rounded-md bg-lime-300 text-black hover:bg-lime-200"
        >
          Add to Cart
        </Button>
        <Button
          variant="outline"
          className="h-11 flex-1 border-lime-300 text-lime-300 hover:bg-lime-300 hover:text-black"
        >
          Buy It Now
        </Button>
      </div>

      {/* Metadata */}
      <div className="space-y-2 border-t border-zinc-800 pt-6">
        {brandLabel && (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Vendor</span>
            <span className="font-medium text-zinc-200">
              {brandLabel}
            </span>
          </div>
        )}
        {typeLabel && (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Product Type</span>
            <span className="font-medium text-zinc-200">
              {typeLabel}
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
            <span className="text-zinc-500">Delivery</span>
            <span className="font-medium text-zinc-200">
              Digital access
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-zinc-400">
        <button
          type="button"
          onClick={() => toggleWishlist(wishlistItem)}
          className={`flex items-center gap-2 ${isWishlisted ? "text-lime-300" : ""}`}
        >
          <Heart className="h-4 w-4" />
          Add to wishlist
        </button>
        <button
          type="button"
          onClick={() => toggleCompare(wishlistItem)}
          className={`flex items-center gap-2 ${isCompared ? "text-lime-300" : ""}`}
        >
          <Scale className="h-4 w-4" />
          Add to compare
        </button>
        <button type="button" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>

      <AskAISimilarButton productName={product.name ?? "this product"} />
    </div>
  );
}
