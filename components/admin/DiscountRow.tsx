"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useDocumentProjection, type DocumentHandle } from "@sanity/sdk-react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { PublishButton, RevertButton } from "./PublishButton";

interface DiscountProjection {
  title: string | null;
  code: string | null;
  type: "percentage" | "fixed" | null;
  amount: number | null;
  minSubtotal: number | null;
  active: boolean | null;
}

const formatDiscountAmount = (type: string | null, amount: number | null) => {
  if (type === "percentage") {
    return `${amount ?? 0}%`;
  }
  return formatPrice(amount ?? 0);
};

function DiscountRowContent(handle: DocumentHandle) {
  const { data } = useDocumentProjection<DiscountProjection>({
    ...handle,
    projection: `{
      title,
      code,
      type,
      amount,
      minSubtotal,
      active
    }`,
  });

  if (!data) return null;

  return (
    <TableRow className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
      <TableCell className="py-3 sm:py-4">
        <Link href={`/admin/discounts/${handle.documentId}`} className="block">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            {data.title || data.code || "Untitled discount"}
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {data.code ? data.code.toUpperCase() : "—"}
          </p>
        </Link>
      </TableCell>

      <TableCell className="hidden py-4 text-sm text-zinc-500 dark:text-zinc-400 md:table-cell">
        {data.type === "percentage" ? "Percentage" : "Fixed"}
      </TableCell>

      <TableCell className="hidden py-4 text-sm text-zinc-500 dark:text-zinc-400 md:table-cell">
        {formatDiscountAmount(data.type, data.amount)}
      </TableCell>

      <TableCell className="hidden py-4 text-sm text-zinc-500 dark:text-zinc-400 lg:table-cell">
        {typeof data.minSubtotal === "number" && data.minSubtotal > 0
          ? formatPrice(data.minSubtotal)
          : "None"}
      </TableCell>

      <TableCell className="hidden py-4 md:table-cell">
        {data.active ? (
          <Badge className="border border-green-500/40 bg-green-500/10 text-green-300">
            Active
          </Badge>
        ) : (
          <Badge className="border border-zinc-700 bg-zinc-900 text-zinc-400">
            Disabled
          </Badge>
        )}
      </TableCell>

      <TableCell className="hidden py-4 text-right sm:table-cell">
        <div className="flex justify-end gap-2">
          <Suspense fallback={<Skeleton className="h-8 w-10" />}>
            <RevertButton {...handle} />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-8 w-[120px]" />}>
            <PublishButton {...handle} size="sm" />
          </Suspense>
        </div>
      </TableCell>
    </TableRow>
  );
}

function DiscountRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="py-3 sm:py-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-2 h-3 w-20" />
      </TableCell>
      <TableCell className="hidden py-4 md:table-cell">
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell className="hidden py-4 md:table-cell">
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell className="hidden py-4 lg:table-cell">
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell className="hidden py-4 md:table-cell">
        <Skeleton className="h-5 w-20" />
      </TableCell>
      <TableCell className="hidden py-4 sm:table-cell">
        <Skeleton className="ml-auto h-8 w-[120px]" />
      </TableCell>
    </TableRow>
  );
}

export function DiscountRow(props: DocumentHandle) {
  return (
    <Suspense fallback={<DiscountRowSkeleton />}>
      <DiscountRowContent {...props} />
    </Suspense>
  );
}

export { DiscountRowSkeleton };
