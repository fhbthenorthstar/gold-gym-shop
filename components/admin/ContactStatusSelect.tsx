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
  CONTACT_STATUS_CONFIG,
  type ContactStatusValue,
} from "@/lib/constants/contactStatus";

interface ContactStatusSelectProps extends DocumentHandle {}

function ContactStatusSelectContent(handle: ContactStatusSelectProps) {
  const { data: status } = useDocument({ ...handle, path: "status" });
  const editStatus = useEditDocument({ ...handle, path: "status" });
  const apply = useApplyDocumentActions();

  const currentStatus = (status as ContactStatusValue) ?? "pending";
  const statusConfig = CONTACT_STATUS_CONFIG[currentStatus];
  const StatusIcon = statusConfig.icon;

  const handleStatusChange = async (value: string) => {
    editStatus(value);
    await apply(publishDocument(handle));
  };

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="h-8 w-[140px] text-xs">
        <SelectValue>
          <div className="flex items-center gap-2">
            <StatusIcon className="h-3.5 w-3.5" />
            {statusConfig.label}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(CONTACT_STATUS_CONFIG) as ContactStatusValue[]).map(
          (value) => {
            const config = CONTACT_STATUS_CONFIG[value];
            const Icon = config.icon;
            return (
              <SelectItem key={value} value={value}>
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" />
                  {config.label}
                </div>
              </SelectItem>
            );
          }
        )}
      </SelectContent>
    </Select>
  );
}

function ContactStatusSelectSkeleton() {
  return <Skeleton className="h-8 w-[140px]" />;
}

export function ContactStatusSelect(props: ContactStatusSelectProps) {
  return (
    <Suspense fallback={<ContactStatusSelectSkeleton />}>
      <ContactStatusSelectContent {...props} />
    </Suspense>
  );
}
