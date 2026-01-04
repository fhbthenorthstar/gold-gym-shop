"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartActions } from "@/lib/store/cart-store-provider";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants/paymentMethods";
import type { ORDER_BY_ID_QUERYResult } from "@/sanity.types";

interface SuccessClientProps {
  order: NonNullable<ORDER_BY_ID_QUERYResult>;
}

type OrderItem = NonNullable<
  NonNullable<NonNullable<ORDER_BY_ID_QUERYResult>["items"]>[number]
>;

export function SuccessClient({ order }: SuccessClientProps) {
  const { clearCart } = useCartActions();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const orderItems = (order.items ?? []).filter(Boolean) as OrderItem[];
  const address = order.address;
  const paymentLabel = order.paymentMethod
    ? PAYMENT_METHOD_LABELS[order.paymentMethod as "cod" | "online"]
    : order.status?.toUpperCase();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-zinc-100 sm:px-6 lg:px-8">
      <div className="text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-primary" />
        <h1 className="mt-4 text-3xl font-bold text-white">
          Order Confirmed!
        </h1>
        {order.email && (
          <p className="mt-2 text-zinc-400">
            Thank you for your purchase. We&apos;ve sent a confirmation to{" "}
            <span className="font-medium text-white">{order.email}</span>
          </p>
        )}
      </div>

      <div className="mt-10 rounded-lg border border-zinc-800 bg-zinc-950">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="font-semibold text-white">
            Order Details
          </h2>
          {order.orderNumber && (
            <p className="mt-1 text-xs text-zinc-400">Order #{order.orderNumber}</p>
          )}
        </div>

        <div className="px-6 py-4">
          {orderItems.length > 0 && (
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div
                  key={item._key}
                  className="flex justify-between text-sm"
                >
                  <span className="text-zinc-400">
                    {item.product?.name ?? "Item"} × {item.quantity ?? 1}
                  </span>
                  <span className="font-medium text-white">
                    {formatPrice(
                      (item.priceAtPurchase ?? 0) * (item.quantity ?? 1)
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 space-y-2 border-t border-zinc-800 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Subtotal</span>
              <span className="text-white">
                {formatPrice(order.subtotal ?? order.total)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Shipping</span>
              <span className="text-white">
                {formatPrice(order.shippingFee ?? 0)}
              </span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span className="text-white">Total</span>
              <span className="text-white">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {address && (
          <div className="border-t border-zinc-800 px-6 py-4">
            <h3 className="text-sm font-medium text-white">
              Shipping to
            </h3>
            <div className="mt-2 text-sm text-zinc-400">
              {address.name && <p>{address.name}</p>}
              {address.phone && <p>{address.phone}</p>}
              {address.line1 && <p>{address.line1}</p>}
              {address.line2 && <p>{address.line2}</p>}
              <p>
                {[address.division, address.postcode]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {address.country && <p>{address.country}</p>}
            </div>
          </div>
        )}

        <div className="border-t border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-zinc-400" />
            <span className="text-sm text-zinc-400">
              Payment method:{" "}
              <span className="font-medium capitalize text-white">
                {paymentLabel ?? "COD"}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {order.clerkUserId && (
          <Button asChild variant="outline">
            <Link href="/orders">
              View Your Orders
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
        <Button asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
