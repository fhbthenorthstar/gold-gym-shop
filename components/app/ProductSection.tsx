"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, PanelLeft, PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductFilters } from "./ProductFilters";
import { ProductGrid } from "./ProductGrid";
import { SORT_OPTIONS } from "@/lib/constants/filters";
import type {
  ALL_CATEGORIES_QUERYResult,
  FILTER_PRODUCTS_BY_BEST_SELLING_QUERYResult,
} from "@/sanity.types";

interface ProductSectionProps {
  categories: ALL_CATEGORIES_QUERYResult;
  products: FILTER_PRODUCTS_BY_BEST_SELLING_QUERYResult;
  searchQuery: string;
}

export function ProductSection({
  categories,
  products,
  searchQuery,
}: ProductSectionProps) {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const view = (searchParams.get("view") as "grid" | "list") ?? "grid";
  const parsedCols = Number(searchParams.get("cols") ?? "3");
  const columns: 2 | 3 | 4 =
    parsedCols === 2 || parsedCols === 4 ? parsedCols : 3;
  const currentSort = searchParams.get("sort") ?? "best_selling";

  const resultLabel = useMemo(() => {
    if (products.length === 0) return "Showing 0 results";
    return `Showing 1-${products.length} of ${products.length} results`;
  }, [products.length]);

  const updateParams = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header with results count and filter toggle */}
      <div className="flex flex-col gap-4 border-b border-zinc-800 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-zinc-400">
            {resultLabel}
            {searchQuery && (
              <span>
                {" "}
                for &quot;<span className="text-lime-300">{searchQuery}</span>&quot;
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300">
            <button
              type="button"
              onClick={() => updateParams({ view: "list" })}
              className={`rounded-full p-1 ${
                view === "list" ? "text-lime-300" : ""
              }`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => updateParams({ view: "grid", cols: 2 })}
              className={`rounded-full p-1 ${
                view === "grid" && columns === 2 ? "text-lime-300" : ""
              }`}
              aria-label="2 column grid"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => updateParams({ view: "grid", cols: 3 })}
              className={`rounded-full p-1 ${
                view === "grid" && columns === 3 ? "text-lime-300" : ""
              }`}
              aria-label="3 column grid"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => updateParams({ view: "grid", cols: 4 })}
              className={`rounded-full p-1 ${
                view === "grid" && columns === 4 ? "text-lime-300" : ""
              }`}
              aria-label="4 column grid"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <Select
            value={currentSort}
            onValueChange={(value) => updateParams({ sort: value })}
          >
            <SelectTrigger className="h-9 w-[180px] border-zinc-800 bg-zinc-950 text-xs text-zinc-200">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-950 text-zinc-200">
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-900"
            aria-label={filtersOpen ? "Hide filters" : "Show filters"}
          >
            {filtersOpen ? (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span className="hidden sm:inline">Hide Filters</span>
                <span className="sm:hidden">Hide</span>
              </>
            ) : (
              <>
                <PanelLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Show Filters</span>
                <span className="sm:hidden">Filters</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Filters - completely hidden when collapsed on desktop */}
        <aside
          className={`shrink-0 transition-all duration-300 ease-in-out ${
            filtersOpen ? "w-full lg:w-72 lg:opacity-100" : "hidden lg:hidden"
          }`}
        >
          <ProductFilters categories={categories} products={products} />
        </aside>

        {/* Product Grid - expands to full width when filters hidden */}
        <main className="flex-1 transition-all duration-300">
          <ProductGrid products={products} view={view} columns={columns} />
        </main>
      </div>
    </div>
  );
}
