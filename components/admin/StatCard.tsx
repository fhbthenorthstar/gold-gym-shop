"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useDocuments } from "@sanity/sdk-react";
import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  icon: LucideIcon;
  documentType: string;
  filter?: string;
  valueFormatter?: (count: number) => string;
  href?: string;
}

function StatCardContent({
  title,
  icon: Icon,
  documentType,
  filter,
  valueFormatter = (count) => count.toString(),
  href,
}: StatCardProps) {
  const { data } = useDocuments({
    documentType,
    filter,
  });

  const count = data?.length ?? 0;

  const content = (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-950/70 p-6",
        href &&
          "cursor-pointer transition-colors hover:border-primary/40 hover:bg-zinc-900/70",
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-white">
            {valueFormatter(count)}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function StatCardSkeleton({
  title,
  icon: Icon,
}: Pick<StatCardProps, "title" | "icon">) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400">
            {title}
          </p>
          <Skeleton className="mt-2 h-9 w-20" />
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}

export function StatCard(props: StatCardProps) {
  return (
    <Suspense
      fallback={<StatCardSkeleton title={props.title} icon={props.icon} />}
    >
      <StatCardContent {...props} />
    </Suspense>
  );
}
