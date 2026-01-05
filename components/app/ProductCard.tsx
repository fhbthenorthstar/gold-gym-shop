"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/app/AddToCartButton";
import { StockBadge } from "@/components/app/StockBadge";
import { buildCartItemId } from "@/lib/utils/cart";
import {
  getDefaultVariant,
  getDisplayPrice,
  getDisplayStock,
  getVariantKey,
} from "@/lib/utils/product-variants";
import type { FILTER_PRODUCTS_BY_BEST_SELLING_QUERYResult } from "@/sanity.types";
import type { CartItemVariant } from "@/lib/store/cart-store";
import { Heart, Star } from "lucide-react";
import {
  useWishlistActions,
  useWishlistItems,
} from "@/lib/store/wishlist-store-provider";

type Product = FILTER_PRODUCTS_BY_BEST_SELLING_QUERYResult[number];

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(
    null,
  );
  const wishlistItems = useWishlistItems();
  const { toggleItem: toggleWishlist } = useWishlistActions();

  const images = product.images ?? [];
  const mainImageUrl = images[0]?.asset?.url;
  const displayedImageUrl =
    hoveredImageIndex !== null
      ? images[hoveredImageIndex]?.asset?.url
      : mainImageUrl;

  const defaultVariant = getDefaultVariant(product);
  const variantKey = getVariantKey(defaultVariant);
  const displayPrice = getDisplayPrice(product, defaultVariant);
  const displayStock = getDisplayStock(product, defaultVariant);
  const itemId = buildCartItemId(product._id, variantKey);
  const compareAtPrice = useMemo(() => {
    const values =
      product.variants
        ?.map((variant) => variant?.compareAtPrice ?? null)
        .filter((value): value is number => typeof value === "number") ?? [];
    if (values.length === 0) return null;
    return Math.min(...values);
  }, [product.variants]);
  const hasSale =
    compareAtPrice !== null && compareAtPrice > displayPrice;
  const cartVariant: CartItemVariant | undefined = defaultVariant
    ? {
        _key: defaultVariant?._key ?? undefined,
        sku: defaultVariant?.sku ?? undefined,
        options:
          defaultVariant?.optionValues?.flatMap((opt) =>
            opt?.name && opt?.value ? [{ name: opt.name, value: opt.value }] : []
          ) ?? undefined,
      }
    : undefined;

  const isOutOfStock = displayStock <= 0;
  const wishlistItem = {
    id: itemId,
    productId: product._id,
    name: product.name ?? "Unknown Product",
    price: displayPrice,
    image: mainImageUrl ?? undefined,
    slug: product.slug ?? undefined,
  };
  const isWishlisted = wishlistItems.some((item) => item.id === itemId);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
      <div className="relative">
        <Link href={`/products/${product.slug}`} className="block">
          <div
            className={cn("relative overflow-hidden bg-zinc-900 aspect-[4/5]")}
          >
            {displayedImageUrl ? (
              <Image
                src={displayedImageUrl}
                alt={product.name ?? "Product image"}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-500">
                No image
              </div>
            )}
          </div>
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {hasSale && (
            <Badge className="rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase text-black">
              Sale
            </Badge>
          )}
          {isOutOfStock && (
            <Badge className="rounded-full bg-red-500 px-3 py-1 text-[10px] font-semibold uppercase text-white">
              Out of Stock
            </Badge>
          )}
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => toggleWishlist(wishlistItem)}
            className={cn(
              "rounded-full border border-zinc-700 bg-black/70 p-2 text-zinc-300 hover:text-primary",
              isWishlisted && "text-primary",
            )}
            aria-label="Add to wishlist"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          {product.brand ?? "Gold's Gym BD"}
        </div>
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="line-clamp-2 text-base font-semibold text-white transition-colors group-hover:text-primary/90">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 text-primary">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="h-3 w-3 fill-primary" />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-white">
              {formatPrice(displayPrice)}
            </span>
            {hasSale && compareAtPrice && (
              <span className="text-xs text-zinc-500 line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>
          <StockBadge itemId={itemId} stock={displayStock} />
        </div>

        <div className="mt-auto">
          <AddToCartButton
            productId={product._id}
            name={product.name ?? "Unknown Product"}
            price={displayPrice}
            image={mainImageUrl ?? undefined}
            slug={product.slug ?? undefined}
            stock={displayStock}
            variantKey={variantKey}
            variant={cartVariant}
            className="h-10 rounded-full bg-primary text-black hover:bg-primary/90"
          />
        </div>
      </div>
    </div>
  );
}
