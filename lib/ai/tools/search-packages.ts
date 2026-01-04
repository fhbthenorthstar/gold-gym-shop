import { tool } from "ai";
import { z } from "zod";
import { sanityFetch } from "@/sanity/lib/live";
import { SUBSCRIPTION_PACKAGES_QUERY } from "@/lib/sanity/queries/subscriptions";
import { formatPrice } from "@/lib/utils";
import { formatPackageLocation, formatPackageTier } from "@/lib/utils/subscriptions";
import type { SearchPackage } from "@/lib/ai/types";

const locationValues = [
  "",
  "bashundhara-sports-city",
  "bashundhara-city-shopping-mall",
] as const;

const tierValues = ["", "gold", "silver", "pool-spa"] as const;

const packageSearchSchema = z.object({
  query: z
    .string()
    .optional()
    .default("")
    .describe("Search by package title or access type (e.g., 'spa', 'gym')"),
  location: z
    .enum(locationValues)
    .optional()
    .default("")
    .describe(
      "Filter by location: bashundhara-sports-city or bashundhara-city-shopping-mall"
    ),
  tier: z
    .enum(tierValues)
    .optional()
    .default("")
    .describe("Filter by tier: gold, silver, pool-spa"),
  durationMonths: z
    .number()
    .optional()
    .default(0)
    .describe("Filter by duration in months (1, 3, 6, 12)"),
  maxPrice: z
    .number()
    .optional()
    .default(0)
    .describe("Maximum offer price in BDT (0 for no maximum)"),
});

export const searchPackagesTool = tool({
  description:
    "Search Gold's Gym BD membership packages by location, tier, duration, or price.",
  inputSchema: packageSearchSchema,
  execute: async ({ query, location, tier, durationMonths, maxPrice }) => {
    try {
      const { data } = await sanityFetch({
        query: SUBSCRIPTION_PACKAGES_QUERY,
      });

      const packages = (data ?? []) as Array<{
        _id: string;
        title?: string | null;
        slug?: string | null;
        location?: string | null;
        tier?: string | null;
        durationLabel?: string | null;
        durationMonths?: number | null;
        accessLabel?: string | null;
        packagePrice?: number | null;
        offerPrice?: number | null;
      }>;

      const normalizedQuery = query?.toLowerCase().trim();

      const filtered = packages.filter((pkg) => {
        const price =
          typeof pkg.offerPrice === "number"
            ? pkg.offerPrice
            : pkg.packagePrice ?? 0;
        if (location && pkg.location !== location) return false;
        if (tier && pkg.tier !== tier) return false;
        if (durationMonths && pkg.durationMonths !== durationMonths) return false;
        if (maxPrice && price > maxPrice) return false;
        if (normalizedQuery) {
          const haystack = `${pkg.title ?? ""} ${pkg.accessLabel ?? ""}`.toLowerCase();
          if (!haystack.includes(normalizedQuery)) return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        return {
          found: false,
          message: "No packages found matching your criteria.",
          packages: [],
        };
      }

      const formatted: SearchPackage[] = filtered.map((pkg) => {
        const price =
          typeof pkg.offerPrice === "number"
            ? pkg.offerPrice
            : pkg.packagePrice ?? 0;
        return {
          id: pkg._id,
          title: pkg.title ?? null,
          location: pkg.location ?? null,
          locationLabel: formatPackageLocation(pkg.location ?? ""),
          tier: pkg.tier ?? null,
          tierLabel: formatPackageTier(pkg.tier ?? ""),
          durationLabel: pkg.durationLabel ?? null,
          durationMonths: pkg.durationMonths ?? null,
          accessLabel: pkg.accessLabel ?? null,
          price,
          priceFormatted: formatPrice(price),
          packageUrl: pkg.slug ? `/packages/checkout?package=${pkg.slug}` : null,
        };
      });

      return {
        found: true,
        message: `Found ${formatted.length} package${formatted.length === 1 ? "" : "s"}.`,
        packages: formatted,
      };
    } catch (error) {
      console.error("[SearchPackages] Error:", error);
      return {
        found: false,
        message: "An error occurred while searching packages.",
        packages: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
