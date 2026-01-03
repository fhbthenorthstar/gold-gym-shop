"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { cn } from "@/lib/utils";

type InstagramSlide = {
  id: string;
  imageUrl: string;
  link: string;
  caption?: string | null;
};

export function HomeInstagramSlider({
  items,
  profileUrl,
}: {
  items: InstagramSlide[];
  profileUrl: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const directionRef = useRef<1 | -1>(1);
  const rafRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const pauseUntilRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const speed = 1;

    const tick = () => {
      if (!track) return;
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (isDraggingRef.current || performance.now() < pauseUntilRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const current = track.scrollLeft;
      if (current >= maxScroll - 1) {
        directionRef.current = -1;
      } else if (current <= 1) {
        directionRef.current = 1;
      }

      const next = Math.min(
        Math.max(current + directionRef.current * speed, 0),
        maxScroll
      );
      track.scrollLeft = next;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    isDraggingRef.current = true;
    dragStartXRef.current = event.clientX;
    dragStartScrollRef.current = track.scrollLeft;
    track.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const track = trackRef.current;
    if (!track) return;
    const delta = event.clientX - dragStartXRef.current;
    track.scrollLeft = dragStartScrollRef.current - delta;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (track) {
      track.releasePointerCapture?.(event.pointerId);
    }
    isDraggingRef.current = false;
    pauseUntilRef.current = performance.now() + 1200;
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="py-0">
      <div className="w-full">
        <div className="relative">
          <div
            ref={trackRef}
            className="flex gap-0 overflow-x-auto scroll-smooth scrollbar-hide select-none touch-pan-y"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {items.map((item) => (
              <a
                key={item.id}
                href={item.link}
                className="group relative flex-none w-[80vw] sm:w-[45vw] lg:w-[20vw]"
              >
                <div className="relative overflow-hidden">
                  <div className="relative h-56 w-full sm:h-64 lg:h-72">
                    <Image
                      src={item.imageUrl}
                      alt={item.caption ?? "Instagram post"}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 60vw, 25vw"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Instagram className="h-8 w-8 text-lime-300" />
                  </div>
                </div>
                {item.caption && (
                  <p
                    className={cn(
                      "mt-2 line-clamp-2 text-xs text-zinc-400",
                      "lg:hidden"
                    )}
                  >
                    {item.caption}
                  </p>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
