"use client";

import { AlertTriangle, Loader2, ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useCartItems,
  useCartIsOpen,
  useCartActions,
  useTotalItems,
} from "@/lib/store/cart-store-provider";
import { useCartStock } from "@/lib/hooks/useCartStock";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";

export function CartSheet() {
  const items = useCartItems();
  const isOpen = useCartIsOpen();
  const totalItems = useTotalItems();
  const { closeCart } = useCartActions();
  const { stockMap, isLoading, hasStockIssues } = useCartStock(items);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-lg">
        <SheetHeader className="border-b border-zinc-800">
          <SheetTitle className="flex items-center gap-2 text-white">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({totalItems})
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <ShoppingBag className="h-12 w-12 text-zinc-600" />
            <h3 className="mt-4 text-lg font-medium text-white">
              Your cart is empty
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Add some items to get started
            </p>
          </div>
        ) : (
          <>
            {/* Stock Issues Banner */}
            {hasStockIssues && !isLoading && (
              <div className="flex items-center gap-2 rounded-lg border border-red-400/40 bg-red-900/30 px-3 py-2 text-sm text-red-200">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  Some items have stock issues. Please review before checkout.
                </span>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-5">
              <div className="space-y-2 divide-y divide-zinc-800 py-2">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    stockInfo={stockMap.get(item.id)}
                  />
                ))}
              </div>
            </div>

            {/* Summary */}
            <CartSummary hasStockIssues={hasStockIssues} />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
