"use client";

import { Badge } from "@/components/ui/badge";
import { useCartItem } from "@/lib/store/cart-store-provider";
import { cn } from "@/lib/utils";
import { isLowStock as checkLowStock } from "@/lib/constants/stock";

interface StockBadgeProps {
  itemId: string;
  stock: number;
  className?: string;
}

export function StockBadge({ itemId, stock, className }: StockBadgeProps) {
  const cartItem = useCartItem(itemId);

  const quantityInCart = cartItem?.quantity ?? 0;
  const isAtMax = quantityInCart >= stock && stock > 0;
  const lowStock = checkLowStock(stock);

  if (isAtMax) {
    return (
      <Badge
        variant="secondary"
        className={cn("w-fit bg-zinc-800 text-zinc-200", className)}
      >
        Max in cart
      </Badge>
    );
  }

  if (lowStock) {
    return (
      <Badge
        variant="secondary"
        className={cn("w-fit bg-primary text-black", className)}
      >
        Only {stock} left in stock
      </Badge>
    );
  }

  return null;
}
