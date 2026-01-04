"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/app/AddToCartButton";
import { StockBadge } from "@/components/app/StockBadge";
import {
  getDefaultVariant,
  getDisplayPrice,
  getDisplayStock,
  getVariantKey,
} from "@/lib/utils/product-variants";
import { buildCartItemId } from "@/lib/utils/cart";
import type { FILTER_PRODUCTS_BY_BEST_SELLING_QUERYResult } from "@/sanity.types";
import type { CartItemVariant } from "@/lib/store/cart-store";

type Product = FILTER_PRODUCTS_BY_BEST_SELLING_QUERYResult[number];

interface ProductListItemProps {
  product: Product;
}

export function ProductListItem({ product }: ProductListItemProps) {
  const imageUrl = product.images?.[0]?.asset?.url;
  const defaultVariant = getDefaultVariant(product);
  const displayPrice = getDisplayPrice(product, defaultVariant);
  const displayStock = getDisplayStock(product, defaultVariant);
  const variantKey = getVariantKey(defaultVariant);
  const itemId = buildCartItemId(product._id, variantKey);
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

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 md:flex-row">
      <Link href={`/products/${product.slug}`} className="relative h-40 w-full overflow-hidden rounded-lg bg-zinc-900 md:h-36 md:w-44">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name ?? "Product"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 180px"
          />
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2">
        <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          {product.brand ?? "Gold's Gym BD"}
        </div>
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-lg font-semibold text-white hover:text-primary/90">
            {product.name}
          </h3>
        </Link>
        <p className="line-clamp-2 text-sm text-zinc-400">
          {product.description}
        </p>
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-white">
            {formatPrice(displayPrice)}
          </span>
          <StockBadge itemId={itemId} stock={displayStock} />
        </div>
        <div className="max-w-[220px]">
          <AddToCartButton
            productId={product._id}
            name={product.name ?? "Unknown Product"}
            price={displayPrice}
            image={imageUrl ?? undefined}
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
