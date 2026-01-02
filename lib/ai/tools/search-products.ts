import { tool } from "ai";
import { z } from "zod";
import { sanityFetch } from "@/sanity/lib/live";
import { AI_SEARCH_PRODUCTS_QUERY } from "@/lib/sanity/queries/products";
import { formatPrice } from "@/lib/utils";
import { getStockStatus, getStockMessage } from "@/lib/constants/stock";
import { GOAL_VALUES, SPORT_VALUES, GENDER_VALUES } from "@/lib/constants/filters";
import type { AI_SEARCH_PRODUCTS_QUERYResult } from "@/sanity.types";
import type { SearchProduct } from "@/lib/ai/types";

const genderFilterValues = ["", ...GENDER_VALUES] as [string, ...string[]];

const productSearchSchema = z.object({
  query: z
    .string()
    .optional()
    .default("")
    .describe(
      "Search term to find products by name, description, or brand (e.g., 'creatine', 'boxing gloves')"
    ),
  category: z
    .string()
    .optional()
    .default("")
    .describe("Filter by category slug (e.g., 'supplements', 'combat-gear')"),
  brand: z
    .string()
    .optional()
    .default("")
    .describe("Filter by brand name"),
  goals: z
    .array(z.enum(GOAL_VALUES))
    .optional()
    .default([])
    .describe("Filter by training goals"),
  sports: z
    .array(z.enum(SPORT_VALUES))
    .optional()
    .default([])
    .describe("Filter by sport"),
  gender: z
    .enum(genderFilterValues)
    .optional()
    .default("")
    .describe("Filter by gender"),
  minPrice: z
    .number()
    .optional()
    .default(0)
    .describe("Minimum price in BDT (e.g., 1000)"),
  maxPrice: z
    .number()
    .optional()
    .default(0)
    .describe("Maximum price in BDT (e.g., 5000). Use 0 for no maximum."),
});

export const searchProductsTool = tool({
  description:
    "Search for products in the Gold's Gym Bangladesh store. Can search by name, description, or category, and filter by brand, goals, sports, gender, and price range.",
  inputSchema: productSearchSchema,
  execute: async ({
    query,
    category,
    brand,
    goals,
    sports,
    gender,
    minPrice,
    maxPrice,
  }) => {
    console.log("[SearchProducts] Query received:", {
      query,
      category,
      brand,
      goals,
      sports,
      gender,
      minPrice,
      maxPrice,
    });

    try {
      const { data: products } = await sanityFetch({
        query: AI_SEARCH_PRODUCTS_QUERY,
        params: {
          searchQuery: query || "",
          categorySlug: category || "",
          brand: brand || "",
          goals: goals ?? [],
          sports: sports ?? [],
          gender: gender || "",
          minPrice: minPrice || 0,
          maxPrice: maxPrice || 0,
        },
      });

      console.log("[SearchProducts] Products found:", products.length);

      if (products.length === 0) {
        return {
          found: false,
          message:
            "No products found matching your criteria. Try different search terms or filters.",
          products: [],
          filters: {
            query,
            category,
            brand,
            goals,
            sports,
            gender,
            minPrice,
            maxPrice,
          },
        };
      }

      const formattedProducts: SearchProduct[] = (
        products as AI_SEARCH_PRODUCTS_QUERYResult
      ).map((product) => {
        const variantPrices =
          product.variants
            ?.map((variant) => variant?.price)
            .filter((price): price is number => typeof price === "number") ?? [];
        const variantStock =
          product.variants?.reduce(
            (sum, variant) => sum + (variant?.stock ?? 0),
            0
          ) ?? 0;
        const price =
          variantPrices.length > 0
            ? Math.min(...variantPrices)
            : product.price ?? null;
        const stockCount = product.variants?.length
          ? variantStock
          : product.stock ?? 0;

        return {
          id: product._id,
          name: product.name ?? null,
          slug: product.slug ?? null,
          description: product.description ?? null,
          price,
          priceFormatted: price ? formatPrice(price) : null,
          category: product.category?.title ?? null,
          categorySlug: product.category?.slug ?? null,
          brand: product.brand ?? null,
          productType: product.productType ?? null,
          goals: product.goals ?? [],
          sports: product.sports ?? [],
          gender: product.gender ?? null,
          optionNames:
            product.options
              ?.map((option) => option?.name)
              .filter(
                (value): value is string =>
                  typeof value === "string" && value.length > 0
              ) ?? [],
          variantsCount: product.variants?.length ?? 0,
          stockCount,
          stockStatus: getStockStatus(stockCount),
          stockMessage: getStockMessage(stockCount),
          featured: product.featured ?? false,
          isDigital: product.isDigital ?? false,
          imageUrl: product.image?.asset?.url ?? null,
          productUrl: product.slug ? `/products/${product.slug}` : null,
        };
      });

      return {
        found: true,
        message: `Found ${products.length} product${products.length === 1 ? "" : "s"} matching your search.`,
        totalResults: products.length,
        products: formattedProducts,
        filters: {
          query,
          category,
          brand,
          goals,
          sports,
          gender,
          minPrice,
          maxPrice,
        },
      };
    } catch (error) {
      console.error("[SearchProducts] Error:", error);
      return {
        found: false,
        message: "An error occurred while searching for products.",
        products: [],
        error: error instanceof Error ? error.message : "Unknown error",
        filters: {
          query,
          category,
          brand,
          goals,
          sports,
          gender,
          minPrice,
          maxPrice,
        },
      };
    }
  },
});
