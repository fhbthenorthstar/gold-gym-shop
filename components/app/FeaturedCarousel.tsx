"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import { getDefaultVariant, getDisplayPrice } from "@/lib/utils/product-variants";
import type { FEATURED_PRODUCTS_QUERYResult } from "@/sanity.types";

type FeaturedProduct = FEATURED_PRODUCTS_QUERYResult[number];

interface FeaturedCarouselProps {
  products: FEATURED_PRODUCTS_QUERYResult;
}

export function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full border-b border-zinc-800 bg-black">
      <Carousel
        setApi={setApi}
        opts={{
          loop: true,
          align: "start",
        }}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="-ml-0">
          {products.map((product) => (
            <CarouselItem key={product._id} className="pl-0">
              <FeaturedSlide product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation arrows - positioned inside */}
        <CarouselPrevious className="left-4 border-zinc-800 bg-zinc-950/80 text-lime-300 hover:bg-zinc-900 hover:text-lime-200 sm:left-8" />
        <CarouselNext className="right-4 border-zinc-800 bg-zinc-950/80 text-lime-300 hover:bg-zinc-900 hover:text-lime-200 sm:right-8" />
      </Carousel>

      {/* Dot indicators */}
      {count > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-6">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={`dot-${index}`}
              type="button"
              onClick={() => scrollTo(index)}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-300",
                current === index
                  ? "w-6 bg-lime-300"
                  : "bg-zinc-700 hover:bg-zinc-500",
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FeaturedSlideProps {
  product: FeaturedProduct;
}

function FeaturedSlide({ product }: FeaturedSlideProps) {
  const mainImage = product.images?.[0]?.asset?.url;
  const defaultVariant = getDefaultVariant(product);
  const displayPrice = getDisplayPrice(product, defaultVariant);

  return (
    <div className="flex min-h-[400px] flex-col md:min-h-[450px] md:flex-row lg:min-h-[500px]">
      {/* Image Section - Left side (60% on desktop) */}
      <div className="relative h-64 w-full md:h-auto md:w-3/5">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.name ?? "Featured product"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-800">
            <span className="text-zinc-500">No image</span>
          </div>
        )}

        {/* Gradient overlay for image edge blending */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/90 hidden md:block" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent md:hidden" />
      </div>

      {/* Content Section - Right side (40% on desktop) */}
      <div className="flex w-full flex-col justify-center px-6 py-8 md:w-2/5 md:px-10 lg:px-16">
        {product.category && (
          <Badge
            variant="secondary"
            className="mb-4 w-fit bg-lime-300/20 text-lime-300 hover:bg-lime-300/30"
          >
            {product.category.title}
          </Badge>
        )}

        <h2 className="font-heading text-2xl font-semibold tracking-wide text-white sm:text-3xl lg:text-4xl">
          {product.name}
        </h2>

        {product.description && (
          <p className="mt-4 line-clamp-3 text-sm text-zinc-300 sm:text-base lg:text-lg">
            {product.description}
          </p>
        )}

        <p className="mt-6 text-3xl font-semibold text-white lg:text-4xl">
          {formatPrice(displayPrice)}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-lime-300 text-black hover:bg-lime-200"
          >
            <Link href={`/products/${product.slug}`}>
              Shop Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
