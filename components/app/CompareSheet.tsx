"use client";

import Image from "next/image";
import Link from "next/link";
import { Scale, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import {
  useCompareActions,
  useCompareIsOpen,
  useCompareItems,
} from "@/lib/store/compare-store-provider";

export function CompareSheet() {
  const items = useCompareItems();
  const isOpen = useCompareIsOpen();
  const { closeCompare, removeItem } = useCompareActions();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCompare()}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-lg">
        <SheetHeader className="border-b border-zinc-800">
          <SheetTitle className="flex items-center gap-2 text-white">
            <Scale className="h-5 w-5 text-primary" />
            Compare ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Scale className="h-12 w-12 text-zinc-600" />
            <h3 className="mt-4 text-lg font-medium text-white">
              No products to compare
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Add up to 4 items to compare.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-800">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <Link
                      href={item.slug ? `/products/${item.slug}` : "#"}
                      className="text-sm font-semibold text-white hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <span className="text-xs text-zinc-400">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-zinc-400 hover:text-red-400"
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove from compare"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
