"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { ORDER_BY_ID_QUERY } from "@/lib/sanity/queries/orders";
import type { ORDER_BY_ID_QUERYResult } from "@/sanity.types";
import { SuccessClient } from "./SuccessClient";
import { SuccessPageSkeleton } from "@/components/app/SuccessPageSkeleton";
import { Button } from "@/components/ui/button";

type OrderResult = NonNullable<ORDER_BY_ID_QUERYResult>;

const PENDING_ORDER_KEY = "checkout:lastOrder";
const MAX_ATTEMPTS = 8;
const POLL_INTERVAL_MS = 900;

interface SuccessPendingClientProps {
  orderId: string;
}

export function SuccessPendingClient({ orderId }: SuccessPendingClientProps) {
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(PENDING_ORDER_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { orderId?: string };
      if (!parsed?.orderId || parsed.orderId === orderId) {
        sessionStorage.removeItem(PENDING_ORDER_KEY);
      }
    } catch {
      sessionStorage.removeItem(PENDING_ORDER_KEY);
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId || order || attempts >= MAX_ATTEMPTS) return;
    let cancelled = false;
    const delay = attempts === 0 ? 0 : POLL_INTERVAL_MS;
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await client.fetch<ORDER_BY_ID_QUERYResult>(
          ORDER_BY_ID_QUERY,
          { id: orderId }
        );
        if (cancelled) return;
        if (result) {
          setOrder(result);
          return;
        }
      } catch (error) {
        if (!cancelled) {
          setLastError("We are still confirming your order.");
        }
        console.error("Order lookup failed:", error);
      }
      if (!cancelled) {
        setAttempts((prev) => prev + 1);
      }
    }, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [attempts, order, orderId]);

  if (order) {
    return <SuccessClient order={order} />;
  }

  if (attempts < MAX_ATTEMPTS) {
    return (
      <>
        <div className="mx-auto max-w-2xl px-4 pt-10 text-center text-xs text-zinc-400 sm:px-6 lg:px-8">
          Finalizing your order...
        </div>
        <SuccessPageSkeleton />
      </>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-zinc-100 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 text-center">
        <p className="text-sm text-zinc-300">
          We are still confirming your order. Please keep this page open or try
          again.
        </p>
        {lastError && <p className="mt-2 text-xs text-zinc-500">{lastError}</p>}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => {
              setAttempts(0);
              setLastError(null);
            }}
            className="bg-primary text-black hover:bg-primary/90"
          >
            Check again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
