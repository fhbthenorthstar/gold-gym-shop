"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDocumentProjection, type DocumentHandle } from "@sanity/sdk-react";
import { Star } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PublishButton, RevertButton } from "./PublishButton";

interface TrainingProjection {
  title: string;
  link: string | null;
  order: number | null;
  featured: boolean | null;
  image: {
    asset: {
      url: string;
    } | null;
  } | null;
}

function TrainingRowContent(handle: DocumentHandle) {
  const { data } = useDocumentProjection<TrainingProjection>({
    ...handle,
    projection: `{
      title,
      link,
      order,
      featured,
      "image": image{
        asset->{
          url
        }
      }
    }`,
  });

  if (!data) return null;

  return (
    <TableRow className="group">
      <TableCell className="hidden py-3 sm:table-cell">
        <div className="relative h-12 w-12 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
          {data.image?.asset?.url ? (
            <Image
              src={data.image.asset.url}
              alt={data.title ?? "Training"}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-zinc-400">
              ?
            </div>
          )}
        </div>
      </TableCell>

      <TableCell className="py-3 sm:py-4">
        <Link
          href={`/admin/trainings/${handle.documentId}`}
          className="flex items-start gap-3 sm:block"
        >
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800 sm:hidden">
            {data.image?.asset?.url ? (
              <Image
                src={data.image.asset.url}
                alt={data.title ?? "Training"}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                ?
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-medium text-zinc-900 group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300">
                {data.title || "Untitled training"}
              </span>
              {data.featured && (
                <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400 sm:hidden" />
              )}
            </div>
            <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400 sm:hidden">
              {data.link || "No link set"}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 sm:hidden">
              <span>Order: {data.order ?? 0}</span>
              {data.featured && (
                <Badge className="border border-primary/30 bg-primary/15 text-[10px] text-primary">
                  Featured
                </Badge>
              )}
            </div>
          </div>
        </Link>
      </TableCell>

      <TableCell className="hidden py-4 text-sm text-zinc-500 dark:text-zinc-400 md:table-cell">
        {data.link || "—"}
      </TableCell>

      <TableCell className="hidden py-4 text-sm text-zinc-500 dark:text-zinc-400 md:table-cell">
        {data.order ?? 0}
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

function TrainingRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="hidden py-3 sm:table-cell">
        <Skeleton className="h-12 w-12 rounded-md" />
      </TableCell>
      <TableCell className="py-3 sm:py-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-2 h-3 w-32 sm:hidden" />
      </TableCell>
      <TableCell className="hidden py-4 md:table-cell">
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell className="hidden py-4 md:table-cell">
        <Skeleton className="h-4 w-12" />
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

export function TrainingRow(props: DocumentHandle) {
  return (
    <Suspense fallback={<TrainingRowSkeleton />}>
      <TrainingRowContent {...props} />
    </Suspense>
  );
}

export { TrainingRowSkeleton };
