"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { client, writeClient } from "@/sanity/lib/client";
import { SUBSCRIPTION_PACKAGE_BY_SLUG_QUERY } from "@/lib/sanity/queries/subscriptions";
import type { SubscriptionPaymentMethod } from "@/lib/constants/subscriptionPayments";

interface CreateSubscriptionInput {
  packageSlug: string;
  startDate: string;
  phone: string;
  notes?: string;
  paymentMethod?: SubscriptionPaymentMethod;
}

interface CreateSubscriptionResult {
  success: boolean;
  subscriptionId?: string;
  error?: string;
}

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const buildSubscriptionNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SUB-${timestamp}-${random}`;
};

export async function createSubscription(
  input: CreateSubscriptionInput
): Promise<CreateSubscriptionResult> {
  try {
    const { userId } = await auth();
    const user = userId ? await currentUser() : null;

    if (!userId) {
      return { success: false, error: "Please sign in to subscribe." };
    }

    if (!input.packageSlug) {
      return { success: false, error: "Please select a package." };
    }

    if (!input.startDate) {
      return { success: false, error: "Please select a start date." };
    }

    if (!input.phone.trim()) {
      return { success: false, error: "Please provide a phone number." };
    }

    const packageDoc = await client.fetch(SUBSCRIPTION_PACKAGE_BY_SLUG_QUERY, {
      slug: input.packageSlug,
    });

    if (!packageDoc?._id) {
      return { success: false, error: "Package not found." };
    }

    const durationMonths = packageDoc.durationMonths ?? 1;
    const startDate = new Date(input.startDate);
    const endDate = addMonths(startDate, durationMonths);

    const price =
      typeof packageDoc.offerPrice === "number"
        ? packageDoc.offerPrice
        : packageDoc.packagePrice ?? 0;

    const subscriptionNumber = buildSubscriptionNumber();
    const subscriberName =
      user?.fullName ||
      `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
      "Member";
    const subscriberEmail = user?.primaryEmailAddress?.emailAddress ?? "";

    const created = await writeClient.create({
      _type: "subscription",
      subscriptionNumber,
      subscriberName,
      subscriberEmail,
      subscriberPhone: input.phone,
      userId,
      package: { _type: "reference", _ref: packageDoc._id },
      price,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      nextRenewalDate: endDate.toISOString().split("T")[0],
      status: "pending",
      paymentMethod: input.paymentMethod ?? "online",
      paymentStatus: "pending",
      notes: input.notes ?? "",
    });

    return { success: true, subscriptionId: created._id };
  } catch (error) {
    console.error("Failed to create subscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Subscription failed.",
    };
  }
}
