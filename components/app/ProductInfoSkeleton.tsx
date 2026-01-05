import { Skeleton } from "@/components/ui/skeleton";

export function ProductInfoSkeleton() {
  return (
    <div className="flex flex-col space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16 bg-primary/15" />
        <Skeleton className="h-4 w-4 bg-primary/15" />
        <Skeleton className="h-4 w-24 bg-primary/15" />
      </div>

      {/* Title */}
      <Skeleton className="h-9 w-3/4 bg-primary/15" />

      {/* Price */}
      <Skeleton className="h-8 w-28 bg-primary/15" />

      {/* Description */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full bg-primary/15" />
        <Skeleton className="h-4 w-full bg-primary/15" />
        <Skeleton className="h-4 w-2/3 bg-primary/15" />
      </div>

      {/* Stock Badge */}
      <Skeleton className="h-6 w-20 bg-primary/15" />

      {/* Product Details */}
      <div className="space-y-3 border-t border-zinc-800 pt-6">
        <Skeleton className="h-5 w-32 bg-primary/15" />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Skeleton className="h-4 w-16 bg-primary/15" />
            <Skeleton className="h-4 w-24 bg-primary/15" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-16 bg-primary/15" />
            <Skeleton className="h-4 w-24 bg-primary/15" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-16 bg-primary/15" />
            <Skeleton className="h-4 w-24 bg-primary/15" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-16 bg-primary/15" />
            <Skeleton className="h-4 w-24 bg-primary/15" />
          </div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <Skeleton className="h-12 w-full bg-primary/20" />

      {/* AI Similar Button */}
      <Skeleton className="h-10 w-full bg-primary/15" />
    </div>
  );
}
