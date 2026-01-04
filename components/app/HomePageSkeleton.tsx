import { Skeleton } from "@/components/ui/skeleton";

export function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <section className="relative min-h-[70vh] border-b border-zinc-800">
        <Skeleton className="h-[70vh] w-full" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-4">
            <div className="max-w-xl space-y-4">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-10 w-72" />
              <Skeleton className="h-10 w-60" />
              <Skeleton className="h-4 w-80" />
              <div className="flex gap-3">
                <Skeleton className="h-10 w-32 rounded-full" />
                <Skeleton className="h-10 w-32 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trainings */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <Skeleton className="mx-auto h-3 w-40" />
            <Skeleton className="mx-auto mt-3 h-8 w-64" />
            <Skeleton className="mx-auto mt-2 h-4 w-72" />
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`training-skeleton-${index}`}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
              >
                <Skeleton className="h-52 w-full" />
                <div className="p-4">
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <Skeleton className="mx-auto h-3 w-32" />
            <Skeleton className="mx-auto mt-3 h-8 w-60" />
            <Skeleton className="mx-auto mt-2 h-4 w-72" />
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`product-skeleton-${index}`}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
              >
                <Skeleton className="aspect-[4/5] w-full" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-10 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offer */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr]">
            <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
              <Skeleton className="h-[360px] w-full sm:h-[420px] lg:h-[520px]" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-8 w-72" />
              <Skeleton className="h-4 w-80" />
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={`offer-bullet-${index}`} className="h-4 w-full" />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={`brand-${index}`} className="h-8 w-full" />
                ))}
              </div>
              <Skeleton className="h-11 w-40" />
            </div>
          </div>
        </div>
      </section>

      {/* Instagram */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={`insta-${index}`} className="h-40 w-40 shrink-0" />
            ))}
          </div>
        </div>
      </section>

      {/* Trainers */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <Skeleton className="mx-auto h-3 w-48" />
            <Skeleton className="mx-auto mt-3 h-8 w-56" />
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`trainer-skeleton-${index}`}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
              >
                <Skeleton className="h-56 w-full" />
                <div className="p-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-2 h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <Skeleton className="mx-auto h-6 w-64" />
          <Skeleton className="mx-auto mt-6 h-24 w-24 rounded-full" />
          <Skeleton className="mx-auto mt-4 h-4 w-48" />
          <Skeleton className="mx-auto mt-4 h-4 w-full" />
          <Skeleton className="mx-auto mt-2 h-4 w-5/6" />
        </div>
      </section>

      {/* Video */}
      <section className="border-t border-zinc-800">
        <Skeleton className="h-[360px] w-full sm:h-[460px] lg:h-[540px]" />
      </section>
    </div>
  );
}
