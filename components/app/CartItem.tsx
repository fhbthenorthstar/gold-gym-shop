"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartActions } from "@/lib/store/cart-store-provider";
import { AddToCartButton } from "@/components/app/AddToCartButton";
import { StockBadge } from "@/components/app/StockBadge";
import { cn, formatPrice } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/lib/store/cart-store";
import type { StockInfo } from "@/lib/hooks/useCartStock";

interface CartItemProps {
  item: CartItemType;
  stockInfo?: StockInfo;
}

export function CartItem({ item, stockInfo }: CartItemProps) {
  const { removeItem } = useCartActions();

  const isOutOfStock = stockInfo?.isOutOfStock ?? false;
  const exceedsStock = stockInfo?.exceedsStock ?? false;
  const currentStock = stockInfo?.currentStock ?? 999;
  const hasIssue = isOutOfStock || exceedsStock;
  const variantLabel =
    item.variant?.options
      ?.map((opt) => `${opt.name}: ${opt.value}`)
      .join(" / ") ?? "";
  const imageUrl = item.image ?? stockInfo?.imageUrl ?? undefined;
  const productSlug = item.slug ?? stockInfo?.productSlug ?? item.productId;

  return (
    <div
      className={cn(
        "flex gap-4 py-4",
        hasIssue && "rounded-lg bg-red-900/30 p-3",
      )}
    >
      {/* Image */}
      <div
        className={cn(
          "relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-900",
          isOutOfStock && "opacity-50",
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-400">
            No image
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <Link
            href={`/products/${productSlug}`}
            className={cn(
              "font-medium text-white hover:text-primary",
              isOutOfStock && "text-zinc-500",
            )}
          >
            {item.name}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-red-500"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove {item.name}</span>
          </Button>
        </div>

        {variantLabel && (
          <p className="mt-1 text-xs text-zinc-400">
            {variantLabel}
          </p>
        )}

        <p className="mt-1 text-sm font-medium text-white">
          {formatPrice(item.price)}
        </p>

        {/* Stock Badge & Quantity Controls */}
        <div className="mt-2 flex flex-row justify-between items-center gap-2">
          <StockBadge itemId={item.id} stock={currentStock} />
          {!isOutOfStock && (
            <div className="w-32 flex self-end ml-auto">
              <AddToCartButton
                itemId={item.id}
                productId={item.productId}
                name={item.name}
                price={item.price}
                image={imageUrl}
                slug={productSlug}
                stock={currentStock}
                variant={item.variant}
                tone="cart"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
