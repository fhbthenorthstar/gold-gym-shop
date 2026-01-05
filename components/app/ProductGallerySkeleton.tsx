import { Skeleton } from "@/components/ui/skeleton";

export function ProductGallerySkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <Skeleton className="aspect-square w-full rounded-lg border border-primary/20 bg-primary/15" />
      
      {/* Thumbnail Gallery */}
      <div className="flex gap-2 overflow-x-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-20 w-20 shrink-0 rounded-md border border-primary/20 bg-primary/15"
          />
        ))}
      </div>
    </div>
  );
}
