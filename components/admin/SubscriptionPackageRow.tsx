"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useDocumentProjection, type DocumentHandle } from "@sanity/sdk-react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { formatPackageLocation, formatPackageTier } from "@/lib/utils/subscriptions";
import { PublishButton, RevertButton } from "./PublishButton";

interface SubscriptionPackageProjection {
  title: string | null;
  location: string | null;
  tier: string | null;
  durationLabel: string | null;
  packagePrice: number | null;
  offerPrice: number | null;
  featured: boolean | null;
}

function SubscriptionPackageRowContent(handle: DocumentHandle) {
  const { data } = useDocumentProjection<SubscriptionPackageProjection>({
    ...handle,
    projection: `{
      title,
      location,
      tier,
      durationLabel,
      packagePrice,
      offerPrice,
      featured
    }`,
  });

  if (!data) return null;

  const offerPrice =
    typeof data.offerPrice === "number"
      ? data.offerPrice
      : data.packagePrice ?? 0;

  return (
    <TableRow className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
      <TableCell className="py-3 sm:py-4">
        <Link
          href={`/admin/packages/${handle.documentId}`}
          className="block"
        >
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            {data.title || "Untitled package"}
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {formatPackageLocation(data.location)} • {formatPackageTier(data.tier)}
          </p>
        </Link>
      </TableCell>

      <TableCell className="hidden py-4 text-sm text-zinc-500 dark:text-zinc-400 md:table-cell">
        {data.durationLabel ?? "—"}
      </TableCell>

      <TableCell className="hidden py-4 text-sm text-zinc-500 dark:text-zinc-400 md:table-cell">
        {formatPrice(offerPrice)}
      </TableCell>

      <TableCell className="hidden py-4 lg:table-cell">
        {data.featured ? (
          <Badge className="border border-primary/30 bg-primary/15 text-primary">
            Featured
          </Badge>
        ) : (
          <span className="text-xs text-zinc-400">—</span>
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

function SubscriptionPackageRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="py-3 sm:py-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-2 h-3 w-28" />
      </TableCell>
      <TableCell className="hidden py-4 md:table-cell">
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell className="hidden py-4 md:table-cell">
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell className="hidden py-4 lg:table-cell">
        <Skeleton className="h-5 w-20" />
      </TableCell>
      <TableCell className="hidden py-4 sm:table-cell">
        <Skeleton className="ml-auto h-8 w-[120px]" />
      </TableCell>
    </TableRow>
  );
}

export function SubscriptionPackageRow(props: DocumentHandle) {
  return (
    <Suspense fallback={<SubscriptionPackageRowSkeleton />}>
      <SubscriptionPackageRowContent {...props} />
    </Suspense>
  );
}

export { SubscriptionPackageRowSkeleton };
