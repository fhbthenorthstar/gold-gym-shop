"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type HomeTestimonialItem = {
  _id?: string;
  name?: string | null;
  role?: string | null;
  quote?: string | null;
  rating?: number | null;
  avatar?: {
    asset?: {
      url?: string | null;
    } | null;
  } | null;
};

const getSafeIndex = (index: number, total: number) =>
  ((index % total) + total) % total;

export function HomeTestimonials({ items }: { items: HomeTestimonialItem[] }) {
  const filtered = useMemo(
    () => items.filter((item) => item?.name && item?.quote),
    [items]
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const timeoutsRef = useRef<number[]>([]);
  const total = filtered.length;

  if (total === 0) {
    return null;
  }

  const clearQueuedTimeouts = () => {
    timeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    timeoutsRef.current = [];
  };

  const goToIndex = useCallback(
    (nextIndex: number) => {
      if (isAnimating || total < 2) return;
      const normalized = getSafeIndex(nextIndex, total);
      if (normalized === activeIndex) return;

      clearQueuedTimeouts();
      setDirection(normalized > activeIndex ? 1 : -1);
      setIsAnimating(true);

      const outId = window.setTimeout(() => {
        setActiveIndex(normalized);
        const inId = window.setTimeout(() => {
          setIsAnimating(false);
        }, 60);
        timeoutsRef.current.push(inId);
      }, 450);

      timeoutsRef.current.push(outId);
    },
    [activeIndex, isAnimating, total]
  );

  useEffect(() => {
    if (total < 2) return;
    const timeoutId = window.setTimeout(() => {
      goToIndex(activeIndex + 1);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [activeIndex, goToIndex, total]);

  useEffect(() => {
    return () => clearQueuedTimeouts();
  }, []);

  const active = filtered[getSafeIndex(activeIndex, total)];
  const prev = filtered[getSafeIndex(activeIndex - 1, total)];
  const next = filtered[getSafeIndex(activeIndex + 1, total)];
  const activeRating = Math.max(0, Math.min(active?.rating ?? 5, 5));
  const transitionClass = isAnimating
    ? direction === 1
      ? "opacity-0 translate-x-6"
      : "opacity-0 -translate-x-6"
    : "opacity-100 translate-x-0";

  return (
    <section className="py-10">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-lime-300">
          Real stories | Real progress | Real results.
        </p>
        <h2 className="font-heading mt-3 text-2xl text-white sm:text-3xl">
          What Our Members Say
        </h2>
        <div className="relative mt-12 rounded-3xl border border-zinc-800 bg-black/40 px-6 py-12 sm:px-12">
          <button
            type="button"
            onClick={() => goToIndex(activeIndex - 1)}
            className="absolute left-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-lime-300/40 bg-black/60 p-2 text-lime-300 transition hover:border-lime-200 hover:text-lime-200 sm:flex"
            aria-label="Previous testimonial"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goToIndex(activeIndex + 1)}
            className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-lime-300/40 bg-black/60 p-2 text-lime-300 transition hover:border-lime-200 hover:text-lime-200 sm:flex"
            aria-label="Next testimonial"
          >
            <ArrowRight className="h-5 w-5" />
          </button>

          <div
            className={cn(
              "transition-all duration-500 ease-in-out",
              transitionClass
            )}
          >
            <div className="flex items-center justify-center gap-6">
              {[prev, active, next].map((item, index) => {
                const isActive = index === 1;
                const imageUrl = item?.avatar?.asset?.url ?? null;
                return (
                  <div
                    key={item?._id ?? `${item?.name ?? "testimonial"}-${index}`}
                    className={cn(
                      "relative overflow-hidden rounded-full border border-zinc-800 bg-zinc-900",
                      isActive
                        ? "h-24 w-24 sm:h-28 sm:w-28"
                        : "h-14 w-14 sm:h-16 sm:w-16"
                    )}
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item?.name ?? "Testimonial"}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                        No photo
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-xs uppercase tracking-[0.4em] text-zinc-400">
              {active?.name ?? "Customer"}
              {active?.role ? ` - ${active.role}` : ""}
            </div>
            <div className="mt-3 flex items-center justify-center gap-1 text-lime-300">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={cn(
                    "h-4 w-4",
                    index < activeRating ? "fill-lime-300" : "text-zinc-700"
                  )}
                />
              ))}
            </div>
            {active?.quote && (
              <p className="mx-auto mt-5 max-w-3xl text-sm text-zinc-300">
                "{active.quote}"
              </p>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-4 sm:hidden">
            <button
              type="button"
              onClick={() => goToIndex(activeIndex - 1)}
              className="inline-flex items-center justify-center rounded-full border border-lime-300/40 bg-black/60 p-2 text-lime-300 transition hover:border-lime-200 hover:text-lime-200"
              aria-label="Previous testimonial"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goToIndex(activeIndex + 1)}
              className="inline-flex items-center justify-center rounded-full border border-lime-300/40 bg-black/60 p-2 text-lime-300 transition hover:border-lime-200 hover:text-lime-200"
              aria-label="Next testimonial"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
