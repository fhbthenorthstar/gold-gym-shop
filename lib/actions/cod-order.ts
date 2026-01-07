"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { client, writeClient } from "@/sanity/lib/client";
import { PRODUCTS_BY_IDS_QUERY } from "@/lib/sanity/queries/products";
import { CUSTOMER_BY_CLERK_ID_QUERY } from "@/lib/sanity/queries/customers";
import { DEFAULT_COUNTRY, BANGLADESH_DIVISIONS, getShippingFee } from "@/lib/constants/bangladesh";
import { DEFAULT_STOCK_FALLBACK } from "@/lib/constants/stock";
import {
  validateDiscount,
  incrementDiscountUsage,
  type DiscountResolution,
} from "@/lib/actions/discount";
import type { CartItem } from "@/lib/store/cart-store";
import type { CUSTOMER_BY_CLERK_ID_QUERYResult } from "@/sanity.types";
import { getVariantBySelectedOptions } from "@/lib/utils/product-variants";

export interface CheckoutAddressInput {
  name: string;
  line1: string;
  line2?: string;
  division: string;
  postcode?: string;
  country?: string;
  phone: string;
}

export interface CreateCodOrderInput {
  items: CartItem[];
  address: CheckoutAddressInput;
  email?: string;
  orderNotes?: string;
  paymentMethod?: "cod" | "online";
  discountCode?: string;
  saveAddress?: boolean;
  makeDefault?: boolean;
  addressKey?: string | null;
}

interface CreateCodOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

type CustomerRecord = NonNullable<CUSTOMER_BY_CLERK_ID_QUERYResult>;
type CustomerAddress = NonNullable<CustomerRecord["addresses"]>[number];

const isValidDivision = (division: string) =>
  BANGLADESH_DIVISIONS.includes(division as (typeof BANGLADESH_DIVISIONS)[number]);

const normalizeAddress = (address: CheckoutAddressInput) => ({
  ...address,
  country: DEFAULT_COUNTRY,
  line2: address.line2 ?? "",
  postcode: address.postcode ?? "",
});

const buildAddressEntry = (
  address: CheckoutAddressInput,
  existing: CustomerAddress | null,
  makeDefault: boolean,
  hasDefault: boolean,
  addressKey?: string | null
): CustomerAddress => {
  const key = addressKey || existing?._key || crypto.randomUUID();
  const shouldBeDefault = makeDefault || (!hasDefault && !existing);

  return {
    _key: key,
    label: existing?.label ?? undefined,
    name: address.name,
    line1: address.line1,
    line2: address.line2 ?? "",
    division: address.division,
    postcode: address.postcode ?? "",
    country: DEFAULT_COUNTRY,
    phone: address.phone,
    isDefault: shouldBeDefault || existing?.isDefault || false,
  } as CustomerAddress;
};

