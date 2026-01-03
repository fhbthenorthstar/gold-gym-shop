"use client";

import { Suspense, useState } from "react";
import { useDocuments } from "@sanity/sdk-react";
import { MessageSquare } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  AdminSearch,
  ContactRow,
  ContactRowSkeleton,
  ContactTableHeader,
  useContactSearchFilter,
} from "@/components/admin";
import {
  CONTACT_STATUS_TABS,
  type ContactStatusValue,
} from "@/lib/constants/contactStatus";

interface ContactListContentProps {
  statusFilter: "all" | ContactStatusValue;
  searchFilter?: string;
}

function ContactListContent({
  statusFilter,
  searchFilter,
}: ContactListContentProps) {
  const filters: string[] = [];
  if (statusFilter !== "all") {
    filters.push(`status == "${statusFilter}"`);
  }
  if (searchFilter) {
    filters.push(`(${searchFilter})`);
  }
  const filter = filters.length > 0 ? filters.join(" && ") : undefined;

  const {
    data: contacts,
    hasMore,
    loadMore,
    isPending,
  } = useDocuments({
    documentType: "contactMessage",
    filter,
    orderings: [{ field: "_createdAt", direction: "desc" }],
    batchSize: 20,
  });

  if (!contacts || contacts.length === 0) {
    const description = searchFilter
      ? "Try adjusting your search terms."
      : statusFilter === "all"
        ? "New contact requests will appear here."
        : `No ${statusFilter} contact requests right now.`;

    return (
      <EmptyState
        icon={MessageSquare}
        title="No contact requests"
        description={description}
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <Table>
          <ContactTableHeader />
          <TableBody>
            {contacts.map((handle) => (
              <ContactRow key={handle.documentId} {...handle} />
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

function ContactListSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <Table>
        <ContactTableHeader />
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <ContactRowSkeleton key={i} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function ContactAdminPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | ContactStatusValue>(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const { filter: searchFilter, isSearching } =
    useContactSearchFilter(searchQuery);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Contact Form
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
          Review and respond to customer contact requests.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <AdminSearch
          placeholder="Search by name, phone, or comment..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full sm:max-w-sm"
        />
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <Tabs
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as "all" | ContactStatusValue)
            }
          >
            <TabsList className="w-max">
              {CONTACT_STATUS_TABS.map((tab) => (
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
        <ContactListSkeleton />
      ) : (
        <Suspense
          key={`${statusFilter}-${searchFilter ?? ""}`}
          fallback={<ContactListSkeleton />}
        >
          <ContactListContent
            statusFilter={statusFilter}
            searchFilter={searchFilter}
          />
        </Suspense>
      )}
    </div>
  );
}
