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
import { formatPackageLocation, formatPackageTier } from "@/lib/utils/subscriptions";

const LOCATION_OPTIONS = [
  { label: "Bashundhara Sports City", value: "bashundhara-sports-city" },
  { label: "Bashundhara City Shopping Mall", value: "bashundhara-city-shopping-mall" },
];

const TIER_OPTIONS = [
  { label: "Gold", value: "gold" },
  { label: "Silver", value: "silver" },
  { label: "Pool & Spa", value: "pool-spa" },
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

function FeaturedEditor(handle: DocumentHandle) {
  const { data } = useDocument({ ...handle, path: "featured" });
  const edit = useEditDocument({ ...handle, path: "featured" });
  return (
    <Switch checked={(data as boolean) ?? false} onCheckedChange={edit} />
  );
}

function PackageDetailContent({ handle }: { handle: DocumentHandle }) {
  const { data: title } = useDocument({ ...handle, path: "title" });
  const { data: location } = useDocument({ ...handle, path: "location" });
  const { data: tier } = useDocument({ ...handle, path: "tier" });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
            {(title as string) || "New Package"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {formatPackageLocation(location as string)} •{" "}
            {formatPackageTier(tier as string)}
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
              <Label>Package Title</Label>
              <TextEditor handle={handle} path="title" placeholder="Gold 1 Month" />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <TextEditor handle={handle} path="slug.current" placeholder="gold-1-month" />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <SelectEditor
                handle={handle}
                path="location"
                options={LOCATION_OPTIONS}
                placeholder="Select location"
              />
            </div>
            <div className="space-y-2">
              <Label>Tier</Label>
              <SelectEditor
                handle={handle}
                path="tier"
                options={TIER_OPTIONS}
                placeholder="Select tier"
              />
            </div>
            <div className="space-y-2">
              <Label>Duration Label</Label>
              <TextEditor handle={handle} path="durationLabel" placeholder="1 Month" />
            </div>
            <div className="space-y-2">
              <Label>Duration (months)</Label>
              <TextEditor handle={handle} path="durationMonths" placeholder="1" type="number" min={1} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Access Label</Label>
              <TextEditor
                handle={handle}
                path="accessLabel"
                placeholder="Gym, Spa & Pool Access"
              />
            </div>
            <div className="space-y-2">
              <Label>Package Price (BDT)</Label>
              <TextEditor handle={handle} path="packagePrice" placeholder="30000" type="number" min={0} />
            </div>
            <div className="space-y-2">
              <Label>Offer Price (BDT)</Label>
              <TextEditor handle={handle} path="offerPrice" placeholder="16500" type="number" min={0} />
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="space-y-2">
            <Label>Display Order</Label>
            <TextEditor handle={handle} path="order" placeholder="0" type="number" min={0} />
          </div>
          <div className="space-y-2">
            <Label>Featured</Label>
            <FeaturedEditor {...handle} />
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href="/packages">Preview on site</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function PackageDetailSkeleton() {
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

export default function PackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const handle: DocumentHandle = {
    documentId: id,
    documentType: "subscriptionPackage",
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <Link href="/admin/packages" className="text-sm text-zinc-500 hover:text-primary">
        <span className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to packages
        </span>
      </Link>
      <Suspense fallback={<PackageDetailSkeleton />}>
        <PackageDetailContent handle={handle} />
      </Suspense>
    </div>
  );
}
