"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useDocumentProjection, type DocumentHandle } from "@sanity/sdk-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatPrice } from "@/lib/utils";
import { getSubscriptionStatus } from "@/lib/constants/subscriptionStatus";
import { SubscriptionStatusSelect } from "./SubscriptionStatusSelect";

interface SubscriptionProjection {
  subscriptionNumber: string | null;
  subscriberName: string | null;
  subscriberPhone: string | null;
  price: number | null;
  status: string | null;
  startDate: string | null;
  packageTitle: string | null;
}

function SubscriptionRowContent(handle: DocumentHandle) {
  const { data } = useDocumentProjection<SubscriptionProjection>({
    ...handle,
    projection: `{
      subscriptionNumber,
      subscriberName,
      subscriberPhone,
      price,
      status,
      startDate,
      "packageTitle": package->title
    }`,
  });

  if (!data) return null;

  const status = getSubscriptionStatus(data.status);
  const StatusIcon = status.icon;

  return (
    <TableRow className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
      <TableCell className="py-3 sm:py-4">
        <Link href={`/admin/subscriptions/${handle.documentId}`} className="block">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            {data.subscriberName || "Subscriber"}
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {data.subscriberPhone || "No phone"} • {data.subscriptionNumber || "Subscription"}
          </p>
        </Link>
      </TableCell>

      <TableCell className="hidden py-4 text-sm text-zinc-500 dark:text-zinc-400 md:table-cell">
        {data.packageTitle || "Package"}
      </TableCell>

      <TableCell className="py-3 sm:py-4">
        <Badge className={`${status.color} flex w-fit items-center gap-1 text-[10px] sm:text-xs`}>
          <StatusIcon className="h-3 w-3" />
          <span className="hidden sm:inline">{status.label}</span>
        </Badge>
      </TableCell>

      <TableCell className="hidden py-4 text-sm text-zinc-500 dark:text-zinc-400 md:table-cell">
        {formatDate(data.startDate, "long", "—")}
      </TableCell>

      <TableCell className="hidden py-4 text-sm text-zinc-500 dark:text-zinc-400 md:table-cell">
        {formatPrice(data.price ?? 0)}
      </TableCell>

      <TableCell className="hidden py-4 text-right sm:table-cell">
        <SubscriptionStatusSelect {...handle} />
      </TableCell>
    </TableRow>
  );
}

function SubscriptionRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="py-3 sm:py-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-2 h-3 w-24" />
      </TableCell>
      <TableCell className="hidden py-4 md:table-cell">
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell className="py-3 sm:py-4">
        <Skeleton className="h-5 w-20" />
      </TableCell>
      <TableCell className="hidden py-4 md:table-cell">
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell className="hidden py-4 md:table-cell">
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell className="hidden py-4 sm:table-cell">
        <Skeleton className="ml-auto h-8 w-[160px]" />
      </TableCell>
    </TableRow>
  );
}

export function SubscriptionRow(props: DocumentHandle) {
  return (
    <Suspense fallback={<SubscriptionRowSkeleton />}>
      <SubscriptionRowContent {...props} />
    </Suspense>
  );
}

export { SubscriptionRowSkeleton };
