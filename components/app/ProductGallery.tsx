"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { PRODUCT_BY_SLUG_QUERYResult } from "@/sanity.types";

type ProductImages = NonNullable<
  NonNullable<PRODUCT_BY_SLUG_QUERYResult>["images"]
>;

interface ProductGalleryProps {
  images: ProductImages | null;
  productName: string | null;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
        <span className="text-zinc-400">No images available</span>
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 md:flex-col">
          {images.map((image, index) => (
            <button
              key={image._key ?? index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`View image ${index + 1}`}
              aria-pressed={selectedIndex === index}
              className={cn(
                "relative aspect-square w-16 overflow-hidden rounded-md border border-zinc-800 bg-zinc-900/60 transition-all",
                selectedIndex === index
                  ? "ring-2 ring-primary"
                  : "hover:opacity-80",
              )}
            >
              {image.asset?.url ? (
                <Image
                  src={image.asset.url}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                  N/A
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="relative aspect-square flex-1 overflow-hidden rounded-lg bg-zinc-900">
        {selectedImage?.asset?.url ? (
          <Image
            src={selectedImage.asset.url}
            alt={productName ?? "Product image"}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400">
            No image
          </div>
        )}
      </div>
    </div>
  );
}
