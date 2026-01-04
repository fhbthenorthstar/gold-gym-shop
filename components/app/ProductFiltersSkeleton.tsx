import { Skeleton } from "@/components/ui/skeleton";

export function ProductFiltersSkeleton() {
  return (
    <div className="space-y-6 rounded-lg border border-zinc-800 bg-zinc-950 p-6">
      {/* Search */}
      <div>
        <Skeleton className="mb-2 h-4 w-16" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      {/* Category */}
      <div>
        <Skeleton className="mb-2 h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Brand */}
      <div>
        <Skeleton className="mb-2 h-4 w-14" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Goals */}
      <div>
        <Skeleton className="mb-2 h-4 w-16" />
        <div className="space-y-2">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-4 w-full" />
          ))}
        </div>
      </div>

      {/* Sports */}
      <div>
        <Skeleton className="mb-2 h-4 w-14" />
        <div className="space-y-2">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-4 w-full" />
          ))}
        </div>
      </div>

      {/* Gender */}
      <div>
        <Skeleton className="mb-2 h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Options */}
      <div>
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="h-8 w-full" />
      </div>

      {/* Price Range */}
      <div>
        <Skeleton className="mb-2 h-4 w-32" />
        <Skeleton className="mt-4 h-2 w-full" />
      </div>

      {/* Sort */}
      <div>
        <Skeleton className="mb-2 h-4 w-14" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
