import { tool } from "ai";
import { z } from "zod";
import { sanityFetch } from "@/sanity/lib/live";
import { SUBSCRIPTIONS_BY_USER_QUERY } from "@/lib/sanity/queries/subscriptions";
import {
  SUBSCRIPTION_STATUS_VALUES,
  getSubscriptionStatusEmoji,
} from "@/lib/constants/subscriptionStatus";
import { formatPrice, formatDate } from "@/lib/utils";

const getMySubscriptionsSchema = z.object({
  status: z
    .enum(["", ...SUBSCRIPTION_STATUS_VALUES])
    .optional()
    .default("")
    .describe("Filter subscriptions by status (leave empty for all)"),
});

export interface SubscriptionSummary {
  id: string;
  subscriptionNumber: string | null;
  packageTitle: string | null;
  price: number | null;
  priceFormatted: string | null;
  status: string | null;
  statusDisplay: string;
  startDate: string | null;
  endDate: string | null;
  nextRenewalDate: string | null;
  packageUrl: string | null;
  subscriptionUrl: string;
}

export interface GetMySubscriptionsResult {
  found: boolean;
  message: string;
  subscriptions: SubscriptionSummary[];
  totalSubscriptions: number;
  isAuthenticated: boolean;
}

export function createGetMySubscriptionsTool(userId: string | null) {
  if (!userId) {
    return null;
  }

  return tool({
    description:
      "Get the current user's gym subscriptions. Can optionally filter by status. Only works for authenticated users.",
    inputSchema: getMySubscriptionsSchema,
    execute: async ({ status }) => {
      console.log("[GetMySubscriptions] Fetching subscriptions for user:", userId, {
        status,
      });

      try {
        const { data: subscriptions } = await sanityFetch({
          query: SUBSCRIPTIONS_BY_USER_QUERY,
          params: { userId },
        });

        let filtered = subscriptions as Array<any>;
        if (status) {
          filtered = filtered.filter((sub) => sub.status === status);
        }

        if (filtered.length === 0) {
          return {
            found: false,
            message: status
              ? `No subscriptions found with status "${status}".`
              : "You don't have any active subscriptions yet.",
            subscriptions: [],
            totalSubscriptions: 0,
            isAuthenticated: true,
          } satisfies GetMySubscriptionsResult;
        }

        const formatted: SubscriptionSummary[] = filtered.map((sub) => ({
          id: sub._id,
          subscriptionNumber: sub.subscriptionNumber ?? null,
          packageTitle: sub.package?.title ?? null,
          price: sub.price ?? null,
          priceFormatted: sub.price ? formatPrice(sub.price) : null,
          status: sub.status ?? null,
          statusDisplay: getSubscriptionStatusEmoji(sub.status),
          startDate: sub.startDate ? formatDate(sub.startDate, "long") : null,
          endDate: sub.endDate ? formatDate(sub.endDate, "long") : null,
          nextRenewalDate: sub.nextRenewalDate
            ? formatDate(sub.nextRenewalDate, "long")
            : null,
          packageUrl: sub.package?.slug
            ? `/packages/checkout?package=${sub.package.slug}`
            : null,
          subscriptionUrl: "/my-subscription",
        }));

        return {
          found: true,
          message: `Found ${formatted.length} subscription${formatted.length === 1 ? "" : "s"}.`,
          subscriptions: formatted,
          totalSubscriptions: formatted.length,
          isAuthenticated: true,
        } satisfies GetMySubscriptionsResult;
      } catch (error) {
        console.error("[GetMySubscriptions] Error:", error);
        return {
          found: false,
          message: "An error occurred while fetching your subscriptions.",
          subscriptions: [],
          totalSubscriptions: 0,
          isAuthenticated: true,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  });
}
