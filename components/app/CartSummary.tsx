"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import {
  useTotalPrice,
  useTotalItems,
  useCartActions,
} from "@/lib/store/cart-store-provider";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants/bangladesh";

interface CartSummaryProps {
  hasStockIssues?: boolean;
}

export function CartSummary({ hasStockIssues = false }: CartSummaryProps) {
  const totalPrice = useTotalPrice();
  const totalItems = useTotalItems();
  const { closeCart } = useCartActions();
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);
  const progress =
    FREE_SHIPPING_THRESHOLD > 0
      ? Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100)
      : 0;

  if (totalItems === 0) return null;

  return (
    <div className="border-t border-zinc-800 p-4">
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          Delivery Progress
        </p>
        <p className="mt-2 text-sm text-zinc-200">
          {remainingForFree > 0
            ? `Spend ${formatPrice(remainingForFree)} more to get free delivery.`
            : "You unlocked free delivery!"}
        </p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-900">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-zinc-400">
          Dhaka delivery: ৳60 • Outside Dhaka: ৳100 • Free over{" "}
          {formatPrice(FREE_SHIPPING_THRESHOLD)}
        </p>
      </div>

      <div className="mt-4 flex justify-between text-base font-medium text-white">
        <span>Subtotal</span>
        <span>{formatPrice(totalPrice)}</span>
      </div>
      <p className="mt-1 text-sm text-zinc-400">
        Shipping calculated at checkout
      </p>
      <div className="mt-4">
        {hasStockIssues ? (
          <Button disabled className="w-full">
            Resolve stock issues to checkout
          </Button>
        ) : (
          <Button asChild className="w-full bg-primary text-black hover:bg-primary/90">
            <Link href="/checkout" onClick={() => closeCart()}>
              Checkout
            </Link>
          </Button>
        )}
      </div>
      <div className="mt-3 text-center">
        <Link
          href="/"
          className="text-sm text-zinc-400 hover:text-primary"
        >
          Continue Shopping →
        </Link>
      </div>
    </div>
  );
}
