"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  useDocuments,
  useApplyDocumentActions,
  createDocumentHandle,
  createDocument,
} from "@sanity/sdk-react";
import { Activity, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody } from "@/components/ui/table";
import {
  AdminSearch,
  TrainingRow,
  TrainingRowSkeleton,
  TrainingTableHeader,
  useTrainingSearchFilter,
} from "@/components/admin";

interface TrainingListContentProps {
  filter?: string;
  onCreateTraining: () => void;
  isCreating: boolean;
}

function TrainingListContent({
  filter,
  onCreateTraining,
  isCreating,
}: TrainingListContentProps) {
  const {
    data: trainings,
    hasMore,
    loadMore,
    isPending,
  } = useDocuments({
    documentType: "training",
    filter,
    orderings: [
      { field: "order", direction: "asc" },
      { field: "title", direction: "asc" },
    ],
    batchSize: 20,
  });

  if (!trainings || trainings.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title={filter ? "No trainings found" : "No trainings yet"}
        description={
          filter
            ? "Try adjusting your search terms."
            : "Add training categories to highlight on the homepage."
        }
        action={
          !filter
            ? {
                label: "Add Training",
                onClick: onCreateTraining,
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
          <TrainingTableHeader />
          <TableBody>
            {trainings.map((handle) => (
              <TrainingRow key={handle.documentId} {...handle} />
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

function TrainingListSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <Table>
        <TrainingTableHeader />
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TrainingRowSkeleton key={i} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function TrainingsAdminPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const { filter, isSearching } = useTrainingSearchFilter(searchQuery);
  const apply = useApplyDocumentActions();

  const handleCreateTraining = () => {
    startTransition(async () => {
      const newDocHandle = createDocumentHandle({
        documentId: crypto.randomUUID(),
        documentType: "training",
      });
      await apply(createDocument(newDocHandle));
      router.push(`/admin/trainings/${newDocHandle.documentId}`);
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Trainings
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
            Manage the training categories shown on the homepage.
          </p>
        </div>
        <Button
          onClick={handleCreateTraining}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          New Training
        </Button>
      </div>

      <AdminSearch
        placeholder="Search trainings..."
        value={searchQuery}
        onChange={setSearchQuery}
        className="w-full sm:max-w-sm"
      />

      {isSearching ? (
        <TrainingListSkeleton />
      ) : (
        <Suspense fallback={<TrainingListSkeleton />}>
          <TrainingListContent
            filter={filter}
            onCreateTraining={handleCreateTraining}
            isCreating={isPending}
          />
        </Suspense>
      )}
    </div>
  );
}
