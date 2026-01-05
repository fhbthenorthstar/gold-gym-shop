"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  useDocuments,
  useApplyDocumentActions,
  createDocumentHandle,
  createDocument,
} from "@sanity/sdk-react";
import { Plus, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody } from "@/components/ui/table";
import {
  DiscountRow,
  DiscountRowSkeleton,
  AdminSearch,
  useDiscountSearchFilter,
  DiscountTableHeader,
} from "@/components/admin";

interface DiscountListContentProps {
  filter?: string;
  onCreateDiscount: () => void;
  isCreating: boolean;
}

function DiscountListContent({
  filter,
  onCreateDiscount,
  isCreating,
}: DiscountListContentProps) {
  const {
    data: discounts,
    hasMore,
    loadMore,
    isPending,
  } = useDocuments({
    documentType: "discount",
    filter,
    orderings: [{ field: "title", direction: "asc" }],
    batchSize: 20,
  });

  if (!discounts || discounts.length === 0) {
    return (
      <EmptyState
        icon={Tag}
        title={filter ? "No discounts found" : "No discounts yet"}
        description={
          filter
            ? "Try adjusting your search terms."
            : "Create your first discount code to boost conversions."
        }
        action={
          !filter
            ? {
                label: "Add Discount",
                onClick: onCreateDiscount,
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
          <DiscountTableHeader />
          <TableBody>
            {discounts.map((handle) => (
              <DiscountRow key={handle.documentId} {...handle} />
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

function DiscountListSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <Table>
        <DiscountTableHeader />
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <DiscountRowSkeleton key={i} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function DiscountsAdminPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const { filter, isSearching } = useDiscountSearchFilter(searchQuery);
  const apply = useApplyDocumentActions();

  const handleCreateDiscount = () => {
    startTransition(async () => {
      const newDocHandle = createDocumentHandle({
        documentId: crypto.randomUUID(),
        documentType: "discount",
      });
      await apply(createDocument(newDocHandle));
      router.push(`/admin/discounts/${newDocHandle.documentId}`);
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Discounts
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
            Manage checkout discount codes and promotions.
          </p>
        </div>
        <Button
          onClick={handleCreateDiscount}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          New Discount
        </Button>
      </div>

      <AdminSearch
        placeholder="Search discounts..."
        value={searchQuery}
        onChange={setSearchQuery}
        className="w-full sm:max-w-sm"
      />

      {isSearching ? (
        <DiscountListSkeleton />
      ) : (
        <Suspense fallback={<DiscountListSkeleton />}>
          <DiscountListContent
            filter={filter}
            onCreateDiscount={handleCreateDiscount}
            isCreating={isPending}
          />
        </Suspense>
      )}
    </div>
  );
}
