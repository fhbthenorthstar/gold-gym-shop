"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  useDocuments,
  useApplyDocumentActions,
  createDocumentHandle,
  createDocument,
} from "@sanity/sdk-react";
import { CalendarCheck, Plus, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  AdminSearch,
  SubscriptionRow,
  SubscriptionRowSkeleton,
  SubscriptionTableHeader,
  useSubscriptionSearchFilter,
} from "@/components/admin";
import {
  SUBSCRIPTION_STATUS_TABS,
  type SubscriptionStatusValue,
} from "@/lib/constants/subscriptionStatus";

interface SubscriptionListContentProps {
  statusFilter: "all" | SubscriptionStatusValue;
  searchFilter?: string;
}

function SubscriptionListContent({
  statusFilter,
  searchFilter,
}: SubscriptionListContentProps) {
  const filters: string[] = [];
  if (statusFilter !== "all") {
    filters.push(`status == "${statusFilter}"`);
  }
  if (searchFilter) {
    filters.push(`(${searchFilter})`);
  }
  const filter = filters.length > 0 ? filters.join(" && ") : undefined;

  const {
    data: subscriptions,
    hasMore,
    loadMore,
    isPending,
  } = useDocuments({
    documentType: "subscription",
    filter,
    orderings: [{ field: "_createdAt", direction: "desc" }],
    batchSize: 20,
  });

  if (!subscriptions || subscriptions.length === 0) {
    const description = searchFilter
      ? "Try adjusting your search terms."
      : statusFilter === "all"
        ? "New subscriptions will appear here."
        : `No ${statusFilter} subscriptions right now.`;

    return (
      <EmptyState
        icon={CalendarCheck}
        title="No subscriptions"
        description={description}
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <Table>
          <SubscriptionTableHeader />
          <TableBody>
            {subscriptions.map((handle) => (
              <SubscriptionRow key={handle.documentId} {...handle} />
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

function SubscriptionListSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <Table>
        <SubscriptionTableHeader />
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <SubscriptionRowSkeleton key={i} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function SubscriptionsAdminPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<
    "all" | SubscriptionStatusValue
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { filter: searchFilter, isSearching } =
    useSubscriptionSearchFilter(searchQuery);
  const [isPending, startTransition] = useTransition();
  const apply = useApplyDocumentActions();

  const handleCreateSubscription = () => {
    startTransition(async () => {
      const newDocHandle = createDocumentHandle({
        documentId: crypto.randomUUID(),
        documentType: "subscription",
      });
      await apply(createDocument(newDocHandle));
      router.push(`/admin/subscriptions/${newDocHandle.documentId}`);
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Subscriptions
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
            Monitor member plans and update statuses.
          </p>
        </div>
        <Button
          onClick={handleCreateSubscription}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          New Subscription
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <AdminSearch
          placeholder="Search by member, phone, or ID..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full sm:max-w-sm"
        />
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <Tabs
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as "all" | SubscriptionStatusValue)
            }
          >
            <TabsList className="w-max">
              {SUBSCRIPTION_STATUS_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs sm:text-sm"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isSearching ? (
        <SubscriptionListSkeleton />
      ) : (
        <Suspense
          key={`${statusFilter}-${searchFilter ?? ""}`}
          fallback={<SubscriptionListSkeleton />}
        >
          <SubscriptionListContent
            statusFilter={statusFilter}
            searchFilter={searchFilter}
          />
        </Suspense>
      )}
    </div>
  );
}
