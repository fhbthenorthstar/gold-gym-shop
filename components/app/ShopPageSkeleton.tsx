import { Skeleton } from "@/components/ui/skeleton";
import { ProductFiltersSkeleton } from "@/components/app/ProductFiltersSkeleton";
import { ProductGridSkeleton } from "@/components/app/ProductGridSkeleton";

export function ShopPageSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      <section className="border-b border-zinc-800">
        <Skeleton className="h-44 w-full" />
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-72">
            <ProductFiltersSkeleton />
          </aside>
          <main className="flex-1">
            <div className="mb-6">
              <Skeleton className="h-4 w-40" />
            </div>
            <ProductGridSkeleton />
          </main>
        </div>
      </div>
    </div>
  );
}
