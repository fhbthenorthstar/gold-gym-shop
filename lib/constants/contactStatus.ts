import { CheckCircle2, Clock } from "lucide-react";

export type ContactStatusValue = "pending" | "resolved";

export const CONTACT_STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
} as const;

export const CONTACT_STATUS_TABS: Array<{
  value: "all" | ContactStatusValue;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
];
