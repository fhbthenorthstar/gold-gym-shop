"use client";

import { Suspense } from "react";
import Link from "next/link";
import {
  useDocuments,
  useDocumentProjection,
  type DocumentHandle,
} from "@sanity/sdk-react";
import { CalendarCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getSubscriptionStatus } from "@/lib/constants/subscriptionStatus";
import { formatPrice } from "@/lib/utils";

interface SubscriptionProjection {
  subscriberName: string;
  price: number;
  status: string;
  packageTitle: string;
}

function SubscriptionRow(handle: DocumentHandle) {
  const { data } = useDocumentProjection<SubscriptionProjection>({
    ...handle,
    projection: `{
      subscriberName,
      price,
      status,
      "packageTitle": package->title
    }`,
  });

  if (!data) return null;

  const status = getSubscriptionStatus(data.status);
  const StatusIcon = status.icon;

  return (
    <Link
      href={`/admin/subscriptions/${handle.documentId}`}
      className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-3 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {data.subscriberName || "Member"}
        </p>
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {data.packageTitle || "Membership"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {formatPrice(data.price)}
        </p>
        <Badge className={`${status.color} flex items-center gap-1`}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </Badge>
      </div>
    </Link>
  );
}

function SubscriptionRowSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
      <div className="space-y-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}

function RecentSubscriptionsContent() {
  const { data: subscriptions } = useDocuments({
    documentType: "subscription",
    orderings: [{ field: "_createdAt", direction: "desc" }],
    batchSize: 5,
  });

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <CalendarCheck className="h-6 w-6 text-zinc-400" />
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No subscriptions yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {subscriptions.slice(0, 5).map((handle) => (
        <Suspense key={handle.documentId} fallback={<SubscriptionRowSkeleton />}>
          <SubscriptionRow {...handle} />
        </Suspense>
      ))}
    </div>
  );
}

function RecentSubscriptionsSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <SubscriptionRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function RecentSubscriptions() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
          Recent Subscriptions
        </h2>
        <Link
          href="/admin/subscriptions"
          className="text-sm text-primary/80 hover:text-primary"
        >
          View all →
        </Link>
      </div>
      <div className="p-4">
        <Suspense fallback={<RecentSubscriptionsSkeleton />}>
          <RecentSubscriptionsContent />
        </Suspense>
      </div>
    </div>
  );
}
