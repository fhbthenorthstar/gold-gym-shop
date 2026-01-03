"use client";

import { Suspense } from "react";
import { useDocumentProjection, type DocumentHandle } from "@sanity/sdk-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { ContactStatusSelect } from "./ContactStatusSelect";
import {
  CONTACT_STATUS_CONFIG,
  type ContactStatusValue,
} from "@/lib/constants/contactStatus";

interface ContactProjection {
  name: string;
  phone: string;
  comment: string;
  status: ContactStatusValue;
  _createdAt: string;
}

function ContactRowContent(handle: DocumentHandle) {
  const { data } = useDocumentProjection<ContactProjection>({
    ...handle,
    projection: `{
      name,
      phone,
      comment,
      status,
      _createdAt
    }`,
  });

  if (!data) return null;

  const statusConfig =
    CONTACT_STATUS_CONFIG[data.status ?? "pending"] ??
    CONTACT_STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <TableRow className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
      <TableCell className="py-3 sm:py-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {data.name}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {data.phone}
          </p>
        </div>
      </TableCell>

      <TableCell className="py-3 text-sm text-zinc-600 dark:text-zinc-300 sm:py-4">
        <p className="line-clamp-2">{data.comment}</p>
      </TableCell>

      <TableCell className="py-3 sm:py-4">
        <Badge className={`${statusConfig.color} flex w-fit items-center gap-1 text-[10px] sm:text-xs`}>
          <StatusIcon className="h-3 w-3" />
          {statusConfig.label}
        </Badge>
      </TableCell>

      <TableCell className="py-3 sm:py-4">
        <ContactStatusSelect {...handle} />
      </TableCell>

      <TableCell className="hidden py-4 text-xs text-zinc-500 dark:text-zinc-400 md:table-cell">
        {formatDate(data._createdAt, "long", "—")}
      </TableCell>
    </TableRow>
  );
}

function ContactRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="py-3 sm:py-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-3 w-20" />
      </TableCell>
      <TableCell className="py-3 sm:py-4">
        <Skeleton className="h-4 w-full" />
      </TableCell>
      <TableCell className="py-3 sm:py-4">
        <Skeleton className="h-5 w-20" />
      </TableCell>
      <TableCell className="py-3 sm:py-4">
        <Skeleton className="h-8 w-[140px]" />
      </TableCell>
      <TableCell className="hidden py-4 md:table-cell">
        <Skeleton className="h-4 w-24" />
      </TableCell>
    </TableRow>
  );
}

export function ContactRow(props: DocumentHandle) {
  return (
    <Suspense fallback={<ContactRowSkeleton />}>
      <ContactRowContent {...props} />
    </Suspense>
  );
}

export { ContactRowSkeleton };
