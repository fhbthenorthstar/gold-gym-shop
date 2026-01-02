"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import {
  useTotalPrice,
  useTotalItems,
  useCartActions,
} from "@/lib/store/cart-store-provider";

interface CartSummaryProps {
  hasStockIssues?: boolean;
}

export function CartSummary({ hasStockIssues = false }: CartSummaryProps) {
  const totalPrice = useTotalPrice();
  const totalItems = useTotalItems();
  const { closeCart } = useCartActions();

  if (totalItems === 0) return null;

  return (
    <div className="border-t border-zinc-800 p-4">
      <div className="flex justify-between text-base font-medium text-white">
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
          <Button asChild className="w-full bg-lime-300 text-black hover:bg-lime-200">
            <Link href="/checkout" onClick={() => closeCart()}>
              Checkout
            </Link>
          </Button>
        )}
      </div>
      <div className="mt-3 text-center">
        <Link
          href="/"
          className="text-sm text-zinc-400 hover:text-lime-300"
        >
          Continue Shopping →
        </Link>
      </div>
    </div>
  );
}
