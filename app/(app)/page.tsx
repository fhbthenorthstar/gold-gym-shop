import { Suspense } from "react";
import { sanityFetch } from "@/sanity/lib/live";
import {
  FEATURED_PRODUCTS_QUERY,
  FILTER_PRODUCTS_BY_BEST_SELLING_QUERY,
  FILTER_PRODUCTS_BY_NEWEST_QUERY,
  FILTER_PRODUCTS_BY_PRICE_ASC_QUERY,
  FILTER_PRODUCTS_BY_PRICE_DESC_QUERY,
} from "@/lib/sanity/queries/products";
import { ALL_CATEGORIES_QUERY } from "@/lib/sanity/queries/categories";
import { ProductSection } from "@/components/app/ProductSection";
import { CategoryTiles } from "@/components/app/CategoryTiles";
import { FeaturedCarousel } from "@/components/app/FeaturedCarousel";
import { FeaturedCarouselSkeleton } from "@/components/app/FeaturedCarouselSkeleton";
import {
  parseMultiValueParam,
  parseOptionFiltersParam,
} from "@/lib/utils/filter-params";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    brand?: string;
    goals?: string;
    sports?: string;
    gender?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    inStock?: string;
    options?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;

  const searchQuery = params.q ?? "";
  const categorySlug = params.category ?? "";
  const brand = params.brand ?? "";
  const gender = params.gender ?? "";
  const goals = parseMultiValueParam(params.goals ?? null);
  const sports = parseMultiValueParam(params.sports ?? null);
  const optionFiltersMap = parseOptionFiltersParam(params.options ?? null);
  const optionFilters = Object.entries(optionFiltersMap)
    .filter(([, values]) => values.length > 0)
    .map(([name, values]) => ({ name, values }));
  const minPrice = Number(params.minPrice) || 0;
  const maxPrice = Number(params.maxPrice) || 0;
  const sort = params.sort ?? "best_selling";
  const inStock = params.inStock === "true";

  // Select query based on sort parameter
  const getQuery = () => {
    switch (sort) {
      case "price_asc":
        return FILTER_PRODUCTS_BY_PRICE_ASC_QUERY;
      case "price_desc":
        return FILTER_PRODUCTS_BY_PRICE_DESC_QUERY;
      case "newest":
        return FILTER_PRODUCTS_BY_NEWEST_QUERY;
      case "best_selling":
      default:
        return FILTER_PRODUCTS_BY_BEST_SELLING_QUERY;
    }
  };

  // Fetch products with filters (server-side via GROQ)
  const { data: products } = await sanityFetch({
    query: getQuery(),
    params: {
      searchQuery,
      categorySlug,
      brand,
      goals,
      sports,
      gender,
      optionFilters,
      minPrice,
      maxPrice,
      inStock,
    },
  });

  // Fetch categories for filter sidebar
  const { data: categories } = await sanityFetch({
    query: ALL_CATEGORIES_QUERY,
  });

  const activeCategory = categories.find(
    (category) => category.slug === categorySlug
  );

  // Fetch featured products for carousel
  const { data: featuredProducts } = await sanityFetch({
    query: FEATURED_PRODUCTS_QUERY,
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Featured Products Carousel */}
      {featuredProducts.length > 0 && (
        <Suspense fallback={<FeaturedCarouselSkeleton />}>
          <FeaturedCarousel products={featuredProducts} />
        </Suspense>
      )}

      {/* Page Banner */}
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Shop {activeCategory?.title ?? "All Products"}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Supplements, equipment, and combat essentials for Gold's Gym Bangladesh and Zulcan Indoor Arena
          </p>
        </div>

        {/* Category Tiles - Full width */}
        <div className="mt-6">
          <CategoryTiles
            categories={categories}
            activeCategory={categorySlug || undefined}
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductSection
          categories={categories}
          products={products}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}
