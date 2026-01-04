"use client";

import { Suspense, use, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useDocument,
  useEditDocument,
  useDocumentProjection,
  useClient,
  type DocumentHandle,
} from "@sanity/sdk-react";
import { ArrowLeft, ExternalLink, Loader2, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { DeleteButton, PublishButton, RevertButton } from "@/components/admin";

interface TrainingImageProjection {
  image: {
    asset: {
      url: string;
    } | null;
  } | null;
}

function TitleEditor(handle: DocumentHandle) {
  const { data: title } = useDocument({ ...handle, path: "title" });
  const editTitle = useEditDocument({ ...handle, path: "title" });

  return (
    <Input
      value={(title as string) ?? ""}
      onChange={(event) => editTitle(event.target.value)}
      placeholder="Training title"
    />
  );
}

function LinkEditor(handle: DocumentHandle) {
  const { data: link } = useDocument({ ...handle, path: "link" });
  const editLink = useEditDocument({ ...handle, path: "link" });

  return (
    <Input
      value={(link as string) ?? ""}
      onChange={(event) => editLink(event.target.value)}
      placeholder="/shop"
    />
  );
}

function OrderEditor(handle: DocumentHandle) {
  const { data: order } = useDocument({ ...handle, path: "order" });
  const editOrder = useEditDocument({ ...handle, path: "order" });

  return (
    <Input
      type="number"
      min="0"
      value={(order as number) ?? 0}
      onChange={(event) => editOrder(Number(event.target.value) || 0)}
      placeholder="0"
    />
  );
}

function FeaturedEditor(handle: DocumentHandle) {
  const { data: featured } = useDocument({ ...handle, path: "featured" });
  const editFeatured = useEditDocument({ ...handle, path: "featured" });

  return (
    <Switch
      checked={(featured as boolean) ?? false}
      onCheckedChange={(checked) => editFeatured(checked)}
    />
  );
}

function TrainingImageEditor(handle: DocumentHandle) {
  const client = useClient({ apiVersion: "2024-01-01" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data } = useDocumentProjection<TrainingImageProjection>({
    ...handle,
    projection: `{
      "image": image{
        asset->{
          url
        }
      }
    }`,
  });
  const editImage = useEditDocument({ ...handle, path: "image" });

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const asset = await client.assets.upload("image", file, {
        filename: file.name,
      });

      editImage({
        _type: "image",
        asset: {
          _type: "reference",
          _ref: asset._id,
        },
      });
    } catch (error) {
      console.error("Failed to upload image:", error);
      setUploadError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    editImage(null);
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative h-56 w-full sm:h-64">
          {data?.image?.asset?.url ? (
            <Image
              src={data.image.asset.url}
              alt="Training image"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400">
              No image uploaded
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </>
          )}
        </Button>
        {data?.image?.asset?.url && (
          <Button type="button" variant="destructive" onClick={handleRemove}>
            <X className="mr-2 h-4 w-4" />
            Remove
          </Button>
        )}
      </div>
      {uploadError && (
        <p className="text-xs text-red-500">{uploadError}</p>
      )}
    </div>
  );
}

function TrainingDetailContent({ handle }: { handle: DocumentHandle }) {
  const { data: title } = useDocument({ ...handle, path: "title" });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
            {(title as string) || "New Training"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Edit training details
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

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
              Training Details
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Suspense fallback={<Skeleton className="h-10" />}>
                  <TitleEditor {...handle} />
                </Suspense>
              </div>
              <div className="space-y-2">
                <Label htmlFor="link">Link</Label>
                <Suspense fallback={<Skeleton className="h-10" />}>
                  <LinkEditor {...handle} />
                </Suspense>
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Order</Label>
                <Suspense fallback={<Skeleton className="h-10" />}>
                  <OrderEditor {...handle} />
                </Suspense>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    Featured
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Show in the homepage training grid.
                  </p>
                </div>
                <Suspense fallback={<Skeleton className="h-6 w-11" />}>
                  <FeaturedEditor {...handle} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
              Training Image
            </h2>
            <TrainingImageEditor {...handle} />
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Advanced Editing
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Manage additional fields in Sanity Studio.
            </p>
            <Link
              href={`/studio/structure/training;${handle.documentId}`}
              target="_blank"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
            >
              Open in Studio
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrainingDetailSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Skeleton className="h-7 w-48 sm:h-8" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-[140px]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TrainingDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const handle: DocumentHandle = {
    documentId: id,
    documentType: "training",
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Link
        href="/admin/trainings"
        className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Trainings
      </Link>

      <Suspense fallback={<TrainingDetailSkeleton />}>
        <TrainingDetailContent handle={handle} />
      </Suspense>
    </div>
  );
}
