import Link from "next/link";
import type { OrderSummary } from "@/lib/ai/tools/get-my-orders";
import { getOrderStatus } from "@/lib/constants/orderStatus";
import { formatDate, formatOrderNumber } from "@/lib/utils";
import { StackedProductImages } from "@/components/app/StackedProductImages";

interface OrderCardWidgetProps {
  order: OrderSummary;
  onClose: () => void;
}

export function OrderCardWidget({ order, onClose }: OrderCardWidgetProps) {
  const config = getOrderStatus(order.status);

  const handleClick = () => {
    // Only close chat on mobile (< 768px)
    if (window.matchMedia("(max-width: 767px)").matches) {
      onClose();
    }
  };

  // Format date
  const formattedDate = order.createdAt
    ? formatDate(order.createdAt, "long")
    : null;

  // Truncate item names for display
  const displayItems =
    order.itemNames.length > 2
      ? `${order.itemNames.slice(0, 2).join(", ")} +${order.itemNames.length - 2} more`
      : order.itemNames.join(", ");

  const cardContent = (
    <>
      <StackedProductImages
        images={order.itemImages}
        totalCount={order.itemCount}
        size="sm"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="block truncate text-sm font-medium text-white transition-colors duration-200 group-hover:text-lime-200">
              Order #{formatOrderNumber(order.orderNumber)}
            </span>
            {displayItems && (
              <span className="block truncate text-xs text-zinc-400">
                {displayItems}
              </span>
            )}
          </div>
          {order.totalFormatted && (
            <span className="shrink-0 text-sm font-semibold text-white">
              {order.totalFormatted}
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${config.iconColor}`}
          >
            {order.statusDisplay}
          </span>
          {formattedDate && (
            <>
              <span className="text-zinc-500">•</span>
              <span className="text-xs text-zinc-500">
                {formattedDate}
              </span>
            </>
          )}
        </div>
      </div>
    </>
  );

  const cardClasses =
    "group flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3 transition-all duration-200 hover:border-lime-300/60 hover:shadow-[0_12px_30px_rgba(163,230,53,0.12)]";

  return (
    <Link href={order.orderUrl} onClick={handleClick} className={cardClasses}>
      {cardContent}
    </Link>
  );
}
