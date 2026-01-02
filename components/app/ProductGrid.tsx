import { PackageSearch } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { ProductListItem } from "./ProductListItem";
import { EmptyState } from "@/components/ui/empty-state";
import type { FILTER_PRODUCTS_BY_BEST_SELLING_QUERYResult } from "@/sanity.types";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: FILTER_PRODUCTS_BY_BEST_SELLING_QUERYResult;
  view: "grid" | "list";
  columns: 2 | 3 | 4;
}

export function ProductGrid({ products, view, columns }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="min-h-[400px] rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-950/50">
        <EmptyState
          icon={PackageSearch}
          title="No products found"
          description="Try adjusting your search or filters to find what you're looking for"
          size="lg"
        />
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="space-y-6">
        {products.map((product) => (
          <ProductListItem key={product._id} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div className="@container">
      <div
        className={cn(
          "grid gap-6 @md:gap-8",
          columns === 2 && "grid-cols-1 @md:grid-cols-2",
          columns === 3 && "grid-cols-1 @md:grid-cols-2 @xl:grid-cols-3",
          columns === 4 &&
            "grid-cols-1 @md:grid-cols-2 @xl:grid-cols-3 @6xl:grid-cols-4"
        )}
      >
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
