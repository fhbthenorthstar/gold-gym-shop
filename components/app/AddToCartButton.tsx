"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartActions, useCartItem } from "@/lib/store/cart-store-provider";
import { cn } from "@/lib/utils";
import { buildCartItemId } from "@/lib/utils/cart";
import type { CartItemVariant } from "@/lib/store/cart-store";

interface AddToCartButtonProps {
  itemId?: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  slug?: string;
  stock: number;
  variantKey?: string;
  variant?: CartItemVariant;
  className?: string;
  tone?: "default" | "cart";
}

export function AddToCartButton({
  itemId,
  productId,
  name,
  price,
  image,
  slug,
  stock,
  variantKey,
  variant,
  className,
  tone = "default",
}: AddToCartButtonProps) {
  const resolvedItemId = itemId ?? buildCartItemId(productId, variantKey);
  const { addItem, updateQuantity } = useCartActions();
  const cartItem = useCartItem(resolvedItemId);

  const quantityInCart = cartItem?.quantity ?? 0;
  const isOutOfStock = stock <= 0;
  const isAtMax = quantityInCart >= stock;

  const handleAdd = () => {
    if (quantityInCart < stock) {
      addItem(
        { id: resolvedItemId, productId, name, price, image, slug, variant },
        1
      );
      toast.success(`Added ${name}`);
    }
  };

  const handleDecrement = () => {
    if (quantityInCart > 0) {
      updateQuantity(resolvedItemId, quantityInCart - 1);
    }
  };

  // Out of stock
  if (isOutOfStock) {
    return (
      <Button
        disabled
        variant="secondary"
        className={cn("h-11 w-full", className)}
      >
        Out of Stock
      </Button>
    );
  }

  // Not in cart - show Add to Basket button
  if (quantityInCart === 0) {
    return (
      <Button onClick={handleAdd} className={cn("h-11 w-full", className)}>
        <ShoppingBag className="mr-2 h-4 w-4" />
        Add to Basket
      </Button>
    );
  }

  // In cart - show quantity controls
  const isCartTone = tone === "cart";

  return (
    <div
      className={cn(
        "flex h-11 w-full items-center rounded-md border",
        isCartTone
          ? "border-primary/60 bg-primary text-black"
          : "border-zinc-200 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-full flex-1 rounded-r-none",
          isCartTone && "text-black hover:bg-primary/80 hover:text-black"
        )}
        onClick={handleDecrement}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span
        className={cn(
          "flex-1 text-center text-sm font-semibold tabular-nums",
          isCartTone ? "text-black" : "text-zinc-900 dark:text-zinc-100"
        )}
      >
        {quantityInCart}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-full flex-1 rounded-l-none disabled:opacity-20",
          isCartTone && "text-black hover:bg-primary/80 hover:text-black"
        )}
        onClick={handleAdd}
        disabled={isAtMax}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
