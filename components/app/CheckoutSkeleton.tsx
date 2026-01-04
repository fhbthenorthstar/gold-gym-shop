import { Skeleton } from "@/components/ui/skeleton";

export function CheckoutSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="mt-4 h-9 w-32" />
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Cart Items */}
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950">
            <div className="border-b border-zinc-800 px-6 py-4">
              <Skeleton className="h-5 w-40" />
            </div>

            {/* Items List */}
            <div className="divide-y divide-zinc-800">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 px-6 py-4">
                  <Skeleton className="h-20 w-20 shrink-0 rounded-md" />
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Total & Checkout */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
            <Skeleton className="h-5 w-36" />

            <div className="mt-6 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="border-t border-zinc-800 pt-4">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>

            <Skeleton className="mt-6 h-12 w-full" />
            <Skeleton className="mx-auto mt-4 h-3 w-56" />
          </div>
        </div>
      </div>
    </div>
  );
}