export async function createCodOrder(
  input: CreateCodOrderInput
): Promise<CreateCodOrderResult> {
  try {
    const { userId } = await auth();
    const user = userId ? await currentUser() : null;

    if (!input.items || input.items.length === 0) {
      return { success: false, error: "Your cart is empty." };
    }

    const requiredFields = [
      input.address.name,
      input.address.line1,
      input.address.division,
      input.address.phone,
    ];
    if (requiredFields.some((value) => !value || !value.trim())) {
      return { success: false, error: "Please complete all required fields." };
    }

    if (!isValidDivision(input.address.division)) {
      return { success: false, error: "Please select a valid division." };
    }

    const address = normalizeAddress(input.address);
    const productIds = input.items.map((item) => item.productId);
    const products = await client.fetch(PRODUCTS_BY_IDS_QUERY, {
      ids: productIds,
    });

    type ProductResult = (typeof products)[number];

    const getVariantLabel = (variant: CartItem["variant"]) => {
      if (!variant?.options?.length) return "";
      return variant.options
        .map((opt) => `${opt.name}: ${opt.value}`)
        .join(" / ");
    };

    const resolveVariantForItem = (
      product: ProductResult,
      item: CartItem
    ) => {
      if (!product?.variants?.length || !item.variant) return null;

      if (item.variant._key) {
        const match =
          product.variants?.find(
            (variant: { _key?: string | null }) =>
              variant?._key === item.variant?._key
          ) ?? null;
        if (match) return match;
      }

      if (item.variant.sku) {
        const match =
          product.variants?.find(
            (variant: { sku?: string | null }) =>
              variant?.sku === item.variant?.sku
          ) ?? null;
        if (match) return match;
      }

      if (!item.variant.options?.length) {
        return null;
      }

      const selectedOptions =
        item.variant.options?.reduce<Record<string, string>>((acc, option) => {
          acc[option.name] = option.value;
          return acc;
        }, {}) ?? {};

      return getVariantBySelectedOptions(product, selectedOptions);
    };

    type ResolvedVariant = ReturnType<typeof resolveVariantForItem>;
    const validationErrors: string[] = [];
    const validatedItems: {
      product: ProductResult;
      quantity: number;
      lineItem: CartItem;
      variant?: ResolvedVariant;
    }[] = [];

    for (const item of input.items) {
      const product = products.find(
        (p: { _id: string }) => p._id === item.productId
      );

      if (!product) {
        validationErrors.push(`Product "${item.name}" is no longer available`);
        continue;
      }

      const variant = resolveVariantForItem(product, item);
      const baseStock =
        typeof product.stock === "number"
          ? product.stock
          : DEFAULT_STOCK_FALLBACK;
      const currentStock =
        variant && typeof variant.stock === "number"
          ? variant.stock
          : baseStock;
      const variantLabel = getVariantLabel(item.variant);
      const displayName = variantLabel
        ? `${product.name} (${variantLabel})`
        : product.name;

      if (currentStock === 0) {
        validationErrors.push(`"${displayName}" is out of stock`);
        continue;
      }

      if (item.quantity > currentStock) {
        validationErrors.push(
          `Only ${currentStock} of "${displayName}" available`
        );
        continue;
      }

      validatedItems.push({
        product,
        quantity: item.quantity,
        lineItem: item,
        variant,
      });
    }

    if (validationErrors.length > 0) {
      return { success: false, error: validationErrors.join(". ") };
    }

    const subtotal = validatedItems.reduce(
      (sum, item) => sum + (item.lineItem.price ?? 0) * item.quantity,
      0
    );
    const shippingFee = getShippingFee(address.division, subtotal);
    let discountAmount = 0;
    let discountMeta: DiscountResolution["discount"] | null = null;

    if (input.discountCode) {
      const discountResult = await validateDiscount(input.discountCode, subtotal);
      if (!discountResult.success) {
        return {
          success: false,
          error: discountResult.message ?? "Invalid discount code.",
        };
      }
      discountMeta = discountResult.discount ?? null;
      discountAmount = discountMeta?.appliedAmount ?? 0;
    }

    const total = Math.max(0, subtotal - discountAmount) + shippingFee;

    const userEmail = user?.emailAddresses[0]?.emailAddress ?? "";
    const userName =
      `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || userEmail;
    const orderEmail = input.email?.trim() || userEmail;

    let customerId: string | null = null;
    if (userId && input.saveAddress) {
      const customer = await client.fetch<CustomerRecord>(
        CUSTOMER_BY_CLERK_ID_QUERY,
        {
          clerkUserId: userId,
        }
      );

      const existingAddresses = (customer?.addresses ?? []).filter(
        Boolean
      ) as CustomerAddress[];
      const existingAddress = input.addressKey
        ? existingAddresses.find((addr) => addr._key === input.addressKey) ?? null
        : null;
      const hasDefault = existingAddresses.some((addr) => addr.isDefault);

      const nextAddress = buildAddressEntry(
        address,
        existingAddress ?? null,
        !!input.makeDefault,
        hasDefault,
        input.addressKey
      );

      let nextAddresses = existingAddresses.map((addr) =>
        addr._key === nextAddress._key ? nextAddress : addr
      );
      if (!existingAddress) {
        nextAddresses = [...nextAddresses, nextAddress];
      }

      if (nextAddress.isDefault) {
        nextAddresses = nextAddresses.map((addr) =>
          addr._key === nextAddress._key
            ? { ...addr, isDefault: true }
            : { ...addr, isDefault: false }
        );
      }

      if (customer?._id) {
        await writeClient
          .patch(customer._id)
          .set({
            addresses: nextAddresses,
            email: customer.email ?? orderEmail ?? "",
            name: customer.name ?? userName ?? address.name,
            clerkUserId: userId,
          })
          .commit();
        customerId = customer._id;
      } else {
        const newCustomer = await writeClient.create({
          _type: "customer",
          email: orderEmail ?? "",
          name: userName || address.name,
          clerkUserId: userId,
          addresses: nextAddresses,
          createdAt: new Date().toISOString(),
        });
        customerId = newCustomer._id;
      }
    } else if (userId) {
      const customer = await client.fetch<CustomerRecord>(
        CUSTOMER_BY_CLERK_ID_QUERY,
        {
          clerkUserId: userId,
        }
      );
      customerId = customer?._id ?? null;
    }

    const orderItems = validatedItems.map((item, index) => ({
      _key: `item-${index}-${crypto.randomUUID()}`,
      product: {
        _type: "reference" as const,
        _ref: item.product._id,
      },
      quantity: item.quantity,
      priceAtPurchase: item.lineItem.price ?? 0,
      variantSku: item.lineItem.variant?.sku ?? item.variant?.sku ?? null,
      variantTitle: item.lineItem.variant
        ? getVariantLabel(item.lineItem.variant)
        : null,
      variantOptions: item.lineItem.variant?.options?.map((option) => ({
        name: option.name,
        value: option.value,
      })) ?? [],
    }));

    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    const paymentMethod = input.paymentMethod ?? "cod";
    const order = await writeClient.create({
      _type: "order",
      orderNumber,
      ...(customerId && {
        customer: {
          _type: "reference",
          _ref: customerId,
        },
      }),
      ...(userId && { clerkUserId: userId }),
      email: orderEmail ?? "",
      items: orderItems,
      subtotal,
      shippingFee,
      discountCode: discountMeta?.code ?? null,
      discountTitle: discountMeta?.title ?? null,
      discountType: discountMeta?.type ?? null,
      discountValue: discountMeta?.value ?? null,
      discountAmount: discountAmount || null,
      discountRef: discountMeta?.id
        ? {
            _type: "reference",
            _ref: discountMeta.id,
          }
        : undefined,
      total,
      status: paymentMethod === "online" ? "paid" : "cod",
      paymentMethod,
      orderNotes: input.orderNotes ?? "",
      address: {
        name: address.name,
        line1: address.line1,
        line2: address.line2 ?? "",
        division: address.division,
        postcode: address.postcode ?? "",
        country: DEFAULT_COUNTRY,
        phone: address.phone,
      },
      createdAt: new Date().toISOString(),
    });

    try {
      await validatedItems
        .reduce((tx, item) => {
          if (item.variant?._key) {
            return tx.patch(item.product._id, (p) =>
              p.dec({
                [`variants[_key==\"${item.variant?._key}\"].stock`]:
                  item.quantity,
              })
            );
          }

          return tx.patch(item.product._id, (p) =>
            p.dec({ stock: item.quantity })
          );
        }, writeClient.transaction())
        .commit();
    } catch (error) {
      console.error("Stock update failed after order creation:", error);
    }

    if (discountMeta?.id) {
      try {
        await incrementDiscountUsage(discountMeta.id);
      } catch (error) {
        console.error("Failed to increment discount usage:", error);
      }
    }

    return { success: true, orderId: order._id };
  } catch (error) {
    console.error("COD order error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
