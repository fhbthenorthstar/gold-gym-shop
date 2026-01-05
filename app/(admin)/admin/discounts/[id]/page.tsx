"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import {
  useDocument,
  useEditDocument,
  type DocumentHandle,
} from "@sanity/sdk-react";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteButton, PublishButton, RevertButton } from "@/components/admin";

const DISCOUNT_TYPE_OPTIONS = [
  { label: "Percentage", value: "percentage" },
  { label: "Fixed Amount", value: "fixed" },
];

function TextEditor({
  handle,
  path,
  placeholder,
  type = "text",
  min,
}: {
  handle: DocumentHandle;
  path: string;
  placeholder: string;
  type?: string;
  min?: number;
}) {
  const { data } = useDocument({ ...handle, path });
  const edit = useEditDocument({ ...handle, path });

  return (
    <Input
      type={type}
      min={min}
      value={(data as string | number) ?? ""}
      onChange={(event) => {
        const value =
          type === "number"
            ? Number(event.target.value) || 0
            : event.target.value;
        edit(value);
      }}
      placeholder={placeholder}
    />
  );
}

function SelectEditor({
  handle,
  path,
  options,
  placeholder,
}: {
  handle: DocumentHandle;
  path: string;
  options: { label: string; value: string }[];
  placeholder: string;
}) {
  const { data } = useDocument({ ...handle, path });
  const edit = useEditDocument({ ...handle, path });
  const value = (data as string) ?? "";

  return (
    <Select value={value} onValueChange={(next) => edit(next)}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ToggleEditor({ handle, path }: { handle: DocumentHandle; path: string }) {
  const { data } = useDocument({ ...handle, path });
  const edit = useEditDocument({ ...handle, path });
  return (
    <Switch checked={(data as boolean) ?? false} onCheckedChange={edit} />
  );
}

function DiscountDetailContent({ handle }: { handle: DocumentHandle }) {
  const { data: title } = useDocument({ ...handle, path: "title" });
  const { data: code } = useDocument({ ...handle, path: "code" });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
            {(title as string) || "New Discount"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {(code as string) ? (code as string).toUpperCase() : "No code set"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DeleteButton handle={handle} />
          <Suspense fallback={null}>
            <RevertButton {...handle} />
          </Suspense>
          <Suspense fallback={null}>
            <PublishButton {...handle} />
          </Suspense>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Discount Title</Label>
              <TextEditor handle={handle} path="title" placeholder="New Member Savings" />
            </div>
            <div className="space-y-2">
              <Label>Code</Label>
              <TextEditor handle={handle} path="code" placeholder="WELCOME500" />
            </div>
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <SelectEditor
                handle={handle}
                path="type"
                options={DISCOUNT_TYPE_OPTIONS}
                placeholder="Select type"
              />
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <TextEditor handle={handle} path="amount" placeholder="10" type="number" min={0} />
            </div>
            <div className="space-y-2">
              <Label>Minimum Subtotal (BDT)</Label>
              <TextEditor handle={handle} path="minSubtotal" placeholder="0" type="number" min={0} />
            </div>
            <div className="space-y-2">
              <Label>Max Discount (BDT)</Label>
              <TextEditor handle={handle} path="maxDiscount" placeholder="0" type="number" min={0} />
            </div>
            <div className="space-y-2">
              <Label>Starts At (ISO)</Label>
              <TextEditor handle={handle} path="startsAt" placeholder="2025-01-01T00:00:00Z" />
            </div>
            <div className="space-y-2">
              <Label>Ends At (ISO)</Label>
              <TextEditor handle={handle} path="endsAt" placeholder="2025-12-31T23:59:59Z" />
            </div>
            <div className="space-y-2">
              <Label>Max Uses</Label>
              <TextEditor handle={handle} path="maxUses" placeholder="0" type="number" min={0} />
            </div>
            <div className="space-y-2">
              <Label>Used Count</Label>
              <TextEditor handle={handle} path="usedCount" placeholder="0" type="number" min={0} />
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="space-y-2">
            <Label>Active</Label>
            <ToggleEditor handle={handle} path="active" />
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href="/checkout">Preview checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function DiscountDetailSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-[420px] w-full" />
    </div>
  );
}

export default function DiscountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const handle: DocumentHandle = {
    documentId: id,
    documentType: "discount",
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <Link
        href="/admin/discounts"
        className="text-sm text-zinc-500 hover:text-primary"
      >
        <span className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to discounts
        </span>
      </Link>
      <Suspense fallback={<DiscountDetailSkeleton />}>
        <DiscountDetailContent handle={handle} />
      </Suspense>
    </div>
  );
}
