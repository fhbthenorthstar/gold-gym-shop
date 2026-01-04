import { Search, Package, CheckCircle2, Loader2, CalendarDays } from "lucide-react";
import type { ToolCallPart } from "./types";
import type { SearchProductsResult, SearchPackagesResult } from "@/lib/ai/types";
import type { GetMyOrdersResult } from "@/lib/ai/tools/get-my-orders";
import type { GetMySubscriptionsResult } from "@/lib/ai/types";
import { getToolDisplayName } from "./utils";
import { ProductCardWidget } from "./ProductCardWidget";
import { OrderCardWidget } from "./OrderCardWidget";
import { PackageCardWidget } from "./PackageCardWidget";
import { SubscriptionCardWidget } from "./SubscriptionCardWidget";

interface ToolCallUIProps {
  toolPart: ToolCallPart;
  closeChat: () => void;
}

export function ToolCallUI({ toolPart, closeChat }: ToolCallUIProps) {
  const toolName = toolPart.toolName || toolPart.type.replace("tool-", "");
  const displayName = getToolDisplayName(toolName);

  // Check for completion
  const isComplete =
    toolPart.state === "result" ||
    toolPart.result !== undefined ||
    toolPart.output !== undefined;

  const searchQuery =
    toolName === "searchProducts" && toolPart.args?.query
      ? String(toolPart.args.query)
      : undefined;

  const packageQuery =
    toolName === "searchPackages" && toolPart.args?.query
      ? String(toolPart.args.query)
      : undefined;

  const orderStatus =
    toolName === "getMyOrders" && toolPart.args?.status
      ? String(toolPart.args.status)
      : undefined;

  // Get results based on tool type
  const result = toolPart.result || toolPart.output;
  const productResult = result as SearchProductsResult | undefined;
  const orderResult = result as GetMyOrdersResult | undefined;
  const packageResult = result as SearchPackagesResult | undefined;
  const subscriptionResult = result as GetMySubscriptionsResult | undefined;

  const hasProducts =
    toolName === "searchProducts" &&
    productResult?.found &&
    productResult.products &&
    productResult.products.length > 0;

  const hasPackages =
    toolName === "searchPackages" &&
    packageResult?.found &&
    packageResult.packages &&
    packageResult.packages.length > 0;

  const hasOrders =
    toolName === "getMyOrders" &&
    orderResult?.found &&
    orderResult.orders &&
    orderResult.orders.length > 0;

  const hasSubscriptions =
    toolName === "getMySubscriptions" &&
    subscriptionResult?.found &&
    subscriptionResult.subscriptions &&
    subscriptionResult.subscriptions.length > 0;

  // Determine icon based on tool type
  const ToolIcon =
    toolName === "getMyOrders"
      ? Package
      : toolName === "getMySubscriptions"
        ? CalendarDays
        : Search;

  return (
    <div className="space-y-2">
      {/* Tool status indicator */}
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800">
          <ToolIcon className="h-4 w-4 text-primary" />
        </div>
        <div
          className={`flex items-center gap-3 rounded-xl px-4 py-2 text-sm ${
            isComplete
              ? "border border-primary/30 bg-primary/10"
              : "border border-zinc-800 bg-zinc-900"
          }`}
        >
          {isComplete ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
          ) : (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-zinc-400" />
          )}
          <div className="flex flex-col">
            <span
              className={`font-medium ${
                isComplete
                  ? "text-primary/90"
                  : "text-zinc-300"
              }`}
            >
              {isComplete ? `${displayName} complete` : `${displayName}...`}
            </span>
            {searchQuery && (
              <span className="text-xs text-zinc-500">
                Query: &quot;{searchQuery}&quot;
              </span>
            )}
            {packageQuery && (
              <span className="text-xs text-zinc-500">
                Query: &quot;{packageQuery}&quot;
              </span>
            )}
            {orderStatus && (
              <span className="text-xs text-zinc-500">
                Filter: {orderStatus}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Product results */}
      {hasProducts && productResult?.products && (
        <div className="ml-11 mt-2">
          <p className="mb-2 text-xs text-zinc-500">
            {productResult.products.length} product
            {productResult.products.length !== 1 ? "s" : ""} found
          </p>
          <div className="space-y-2">
            {productResult.products.map((product) => (
              <ProductCardWidget
                key={product.id}
                product={product}
                onClose={closeChat}
              />
            ))}
          </div>
        </div>
      )}

      {/* Package results */}
      {hasPackages && packageResult?.packages && (
        <div className="ml-11 mt-2">
          <p className="mb-2 text-xs text-zinc-500">
            {packageResult.packages.length} package
            {packageResult.packages.length !== 1 ? "s" : ""} found
          </p>
          <div className="space-y-2">
            {packageResult.packages.map((pkg) => (
              <PackageCardWidget
                key={pkg.id}
                packageItem={pkg}
                onClose={closeChat}
              />
            ))}
          </div>
        </div>
      )}

      {/* Order results */}
      {hasOrders && orderResult?.orders && (
        <div className="ml-11 mt-2">
          <p className="mb-2 text-xs text-zinc-500">
            {orderResult.orders.length} order
            {orderResult.orders.length !== 1 ? "s" : ""} found
          </p>
          <div className="space-y-2">
            {orderResult.orders.map((order) => (
              <OrderCardWidget
                key={order.id}
                order={order}
                onClose={closeChat}
              />
            ))}
          </div>
        </div>
      )}

      {/* Subscription results */}
      {hasSubscriptions && subscriptionResult?.subscriptions && (
        <div className="ml-11 mt-2">
          <p className="mb-2 text-xs text-zinc-500">
            {subscriptionResult.subscriptions.length} membership
            {subscriptionResult.subscriptions.length !== 1 ? "s" : ""} found
          </p>
          <div className="space-y-2">
            {subscriptionResult.subscriptions.map((subscription) => (
              <SubscriptionCardWidget
                key={subscription.id}
                subscription={subscription}
                onClose={closeChat}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
