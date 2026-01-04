"use client";

import { Suspense } from "react";
import { useDocuments } from "@sanity/sdk-react";
import { Skeleton } from "@/components/ui/skeleton";

function ActivitySnapshotContent() {
  const { count: ordersCount = 0 } = useDocuments({
    documentType: "order",
    batchSize: 1,
  });
  const { count: subscriptionsCount = 0 } = useDocuments({
    documentType: "subscription",
    batchSize: 1,
  });
  const { count: inquiriesCount = 0 } = useDocuments({
    documentType: "contactMessage",
    batchSize: 1,
  });
  const { count: productsCount = 0 } = useDocuments({
    documentType: "product",
    batchSize: 1,
  });

  const metrics = [
    { label: "Orders", value: ordersCount },
    { label: "Subscriptions", value: subscriptionsCount },
    { label: "Inquiries", value: inquiriesCount },
    { label: "Products", value: productsCount },
  ];

  const maxValue = Math.max(1, ...metrics.map((metric) => metric.value));

  return (
    <div className="grid gap-4 sm:grid-cols-4">
      {metrics.map((metric) => {
        const height = Math.max(18, Math.round((metric.value / maxValue) * 96));
        return (
          <div
            key={metric.label}
            className="rounded-lg border border-zinc-800 bg-black/60 p-4"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {metric.value}
            </p>
            <div className="mt-4 flex h-28 items-end rounded-md bg-zinc-900/60 px-2 pb-2">
              <div
                className="w-full rounded-md bg-primary/80"
                style={{ height }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActivitySnapshotSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="rounded-lg border border-zinc-800 bg-black/60 p-4"
        >
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-7 w-12" />
          <Skeleton className="mt-4 h-28 w-full" />
        </div>
      ))}
    </div>
  );
}

export function ActivitySnapshot() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white">Performance Snapshot</h2>
          <p className="text-sm text-zinc-400">
            A quick look at key activity signals.
          </p>
        </div>
      </div>
      <Suspense fallback={<ActivitySnapshotSkeleton />}>
        <ActivitySnapshotContent />
      </Suspense>
    </div>
  );
}
