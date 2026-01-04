import { sanityFetch } from "@/sanity/lib/live";
import {
  FILTER_PRODUCTS_BY_BEST_SELLING_QUERY,
  FILTER_PRODUCTS_BY_NEWEST_QUERY,
  FILTER_PRODUCTS_BY_PRICE_ASC_QUERY,
  FILTER_PRODUCTS_BY_PRICE_DESC_QUERY,
} from "@/lib/sanity/queries/products";
import { ALL_CATEGORIES_QUERY } from "@/lib/sanity/queries/categories";
import { ProductSection } from "@/components/app/ProductSection";
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
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: PageProps) {
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
  const page = Math.max(1, Number(params.page) || 1);
  const perPage = 12;

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

  const { data: categories } = await sanityFetch({
    query: ALL_CATEGORIES_QUERY,
  });

  const activeCategory = categories.find(
    (category) => category.slug === categorySlug
  );
  const totalResults = products.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / perPage));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * perPage;
  const pagedProducts = products.slice(startIndex, startIndex + perPage);

  return (
    <div className="min-h-screen bg-black">
      <section
        className="relative overflow-hidden border-b border-zinc-800 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(/trinners/head-trainers-01.webp)",
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">
            Home / All Collections / Products
          </p>
          <h1 className="font-heading mt-4 text-3xl md:text-4xl">
            {activeCategory?.title ?? "All Products"}
          </h1>
          <p className="mt-2 text-sm text-zinc-300">
            Gold's Gym Bangladesh essentials for stronger training: apparel,
            supplements, and performance gear.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <ProductSection
          categories={categories}
          products={pagedProducts}
          allProducts={products}
          searchQuery={searchQuery}
          pagination={{
            currentPage: safePage,
            totalPages,
            totalResults,
            perPage,
          }}
        />
      </div>
    </div>
  );
}
