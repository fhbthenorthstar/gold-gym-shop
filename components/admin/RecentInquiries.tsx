"use client";

import { Suspense } from "react";
import Link from "next/link";
import {
  useDocuments,
  useDocumentProjection,
  type DocumentHandle,
} from "@sanity/sdk-react";
import { MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  CONTACT_STATUS_CONFIG,
  type ContactStatusValue,
} from "@/lib/constants/contactStatus";

interface InquiryProjection {
  name: string;
  phone: string;
  status: ContactStatusValue;
  _createdAt: string;
}

function InquiryRow(handle: DocumentHandle) {
  const { data } = useDocumentProjection<InquiryProjection>({
    ...handle,
    projection: `{
      name,
      phone,
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
    <Link
      href="/admin/contact"
      className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-3 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {data.name}
        </p>
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {data.phone}
        </p>
      </div>
      <Badge className={`${statusConfig.color} flex items-center gap-1`}>
        <StatusIcon className="h-3 w-3" />
        {statusConfig.label}
      </Badge>
    </Link>
  );
}

function InquiryRowSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
      <div className="space-y-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
  );
}

function RecentInquiriesContent() {
  const { data: inquiries } = useDocuments({
    documentType: "contactMessage",
    orderings: [{ field: "_createdAt", direction: "desc" }],
    batchSize: 5,
  });

  if (!inquiries || inquiries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <MessageSquare className="h-6 w-6 text-zinc-400" />
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No inquiries yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {inquiries.slice(0, 5).map((handle) => (
        <Suspense key={handle.documentId} fallback={<InquiryRowSkeleton />}>
          <InquiryRow {...handle} />
        </Suspense>
      ))}
    </div>
  );
}

function RecentInquiriesSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <InquiryRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function RecentInquiries() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
          Recent Inquiries
        </h2>
        <Link
          href="/admin/contact"
          className="text-sm text-primary/80 hover:text-primary"
        >
          View all →
        </Link>
      </div>
      <div className="p-4">
        <Suspense fallback={<RecentInquiriesSkeleton />}>
          <RecentInquiriesContent />
        </Suspense>
      </div>
    </div>
  );
}
