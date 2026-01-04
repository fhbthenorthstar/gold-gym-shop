"use client";

import { Suspense } from "react";
import {
  useDocument,
  useEditDocument,
  useApplyDocumentActions,
  publishDocument,
  type DocumentHandle,
} from "@sanity/sdk-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SUBSCRIPTION_STATUS_CONFIG,
  getSubscriptionStatus,
  type SubscriptionStatusValue,
} from "@/lib/constants/subscriptionStatus";

interface SubscriptionStatusSelectProps extends DocumentHandle {}

function SubscriptionStatusSelectContent(handle: SubscriptionStatusSelectProps) {
  const { data: status } = useDocument({ ...handle, path: "status" });
  const editStatus = useEditDocument({ ...handle, path: "status" });
  const apply = useApplyDocumentActions();

  const currentStatus = (status as SubscriptionStatusValue) ?? "pending";
  const statusConfig = getSubscriptionStatus(currentStatus);
  const StatusIcon = statusConfig.icon;

  const handleStatusChange = async (value: string) => {
    editStatus(value);
    await apply(publishDocument(handle));
  };

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[180px] border-zinc-800 bg-zinc-950/70 text-zinc-100">
        <SelectValue>
          <div className="flex items-center gap-2">
            <StatusIcon className="h-4 w-4" />
            {statusConfig.label}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="border-zinc-800 bg-zinc-950 text-zinc-100">
        {Object.entries(SUBSCRIPTION_STATUS_CONFIG).map(([value, config]) => {
          const Icon = config.icon;
          return (
            <SelectItem key={value} value={value}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {config.label}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

function SubscriptionStatusSelectSkeleton() {
  return <Skeleton className="h-10 w-[180px]" />;
}

export function SubscriptionStatusSelect(
  props: SubscriptionStatusSelectProps
) {
  return (
    <Suspense fallback={<SubscriptionStatusSelectSkeleton />}>
      <SubscriptionStatusSelectContent {...props} />
    </Suspense>
  );
}
