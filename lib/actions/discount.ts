"use server";

import { client, writeClient } from "@/sanity/lib/client";
import { DISCOUNT_BY_CODE_QUERY } from "@/lib/sanity/queries/discounts";

type DiscountDocument = {
  _id: string;
  title?: string | null;
  code?: string | null;
  type?: "percentage" | "fixed" | null;
  amount?: number | null;
  minSubtotal?: number | null;
  maxDiscount?: number | null;
  active?: boolean | null;
  startsAt?: string | null;
  endsAt?: string | null;
  maxUses?: number | null;
  usedCount?: number | null;
};

export type DiscountResolution = {
  success: boolean;
  message?: string;
  discount?: {
    id: string;
    title: string;
    code: string;
    type: "percentage" | "fixed";
    value: number;
    appliedAmount: number;
  };
};

const normalizeCode = (code: string) => code.trim();

const resolveDiscountDoc = async (code: string) => {
  if (!code.trim()) return null;
  return client.fetch<DiscountDocument>(DISCOUNT_BY_CODE_QUERY, {
    code: normalizeCode(code),
  });
};

const computeDiscountAmount = (
  doc: DiscountDocument,
  subtotal: number
): number => {
  const amountValue = doc.amount ?? 0;
  if (doc.type === "percentage") {
    const rawAmount = (subtotal * amountValue) / 100;
    if (doc.maxDiscount && rawAmount > doc.maxDiscount) {
      return doc.maxDiscount;
    }
    return rawAmount;
  }

  return amountValue;
};

export const validateDiscount = async (
  code: string,
  subtotal: number
): Promise<DiscountResolution> => {
  const trimmedCode = normalizeCode(code);
  if (!trimmedCode) {
    return { success: false, message: "Enter a discount code to apply." };
  }

  const doc = await resolveDiscountDoc(trimmedCode);
  if (!doc?._id) {
    return { success: false, message: "Invalid discount code." };
  }

  if (doc.active === false) {
    return { success: false, message: "This discount code is inactive." };
  }

  if (doc.startsAt && Date.now() < new Date(doc.startsAt).getTime()) {
    return { success: false, message: "This discount code is not active yet." };
  }

  if (doc.endsAt && Date.now() > new Date(doc.endsAt).getTime()) {
    return { success: false, message: "This discount code has expired." };
  }

  if (typeof doc.minSubtotal === "number" && subtotal < doc.minSubtotal) {
    return {
      success: false,
      message: `Spend more to use this discount (minimum ৳${doc.minSubtotal}).`,
    };
  }

  if (
    typeof doc.maxUses === "number" &&
    typeof doc.usedCount === "number" &&
    doc.usedCount >= doc.maxUses
  ) {
    return { success: false, message: "This discount code has reached its limit." };
  }

  const appliedAmount = Math.max(
    0,
    Math.min(subtotal, computeDiscountAmount(doc, subtotal))
  );

  if (appliedAmount <= 0) {
    return { success: false, message: "This discount does not apply." };
  }

  return {
    success: true,
    discount: {
      id: doc._id,
      title: doc.title ?? doc.code ?? "Discount",
      code: doc.code ?? trimmedCode,
      type: doc.type ?? "fixed",
      value: doc.amount ?? appliedAmount,
      appliedAmount,
    },
  };
};

export const incrementDiscountUsage = async (discountId: string) => {
  if (!discountId) return;
  await writeClient
    .patch(discountId)
    .setIfMissing({ usedCount: 0 })
    .inc({ usedCount: 1 })
    .commit();
};
