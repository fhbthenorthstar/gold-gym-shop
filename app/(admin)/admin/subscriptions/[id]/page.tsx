"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import {
  useDocument,
  useEditDocument,
  useDocumentProjection,
  type DocumentHandle,
} from "@sanity/sdk-react";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SubscriptionStatusSelect } from "@/components/admin";
import {
  SUBSCRIPTION_PAYMENT_STATUS_LABELS,
  SUBSCRIPTION_PAYMENT_STATUS_SANITY_LIST,
} from "@/lib/constants/subscriptionPayments";
import { formatDate, formatPrice } from "@/lib/utils";
import { formatPackageLocation, formatPackageTier } from "@/lib/utils/subscriptions";

interface SubscriptionDetailProjection {
  subscriptionNumber: string | null;
  subscriberName: string | null;
  subscriberEmail: string | null;
  subscriberPhone: string | null;
  price: number | null;
  status: string | null;
  paymentStatus: string | null;
  paymentMethod: string | null;
  startDate: string | null;
  endDate: string | null;
  nextRenewalDate: string | null;
  notes: string | null;
  package: {
    title: string | null;
    location: string | null;
    tier: string | null;
    durationLabel: string | null;
    accessLabel: string | null;
  } | null;
}

function NotesEditor(handle: DocumentHandle) {
  const { data: notes } = useDocument({ ...handle, path: "notes" });
  const editNotes = useEditDocument({ ...handle, path: "notes" });

  return (
    <Textarea
      value={(notes as string) ?? ""}
      onChange={(event) => editNotes(event.target.value)}
      placeholder="Add internal notes for this member..."
    />
  );
}

function PaymentStatusEditor(handle: DocumentHandle) {
  const { data } = useDocument({ ...handle, path: "paymentStatus" });
  const edit = useEditDocument({ ...handle, path: "paymentStatus" });
  const value = (data as string) ?? "pending";

  return (
    <Select value={value} onValueChange={(next) => edit(next)}>
      <SelectTrigger>
        <SelectValue>
          {SUBSCRIPTION_PAYMENT_STATUS_LABELS[value as keyof typeof SUBSCRIPTION_PAYMENT_STATUS_LABELS] ?? "Pending"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {SUBSCRIPTION_PAYMENT_STATUS_SANITY_LIST.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function SubscriptionDetailContent({ handle }: { handle: DocumentHandle }) {
  const { data } = useDocumentProjection<SubscriptionDetailProjection>({
    ...handle,
    projection: `{
      subscriptionNumber,
      subscriberName,
      subscriberEmail,
      subscriberPhone,
      price,
      status,
      paymentStatus,
      paymentMethod,
      startDate,
      endDate,
      nextRenewalDate,
      notes,
      "package": package->{
        title,
        location,
        tier,
        durationLabel,
        accessLabel
      }
    }`,
  });

  if (!data) {
    return (
      <div className="py-16 text-center">
        <p className="text-zinc-500">Subscription not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
            {data.subscriberName || "Subscriber"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {data.subscriptionNumber || "Subscription"}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Status:
            </span>
            <SubscriptionStatusSelect {...handle} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Member Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 text-sm text-zinc-500 dark:text-zinc-400">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Email
              </p>
              <p className="mt-1 text-zinc-900 dark:text-zinc-100">
                {data.subscriberEmail || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Phone
              </p>
              <p className="mt-1 text-zinc-900 dark:text-zinc-100">
                {data.subscriberPhone || "—"}
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 text-sm text-zinc-500 dark:text-zinc-400">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Start Date
              </p>
              <p className="mt-1 text-zinc-900 dark:text-zinc-100">
                {formatDate(data.startDate, "long", "—")}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                End Date
              </p>
              <p className="mt-1 text-zinc-900 dark:text-zinc-100">
                {formatDate(data.endDate, "long", "—")}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Next Renewal
              </p>
              <p className="mt-1 text-zinc-900 dark:text-zinc-100">
                {formatDate(data.nextRenewalDate, "long", "—")}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Amount
              </p>
              <p className="mt-1 text-zinc-900 dark:text-zinc-100">
                {formatPrice(data.price ?? 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Package Summary
          </h2>
          <div className="space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
            <p className="text-base text-zinc-900 dark:text-zinc-100">
              {data.package?.title || "Package"}
            </p>
            <Badge className="border border-primary/30 bg-primary/10 text-primary">
              {formatPackageTier(data.package?.tier ?? "")}
            </Badge>
            <p>Location: {formatPackageLocation(data.package?.location ?? "")}</p>
            <p>Duration: {data.package?.durationLabel ?? "—"}</p>
            <p>Access: {data.package?.accessLabel ?? "—"}</p>
          </div>
          <div className="space-y-2">
            <Label>Payment Status</Label>
            <PaymentStatusEditor {...handle} />
          </div>
          <div className="space-y-2">
            <Label>Internal Notes</Label>
            <NotesEditor {...handle} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SubscriptionDetailSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-[420px] w-full" />
    </div>
  );
}

export default function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const handle: DocumentHandle = {
    documentId: id,
    documentType: "subscription",
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <Link href="/admin/subscriptions" className="text-sm text-zinc-500 hover:text-primary">
        <span className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to subscriptions
        </span>
      </Link>
      <Suspense fallback={<SubscriptionDetailSkeleton />}>
        <SubscriptionDetailContent handle={handle} />
      </Suspense>
    </div>
  );
}
