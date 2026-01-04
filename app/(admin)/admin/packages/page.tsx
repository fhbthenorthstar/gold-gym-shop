"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  useDocuments,
  useApplyDocumentActions,
  createDocumentHandle,
  createDocument,
} from "@sanity/sdk-react";
import { Plus, Tags, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody } from "@/components/ui/table";
import {
  SubscriptionPackageRow,
  SubscriptionPackageRowSkeleton,
  AdminSearch,
  usePackageSearchFilter,
  PackageTableHeader,
} from "@/components/admin";

interface PackageListContentProps {
  filter?: string;
  onCreatePackage: () => void;
  isCreating: boolean;
}

function PackageListContent({
  filter,
  onCreatePackage,
  isCreating,
}: PackageListContentProps) {
  const {
    data: packages,
    hasMore,
    loadMore,
    isPending,
  } = useDocuments({
    documentType: "subscriptionPackage",
    filter,
    orderings: [
      { field: "location", direction: "asc" },
      { field: "tier", direction: "asc" },
      { field: "durationMonths", direction: "asc" },
    ],
    batchSize: 20,
  });

  if (!packages || packages.length === 0) {
    return (
      <EmptyState
        icon={Tags}
        title={filter ? "No packages found" : "No packages yet"}
        description={
          filter
            ? "Try adjusting your search terms."
            : "Get started by adding your first subscription package."
        }
        action={
          !filter
            ? {
                label: "Add Package",
                onClick: onCreatePackage,
                disabled: isCreating,
                icon: isCreating ? Loader2 : Plus,
              }
            : undefined
        }
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <Table>
          <PackageTableHeader />
          <TableBody>
            {packages.map((handle) => (
              <SubscriptionPackageRow key={handle.documentId} {...handle} />
            ))}
          </TableBody>
        </Table>
      </div>

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={() => loadMore()}
            disabled={isPending}
          >
            {isPending ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </>
  );
}

function PackageListSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <Table>
        <PackageTableHeader />
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <SubscriptionPackageRowSkeleton key={i} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function PackagesAdminPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const { filter, isSearching } = usePackageSearchFilter(searchQuery);
  const apply = useApplyDocumentActions();

  const handleCreatePackage = () => {
    startTransition(async () => {
      const newDocHandle = createDocumentHandle({
        documentId: crypto.randomUUID(),
        documentType: "subscriptionPackage",
      });
      await apply(createDocument(newDocHandle));
      router.push(`/admin/packages/${newDocHandle.documentId}`);
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Packages
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
            Manage membership packages and pricing.
          </p>
        </div>
        <Button
          onClick={handleCreatePackage}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          New Package
        </Button>
      </div>

      <AdminSearch
        placeholder="Search packages..."
        value={searchQuery}
        onChange={setSearchQuery}
        className="w-full sm:max-w-sm"
      />

      {isSearching ? (
        <PackageListSkeleton />
      ) : (
        <Suspense fallback={<PackageListSkeleton />}>
          <PackageListContent
            filter={filter}
            onCreatePackage={handleCreatePackage}
            isCreating={isPending}
          />
        </Suspense>
      )}
    </div>
  );
}
