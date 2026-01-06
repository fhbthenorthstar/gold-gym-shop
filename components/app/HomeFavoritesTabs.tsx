"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/app/ProductCard";
import type { FILTER_PRODUCTS_BY_BEST_SELLING_QUERYResult } from "@/sanity.types";

type CategoryTab = {
  _id?: string;
  title?: string | null;
  slug?: string | null;
  products?: FILTER_PRODUCTS_BY_BEST_SELLING_QUERYResult | null;
};

interface HomeFavoritesTabsProps {
  categories: CategoryTab[];
  fallbackProducts: FILTER_PRODUCTS_BY_BEST_SELLING_QUERYResult;
}

export function HomeFavoritesTabs({
  categories,
  fallbackProducts,
}: HomeFavoritesTabsProps) {
  const availableCategories = useMemo(
    () =>
      categories.filter((category) => (category.products?.length ?? 0) > 0),
    [categories]
  );
  const tabs = useMemo(
    () =>
      availableCategories.map((category, index) => ({
        ...category,
        tabValue: category.slug ?? category._id ?? `category-${index}`,
      })),
    [availableCategories]
  );

  if (tabs.length === 0) {
    return fallbackProducts.length > 0 ? (
      <>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {fallbackProducts.slice(0, 9).map((product, index) => (
            <div
              key={product._id}
              className="h-full animate-in fade-in-0 slide-in-from-bottom-2 duration-700"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            href="/shop"
            className="inline-flex h-11 items-center justify-center rounded-full border border-primary/50 px-6 text-xs font-semibold uppercase tracking-[0.2em] text-primary transition hover:border-primary hover:text-primary/90"
          >
            Shop More
          </Link>
        </div>
      </>
    ) : (
      <div className="mt-10 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-10 text-center text-sm text-zinc-500">
        Add featured products in Sanity to populate this section.
      </div>
    );
  }

  const initialValue = tabs[0]?.tabValue ?? "favorites";
  const [activeTab, setActiveTab] = useState(initialValue);
  const activeCategory =
    tabs.find((category) => category.tabValue === activeTab) ?? tabs[0];

  return (
    <>
      <Tabs defaultValue={initialValue} onValueChange={setActiveTab}>
        <TabsList className="mt-8 flex h-auto w-full flex-wrap justify-center gap-2 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-2 sm:gap-3">
          {tabs.map((category) => (
            <TabsTrigger
              key={category.tabValue}
              value={category.tabValue}
              className="rounded-full border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300 data-[state=active]:border-primary/40 data-[state=active]:bg-primary/10 data-[state=active]:text-primary sm:px-6"
            >
              {category.title ?? "Category"}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((category) => (
          <TabsContent key={category.tabValue} value={category.tabValue}>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(category.products ?? []).slice(0, 9).map((product, index) => (
                <div
                  key={product._id}
                  className="h-full animate-in fade-in-0 slide-in-from-bottom-2 duration-700"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-10 flex justify-center">
        <Link
          href={
            activeCategory?.slug
              ? `/shop?category=${encodeURIComponent(activeCategory.slug)}`
              : "/shop"
          }
          className="inline-flex h-11 items-center justify-center rounded-full border border-primary/50 px-6 text-xs font-semibold uppercase tracking-[0.2em] text-primary transition hover:border-primary hover:text-primary/90"
        >
          Shop More
        </Link>
      </div>
    </>
  );
}
