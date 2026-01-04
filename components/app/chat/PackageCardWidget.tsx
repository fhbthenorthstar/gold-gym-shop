import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { SearchPackage } from "@/lib/ai/types";

interface PackageCardWidgetProps {
  packageItem: SearchPackage;
  onClose: () => void;
}

export function PackageCardWidget({
  packageItem,
  onClose,
}: PackageCardWidgetProps) {
  const handleClick = () => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      onClose();
    }
  };

  const cardContent = (
    <>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-primary">
        <CalendarDays className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="block truncate text-sm font-medium text-white transition-colors duration-200 group-hover:text-primary/90">
              {packageItem.title ?? "Membership Package"}
            </span>
            <span className="text-xs text-zinc-400">
              {packageItem.locationLabel} • {packageItem.tierLabel}
            </span>
          </div>
          <span className="shrink-0 text-sm font-semibold text-white">
            {packageItem.priceFormatted}
          </span>
        </div>
        <span className="mt-1 block text-xs text-zinc-500">
          {packageItem.durationLabel ?? "Flexible"} • {packageItem.accessLabel ?? "Full access"}
        </span>
      </div>
    </>
  );

  const cardClasses =
    "group flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3 transition-all duration-200 hover:border-primary/60 hover:shadow-[0_12px_30px_rgba(253,233,21,0.12)]";

  if (packageItem.packageUrl) {
    return (
      <Link
        href={packageItem.packageUrl}
        onClick={handleClick}
        className={cardClasses}
      >
        {cardContent}
      </Link>
    );
  }

  return <div className={cardClasses}>{cardContent}</div>;
}
