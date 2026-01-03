import { Search, Package, CheckCircle2, Loader2 } from "lucide-react";
import type { ToolCallPart } from "./types";
import type { SearchProductsResult } from "@/lib/ai/types";
import type { GetMyOrdersResult } from "@/lib/ai/tools/get-my-orders";
import { getToolDisplayName } from "./utils";
import { ProductCardWidget } from "./ProductCardWidget";
import { OrderCardWidget } from "./OrderCardWidget";

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

  const orderStatus =
    toolName === "getMyOrders" && toolPart.args?.status
      ? String(toolPart.args.status)
      : undefined;

  // Get results based on tool type
  const result = toolPart.result || toolPart.output;
  const productResult = result as SearchProductsResult | undefined;
  const orderResult = result as GetMyOrdersResult | undefined;

  const hasProducts =
    toolName === "searchProducts" &&
    productResult?.found &&
    productResult.products &&
    productResult.products.length > 0;

  const hasOrders =
    toolName === "getMyOrders" &&
    orderResult?.found &&
    orderResult.orders &&
    orderResult.orders.length > 0;

  // Determine icon based on tool type
  const ToolIcon = toolName === "getMyOrders" ? Package : Search;

  return (
    <div className="space-y-2">
      {/* Tool status indicator */}
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800">
          <ToolIcon className="h-4 w-4 text-lime-300" />
        </div>
        <div
          className={`flex items-center gap-3 rounded-xl px-4 py-2 text-sm ${
            isComplete
              ? "border border-lime-300/30 bg-lime-300/10"
              : "border border-zinc-800 bg-zinc-900"
          }`}
        >
          {isComplete ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-lime-300" />
          ) : (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-zinc-400" />
          )}
          <div className="flex flex-col">
            <span
              className={`font-medium ${
                isComplete
                  ? "text-lime-200"
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
    </div>
  );
}
