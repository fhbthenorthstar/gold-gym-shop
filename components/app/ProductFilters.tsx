"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { GOALS, SPORTS, GENDERS, SORT_OPTIONS } from "@/lib/constants/filters";
import {
  buildMultiValueParam,
  buildOptionFiltersParam,
  parseMultiValueParam,
  parseOptionFiltersParam,
} from "@/lib/utils/filter-params";
import type {
  ALL_CATEGORIES_QUERYResult,
  FILTER_PRODUCTS_BY_BEST_SELLING_QUERYResult,
} from "@/sanity.types";

const MAX_PRICE = 200000;

interface ProductFiltersProps {
  categories: ALL_CATEGORIES_QUERYResult;
  products: FILTER_PRODUCTS_BY_BEST_SELLING_QUERYResult;
}

export function ProductFilters({ categories, products }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("q") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentBrand = searchParams.get("brand") ?? "";
  const currentGender = searchParams.get("gender") ?? "";
  const currentSort = searchParams.get("sort") ?? "best_selling";
  const currentGoals = parseMultiValueParam(searchParams.get("goals"));
  const currentSports = parseMultiValueParam(searchParams.get("sports"));
  const currentOptionFilters = parseOptionFiltersParam(
    searchParams.get("options")
  );
  const urlMinPrice = Number(searchParams.get("minPrice")) || 0;
  const urlMaxPrice = Number(searchParams.get("maxPrice")) || MAX_PRICE;
  const currentInStock = searchParams.get("inStock") === "true";

  const selectedCategory = categories.find(
    (category) => category.slug === currentCategory
  );
  const filterConfig = selectedCategory?.filterConfig;

  const showBrand = filterConfig ? filterConfig.showBrand ?? true : false;
  const showGoals = filterConfig ? filterConfig.showGoals ?? true : false;
  const showSports = filterConfig ? filterConfig.showSports ?? true : false;
  const showGender = filterConfig ? filterConfig.showGender ?? true : false;
  const optionFilterNames = filterConfig?.optionFilters ?? [];

  const orderedCategories = useMemo(() => {
    const topCategories = categories.filter((category) => !category.parent?.slug);
    const childCategories = categories.filter((category) => category.parent?.slug);

    return topCategories.flatMap((parent) => {
      const children = childCategories.filter(
        (child) => child.parent?.slug === parent.slug
      );
      return [parent, ...children];
    });
  }, [categories]);

  const brandOptions = useMemo(() => {
    const values = new Set<string>();
    products.forEach((product) => {
      if (product.brand) values.add(product.brand);
    });
    return Array.from(values).sort();
  }, [products]);

  const goalValuesInProducts = useMemo(() => {
    const values = new Set<string>();
    products.forEach((product) => {
      product.goals?.forEach((goal) => values.add(goal));
    });
    return values;
  }, [products]);

  const sportValuesInProducts = useMemo(() => {
    const values = new Set<string>();
    products.forEach((product) => {
      product.sports?.forEach((sport) => values.add(sport));
    });
    return values;
  }, [products]);

  const genderValuesInProducts = useMemo(() => {
    const values = new Set<string>();
    products.forEach((product) => {
      if (product.gender) values.add(product.gender);
    });
    return values;
  }, [products]);

  const optionValuesByName = useMemo(() => {
    const map = new Map<string, Set<string>>();

    products.forEach((product) => {
      product.options?.forEach((option) => {
        const name = option?.name?.trim();
        if (!name) return;
        const set = map.get(name) ?? new Set<string>();
        option?.values?.forEach((value) => {
          if (value) set.add(value);
        });
        map.set(name, set);
      });

      product.variants?.forEach((variant) => {
        variant?.optionValues?.forEach((opt) => {
          const name = opt?.name?.trim();
          const value = opt?.value?.trim();
          if (!name || !value) return;
          const set = map.get(name) ?? new Set<string>();
          set.add(value);
          map.set(name, set);
        });
      });
    });

    return map;
  }, [products]);

  // Local state for price range (for smooth slider dragging)
  const [priceRange, setPriceRange] = useState<[number, number]>([
    urlMinPrice,
    urlMaxPrice,
  ]);

  // Sync local state when URL changes
  useEffect(() => {
    setPriceRange([urlMinPrice, urlMaxPrice]);
  }, [urlMinPrice, urlMaxPrice]);

  // Check which filters are active
  const isSearchActive = !!currentSearch;
  const isCategoryActive = !!currentCategory;
  const isBrandActive = !!currentBrand;
  const isGoalsActive = currentGoals.length > 0;
  const isSportsActive = currentSports.length > 0;
  const isGenderActive = !!currentGender;
  const optionActiveCount = Object.values(currentOptionFilters).filter(
    (values) => values.length > 0
  ).length;
  const isOptionsActive = optionActiveCount > 0;
  const isPriceActive = urlMinPrice > 0 || urlMaxPrice < MAX_PRICE;
  const isInStockActive = currentInStock;

  const hasActiveFilters =
    isSearchActive ||
    isCategoryActive ||
    isBrandActive ||
    isGoalsActive ||
    isSportsActive ||
    isGenderActive ||
    isOptionsActive ||
    isPriceActive ||
    isInStockActive;

  // Count active filters
  const activeFilterCount =
    [
      isSearchActive,
      isCategoryActive,
      isBrandActive,
      isGoalsActive,
      isSportsActive,
      isGenderActive,
      isPriceActive,
      isInStockActive,
    ].filter(Boolean).length + optionActiveCount;

  const updateParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === 0) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get("search") as string;
    updateParams({ q: searchQuery || null });
  };

  const handleClearFilters = () => {
    router.push("/", { scroll: false });
  };

  const toggleMultiValue = (
    key: "goals" | "sports",
    value: string
  ) => {
    const currentValues = key === "goals" ? currentGoals : currentSports;
    const set = new Set(currentValues);

    if (set.has(value)) {
      set.delete(value);
    } else {
      set.add(value);
    }

    updateParams({ [key]: buildMultiValueParam(Array.from(set)) });
  };

  const toggleOptionFilter = (name: string, value: string) => {
    const nextFilters = { ...currentOptionFilters };
    const currentValues = new Set(nextFilters[name] ?? []);

    if (currentValues.has(value)) {
      currentValues.delete(value);
    } else {
      currentValues.add(value);
    }

    if (currentValues.size === 0) {
      delete nextFilters[name];
    } else {
      nextFilters[name] = Array.from(currentValues);
    }

    updateParams({ options: buildOptionFiltersParam(nextFilters) });
  };

  const clearSingleFilter = (key: string) => {
    if (key === "price") {
      updateParams({ minPrice: null, maxPrice: null });
      return;
    }

    if (key === "goals" || key === "sports") {
      updateParams({ [key]: null });
      return;
    }

    if (key === "options") {
      updateParams({ options: null });
      return;
    }

    if (key.startsWith("option:")) {
      const optionName = key.replace("option:", "");
      const nextFilters = { ...currentOptionFilters };
      delete nextFilters[optionName];
      updateParams({ options: buildOptionFiltersParam(nextFilters) });
      return;
    }

    updateParams({ [key]: null });
  };

  // Helper for filter label with active indicator
  const FilterLabel = ({
    children,
    isActive,
    filterKey,
  }: {
    children: React.ReactNode;
    isActive: boolean;
    filterKey: string;
  }) => (
    <div className="mb-2 flex items-center justify-between">
      <span
        className={`block text-sm font-medium ${
          isActive
            ? "text-zinc-900 dark:text-zinc-100"
            : "text-zinc-700 dark:text-zinc-300"
        }`}
      >
        {children}
        {isActive && (
          <Badge className="ml-2 h-5 bg-amber-500 px-1.5 text-xs text-white hover:bg-amber-500">
            Active
          </Badge>
        )}
      </span>
      {isActive && (
        <button
          type="button"
          onClick={() => clearSingleFilter(filterKey)}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          aria-label={`Clear ${filterKey} filter`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      {/* Clear Filters - Show at top when active */}
      {hasActiveFilters && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"} applied
            </span>
          </div>
          <Button
            size="sm"
            onClick={handleClearFilters}
            className="w-full bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
          >
            <X className="mr-2 h-4 w-4" />
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Search */}
      <div>
        <FilterLabel isActive={isSearchActive} filterKey="q">
          Search
        </FilterLabel>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <Input
            name="search"
            placeholder="Search products..."
            defaultValue={currentSearch}
            className={`flex-1 ${
              isSearchActive
                ? "border-amber-500 ring-1 ring-amber-500 dark:border-amber-400 dark:ring-amber-400"
                : ""
            }`}
          />
          <Button type="submit" size="sm">
            Search
          </Button>
        </form>
      </div>

      {/* Category */}
      <div>
        <FilterLabel isActive={isCategoryActive} filterKey="category">
          Category
        </FilterLabel>
        <Select
          value={currentCategory || "all"}
          onValueChange={(value) =>
            updateParams({ category: value === "all" ? null : value })
          }
        >
          <SelectTrigger
            className={
              isCategoryActive
                ? "border-amber-500 ring-1 ring-amber-500 dark:border-amber-400 dark:ring-amber-400"
                : ""
            }
          >
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {orderedCategories.map((category) => {
              const isChild = !!category.parent?.slug;
              return (
                <SelectItem key={category._id} value={category.slug ?? ""}>
                  {isChild ? `- ${category.title}` : category.title}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Brand */}
      {showBrand && brandOptions.length > 0 && (
        <div>
          <FilterLabel isActive={isBrandActive} filterKey="brand">
            Brand
          </FilterLabel>
          <Select
            value={currentBrand || "all"}
            onValueChange={(value) =>
              updateParams({ brand: value === "all" ? null : value })
            }
          >
            <SelectTrigger
              className={
                isBrandActive
                  ? "border-amber-500 ring-1 ring-amber-500 dark:border-amber-400 dark:ring-amber-400"
                  : ""
              }
            >
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brandOptions.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Goals */}
      {showGoals && (
        <div>
          <FilterLabel isActive={isGoalsActive} filterKey="goals">
            Goals
          </FilterLabel>
          <div className="space-y-2">
            {GOALS.map((goal) => {
              const isAvailable = goalValuesInProducts.has(goal.value);
              return (
                <label
                  key={goal.value}
                  className={`flex items-center gap-2 text-sm ${
                    isAvailable
                      ? "text-zinc-700 dark:text-zinc-300"
                      : "text-zinc-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={currentGoals.includes(goal.value)}
                    onChange={() => toggleMultiValue("goals", goal.value)}
                    disabled={!isAvailable}
                    className="h-4 w-4 rounded border-zinc-300 text-amber-500 focus:ring-amber-500 dark:border-zinc-600 dark:bg-zinc-800"
                  />
                  {goal.label}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Sports */}
      {showSports && (
        <div>
          <FilterLabel isActive={isSportsActive} filterKey="sports">
            Sports
          </FilterLabel>
          <div className="space-y-2">
            {SPORTS.map((sport) => {
              const isAvailable = sportValuesInProducts.has(sport.value);
              return (
                <label
                  key={sport.value}
                  className={`flex items-center gap-2 text-sm ${
                    isAvailable
                      ? "text-zinc-700 dark:text-zinc-300"
                      : "text-zinc-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={currentSports.includes(sport.value)}
                    onChange={() => toggleMultiValue("sports", sport.value)}
                    disabled={!isAvailable}
                    className="h-4 w-4 rounded border-zinc-300 text-amber-500 focus:ring-amber-500 dark:border-zinc-600 dark:bg-zinc-800"
                  />
                  {sport.label}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Gender */}
      {showGender && (
        <div>
          <FilterLabel isActive={isGenderActive} filterKey="gender">
            Gender
          </FilterLabel>
          <Select
            value={currentGender || "all"}
            onValueChange={(value) =>
              updateParams({ gender: value === "all" ? null : value })
            }
          >
            <SelectTrigger
              className={
                isGenderActive
                  ? "border-amber-500 ring-1 ring-amber-500 dark:border-amber-400 dark:ring-amber-400"
                  : ""
              }
            >
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {GENDERS.map((gender) => (
                <SelectItem
                  key={gender.value}
                  value={gender.value}
                  disabled={!genderValuesInProducts.has(gender.value)}
                >
                  {gender.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Dynamic Options */}
      {optionFilterNames.length > 0 && (
        <div className="space-y-4">
          {optionFilterNames.map((optionName) => {
            const values = Array.from(
              optionValuesByName.get(optionName) ?? new Set<string>()
            ).sort();
            const activeValues = currentOptionFilters[optionName] ?? [];
            const isActive = activeValues.length > 0;

            if (values.length === 0) return null;

            return (
              <div key={optionName}>
                <FilterLabel
                  isActive={isActive}
                  filterKey={`option:${optionName}`}
                >
                  {optionName}
                </FilterLabel>
                <div className="flex flex-wrap gap-2">
                  {values.map((value) => {
                    const isChecked = activeValues.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleOptionFilter(optionName, value)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          isChecked
                            ? "border-amber-500 bg-amber-500 text-white"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-amber-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Price Range */}
      <div>
        <FilterLabel isActive={isPriceActive} filterKey="price">
          Price Range: ৳{priceRange[0]} - ৳{priceRange[1]}
        </FilterLabel>
        <Slider
          min={0}
          max={MAX_PRICE}
          step={100}
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          onValueCommit={([min, max]) =>
            updateParams({
              minPrice: min > 0 ? min : null,
              maxPrice: max < MAX_PRICE ? max : null,
            })
          }
          className={`mt-4 ${
            isPriceActive
              ? "[&_[role=slider]]:border-amber-500 [&_[role=slider]]:ring-amber-500"
              : ""
          }`}
        />
      </div>

      {/* In Stock Only */}
      <div>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={currentInStock}
            onChange={(e) =>
              updateParams({ inStock: e.target.checked ? "true" : null })
            }
            className="h-5 w-5 rounded border-zinc-300 text-amber-500 focus:ring-amber-500 dark:border-zinc-600 dark:bg-zinc-800"
          />
          <span
            className={`text-sm font-medium ${
              isInStockActive
                ? "text-zinc-900 dark:text-zinc-100"
                : "text-zinc-700 dark:text-zinc-300"
            }`}
          >
            Show only in-stock
            {isInStockActive && (
              <Badge className="ml-2 h-5 bg-amber-500 px-1.5 text-xs text-white hover:bg-amber-500">
                Active
              </Badge>
            )}
          </span>
        </label>
      </div>

      {/* Sort */}
      <div>
        <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Sort By
        </span>
        <Select
          value={currentSort}
          onValueChange={(value) => updateParams({ sort: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
