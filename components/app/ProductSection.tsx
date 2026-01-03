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
  allProducts: FILTER_PRODUCTS_BY_BEST_SELLING_QUERYResult;
  searchQuery: string;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    perPage: number;
  };
}

export function ProductSection({
  categories,
  products,
  allProducts,
  searchQuery,
  pagination,
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
    if (pagination.totalResults === 0) return "Showing 0 results";
    const start = (pagination.currentPage - 1) * pagination.perPage + 1;
    const end = Math.min(
      pagination.currentPage * pagination.perPage,
      pagination.totalResults
    );
    return `Showing ${start}-${end} of ${pagination.totalResults} results`;
  }, [pagination]);

  const updateParams = (
    updates: Record<string, string | number | null>,
    options?: { resetPage?: boolean }
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    if (options?.resetPage) {
      params.delete("page");
    }
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

  const pageItems = useMemo(() => {
    if (pagination.totalPages <= 5) {
      return Array.from({ length: pagination.totalPages }, (_, i) => i + 1);
    }
    const items: Array<number | "ellipsis"> = [1];
    const left = Math.max(2, pagination.currentPage - 1);
    const right = Math.min(pagination.totalPages - 1, pagination.currentPage + 1);

    if (left > 2) items.push("ellipsis");
    for (let page = left; page <= right; page += 1) {
      items.push(page);
    }
    if (right < pagination.totalPages - 1) items.push("ellipsis");
    items.push(pagination.totalPages);
    return items;
  }, [pagination]);

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
            onValueChange={(value) =>
              updateParams({ sort: value }, { resetPage: true })
            }
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
          <ProductFilters categories={categories} products={allProducts} />
        </aside>

        {/* Product Grid - expands to full width when filters hidden */}
        <main className="flex-1 transition-all duration-300">
          <ProductGrid products={products} view={view} columns={columns} />

          {pagination.totalPages > 1 && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateParams({ page: Math.max(1, pagination.currentPage - 1) })
                }
                disabled={pagination.currentPage === 1}
                className="border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-900"
              >
                Prev
              </Button>

              {pageItems.map((item, index) =>
                item === "ellipsis" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-xs text-zinc-500"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={`page-${item}`}
                    variant={item === pagination.currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateParams({ page: item })}
                    className={
                      item === pagination.currentPage
                        ? "bg-lime-300 text-black hover:bg-lime-200"
                        : "border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-900"
                    }
                  >
                    {item}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateParams({
                    page: Math.min(pagination.totalPages, pagination.currentPage + 1),
                  })
                }
                disabled={pagination.currentPage === pagination.totalPages}
                className="border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-900"
              >
                Next
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
