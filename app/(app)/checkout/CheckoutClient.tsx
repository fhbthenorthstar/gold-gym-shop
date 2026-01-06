"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ShoppingBag, AlertTriangle } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";
import {
  useCartItems,
  useTotalPrice,
  useTotalItems,
  useCartActions,
} from "@/lib/store/cart-store-provider";
import { useCartStock } from "@/lib/hooks/useCartStock";
import { createCodOrder } from "@/lib/actions/cod-order";
import { validateDiscount, type DiscountResolution } from "@/lib/actions/discount";
import { trackFacebookEvent } from "@/lib/analytics/facebook";
import {
  BANGLADESH_DIVISIONS,
  DEFAULT_COUNTRY,
  getShippingFee,
  FREE_SHIPPING_THRESHOLD,
} from "@/lib/constants/bangladesh";
import type { CUSTOMER_BY_CLERK_ID_QUERYResult } from "@/sanity.types";

interface CheckoutClientProps {
  isSignedIn: boolean;
  initialEmail: string;
  initialName: string;
  initialAddresses: NonNullable<
    NonNullable<CUSTOMER_BY_CLERK_ID_QUERYResult>["addresses"]
  >;
}

type CustomerAddress = NonNullable<
  NonNullable<CUSTOMER_BY_CLERK_ID_QUERYResult>["addresses"]
>[number];

type AddressFormState = {
  name: string;
  line1: string;
  division: string;
  country: string;
  phone: string;
};

const emptyAddress: AddressFormState = {
  name: "",
  line1: "",
  division: "",
  country: DEFAULT_COUNTRY,
  phone: "",
};

export function CheckoutClient({
  isSignedIn,
  initialEmail,
  initialName,
  initialAddresses,
}: CheckoutClientProps) {
  const router = useRouter();
  const items = useCartItems();
  const subtotal = useTotalPrice();
  const totalItems = useTotalItems();
  const { closeCart } = useCartActions();
  const { isLoading, hasStockIssues, stockMap } = useCartStock(items);
  const [isPending, startTransition] = useTransition();

  const addresses = useMemo(
    () => initialAddresses.filter(Boolean) as CustomerAddress[],
    [initialAddresses]
  );

  const defaultAddress = useMemo(() => {
    const savedDefault = addresses.find((address) => address?.isDefault);
    return savedDefault ?? addresses[0] ?? null;
  }, [addresses]);

  const [selectedAddressKey, setSelectedAddressKey] = useState<string | null>(
    defaultAddress?._key ?? null
  );
  const [addressForm, setAddressForm] = useState<AddressFormState>(() =>
    defaultAddress
      ? {
          name: defaultAddress.name ?? "",
          line1: defaultAddress.line1 ?? "",
          division: defaultAddress.division ?? "",
          country: defaultAddress.country ?? DEFAULT_COUNTRY,
          phone: defaultAddress.phone ?? "",
        }
      : { ...emptyAddress, name: initialName ?? "" }
  );
  const [email, setEmail] = useState(initialEmail ?? "");
  const [orderNotes, setOrderNotes] = useState("");
  const [saveAddress, setSaveAddress] = useState(isSignedIn);
  const [makeDefault, setMakeDefault] = useState(
    !!defaultAddress?.isDefault || addresses.length === 0
  );
  const [paymentMethod] = useState<"cod" | "online">("cod");
  const [formError, setFormError] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discountState, setDiscountState] =
    useState<DiscountResolution["discount"] | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [isApplyingDiscount, startDiscountTransition] = useTransition();
  const checkoutTrackedRef = useRef(false);
  const inputClassName =
    "h-11 rounded-md border-zinc-800 bg-black/60 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-primary";
  const selectTriggerClassName =
    "h-11 w-full border-zinc-800 bg-black/60 text-zinc-100";
  const selectContentClassName = "border-zinc-800 bg-zinc-950 text-zinc-200";

  const shippingFee = useMemo(
    () => getShippingFee(addressForm.division, subtotal),
    [addressForm.division, subtotal]
  );
  const discountAmount = discountState?.appliedAmount ?? 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const total = discountedSubtotal + shippingFee;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingLabel = addressForm.division
    ? shippingFee === 0
      ? "Free"
      : formatPrice(shippingFee)
    : "Select division";
  const isEmpty = items.length === 0;

  const handleSelectAddress = (address: CustomerAddress | null) => {
    if (!address) {
      setSelectedAddressKey(null);
      setAddressForm({ ...emptyAddress, name: initialName ?? "" });
      setMakeDefault(addresses.length === 0);
      return;
    }

    setSelectedAddressKey(address._key ?? null);
    setAddressForm({
      name: address.name ?? "",
      line1: address.line1 ?? "",
      division: address.division ?? "",
      country: address.country ?? DEFAULT_COUNTRY,
      phone: address.phone ?? "",
    });
    setMakeDefault(!!address.isDefault);
  };

  useEffect(() => {
    if (discountState && discountCode.trim() !== discountState.code) {
      setDiscountState(null);
    }
  }, [discountCode, discountState]);

  useEffect(() => {
    if (items.length > 0) return;
    closeCart();
    setDiscountState(null);
    setDiscountCode("");
    setDiscountError(null);
    setFormError(null);
    checkoutTrackedRef.current = false;
  }, [items.length, closeCart]);

  useEffect(() => {
    if (checkoutTrackedRef.current || items.length === 0) return;
    checkoutTrackedRef.current = true;

    const nameParts = addressForm.name.trim().split(" ").filter(Boolean);
    const [firstName, ...rest] = nameParts;
    const lastName = rest.join(" ");

    trackFacebookEvent("InitiateCheckout", {
      eventData: {
        currency: "BDT",
        value: subtotal,
        num_items: totalItems,
        content_type: "product",
        content_ids: items.map((item) => item.productId),
        contents: items.map((item) => ({
          id: item.productId,
          quantity: item.quantity,
          item_price: item.price,
        })),
      },
      userData: {
        email: email || undefined,
        phone: addressForm.phone || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      },
    });
  }, [items, subtotal, totalItems, email, addressForm.name, addressForm.phone]);

  const handleApplyDiscount = () => {
    setDiscountError(null);
    startDiscountTransition(async () => {
      const result = await validateDiscount(discountCode, subtotal);
      if (!result.success) {
        setDiscountState(null);
        setDiscountError(result.message ?? "Invalid discount code.");
        return;
      }
      setDiscountState(result.discount ?? null);
    });
  };

  const handleRemoveDiscount = () => {
    setDiscountState(null);
    setDiscountCode("");
    setDiscountError(null);
  };

  const handleSubmit = () => {
    setFormError(null);

    const required = [
      addressForm.name,
      addressForm.line1,
      addressForm.division,
      addressForm.phone,
    ];
    if (required.some((value) => !value.trim())) {
      setFormError("Please complete all required fields.");
      return;
    }

    startTransition(async () => {
      const result = await createCodOrder({
        items,
        address: {
          ...addressForm,
          country: DEFAULT_COUNTRY,
        },
        email,
        orderNotes,
        paymentMethod,
        discountCode: discountState?.code ?? undefined,
        saveAddress: isSignedIn ? saveAddress : false,
        makeDefault: isSignedIn ? makeDefault : false,
        addressKey: isSignedIn ? selectedAddressKey : null,
      });

      if (result.success && result.orderId) {
        router.push(`/checkout/success?orderId=${result.orderId}`);
        return;
      }

      setFormError(result.error ?? "Checkout failed.");
      console.log(result);
      toast.error("Checkout Error", {
        description: result.error ?? "Something went wrong",
      });
    });
  };

  if (isEmpty) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-zinc-500" />
          <h1 className="mt-6 text-2xl font-bold text-white">
            Your cart is empty
          </h1>
          <p className="mt-2 text-zinc-400">
            Add some items to your cart before checking out.
          </p>
          <Button asChild className="mt-8">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">
        <span>Shopping Cart</span>
        <span className="text-zinc-300">›</span>
        <span className="text-primary">Checkout Details</span>
        <span className="text-zinc-300">›</span>
        <span>Order Complete</span>
      </div>

      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-zinc-400 hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continue Shopping
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-white">Checkout</h1>
      </div>

      {!isSignedIn && (
        <div className="mb-4 text-sm text-zinc-400">
          Returning customer?{" "}
          <SignInButton mode="modal">
            <button type="button" className="text-primary underline">
              Click here to login
            </button>
          </SignInButton>
        </div>
      )}

      <div className="mb-6 text-sm text-zinc-400">
        Have a discount code? Apply it in your order summary.
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          {isSignedIn && addresses.length > 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
              <h2 className="text-base font-semibold text-white">
                Saved Addresses
              </h2>
              <div className="mt-4 grid gap-3">
                {addresses.map((address) => (
                  <button
                    key={address._key}
                    type="button"
                    onClick={() => handleSelectAddress(address)}
                    className={`rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                      selectedAddressKey === address._key
                        ? "border-primary/70 bg-primary/10 text-white"
                        : "border-zinc-800 bg-black/40 text-zinc-300 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {address.label || address.name || "Saved Address"}
                      </span>
                      {address.isDefault && (
                        <span className="text-xs text-primary">Default</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">
                      {[address.line1, address.division].filter(Boolean).join(", ")}
                    </p>
                    {address.phone && (
                      <p className="mt-1 text-xs text-zinc-400">{address.phone}</p>
                    )}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleSelectAddress(null)}
                  className={`rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                    selectedAddressKey === null
                      ? "border-primary/70 bg-primary/10 text-white"
                      : "border-dashed border-zinc-700 text-zinc-300 hover:border-primary/50"
                  }`}
                >
                  Use a new address
                </button>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <h2 className="text-base font-semibold text-white">
              Billing & Shipping
            </h2>

            <div className="mt-6 grid gap-5">
              <div>
                <Label
                  htmlFor="full-name"
                  className="text-xs uppercase tracking-[0.2em] text-zinc-400"
                >
                  Full Name *
                </Label>
                <Input
                  id="full-name"
                  value={addressForm.name}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Your name"
                  className={inputClassName}
                />
              </div>

              <div>
                <Label
                  htmlFor="address-line-1"
                  className="text-xs uppercase tracking-[0.2em] text-zinc-400"
                >
                  Address *
                </Label>
                <Input
                  id="address-line-1"
                  value={addressForm.line1}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      line1: event.target.value,
                    }))
                  }
                  placeholder="House number and street name"
                  className={inputClassName}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Division *
                  </Label>
                  <Select
                    value={addressForm.division}
                    onValueChange={(value) =>
                      setAddressForm((prev) => ({ ...prev, division: value }))
                    }
                  >
                    <SelectTrigger className={selectTriggerClassName}>
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent className={selectContentClassName}>
                      {BANGLADESH_DIVISIONS.map((division) => (
                        <SelectItem key={division} value={division}>
                          {division}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="phone"
                    className="text-xs uppercase tracking-[0.2em] text-zinc-400"
                  >
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    value={addressForm.phone}
                    onChange={(event) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="01XXXXXXXXX"
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label
                    htmlFor="email"
                    className="text-xs uppercase tracking-[0.2em] text-zinc-400"
                  >
                    Email (optional)
                  </Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@email.com"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="country"
                    className="text-xs uppercase tracking-[0.2em] text-zinc-400"
                  >
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={DEFAULT_COUNTRY}
                    disabled
                    className={`${inputClassName} bg-black/40 text-zinc-400`}
                  />
                </div>
              </div>

              {isSignedIn && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(event) => setSaveAddress(event.target.checked)}
                      className="h-4 w-4 rounded border-zinc-700 bg-black text-primary"
                    />
                    Save this address for next time
                  </label>
                  {saveAddress && (
                    <label className="flex items-center gap-2 text-sm text-zinc-300">
                      <input
                        type="checkbox"
                        checked={makeDefault}
                        onChange={(event) =>
                          setMakeDefault(event.target.checked)
                        }
                        className="h-4 w-4 rounded border-zinc-700 bg-black text-primary"
                      />
                      Make this my default address
                    </label>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
            <h2 className="text-base font-semibold text-white">
              Additional Information
            </h2>
            <div className="mt-4">
              <Label
                htmlFor="order-notes"
                className="text-xs uppercase tracking-[0.2em] text-zinc-400"
              >
                Order notes (optional)
              </Label>
              <Textarea
                id="order-notes"
                value={orderNotes}
                onChange={(event) => setOrderNotes(event.target.value)}
                placeholder="Notes about your order, e.g. special notes for delivery"
                className={inputClassName}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <h2 className="text-base font-semibold text-white">
              Your Order
            </h2>

            <div className="mt-4 space-y-4 border-b border-zinc-800 pb-4">
              {items.map((item) => {
                const itemImage = item.image ?? stockMap.get(item.id)?.imageUrl ?? undefined;

                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-black/60">
                      {itemImage ? (
                        <Image
                          src={itemImage}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-white">{item.name}</p>
                    {item.variant?.options?.length ? (
                      <p className="text-xs text-zinc-400">
                        {item.variant.options
                          .map((option) => `${option.name}: ${option.value}`)
                          .join(" / ")}
                      </p>
                    ) : null}
                    <p className="text-xs text-zinc-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-white">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-lg border border-zinc-800 bg-black/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Discount Code
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Input
                  value={discountCode}
                  onChange={(event) => setDiscountCode(event.target.value)}
                  placeholder="Enter discount code"
                  className={inputClassName}
                />
                <Button
                  onClick={handleApplyDiscount}
                  disabled={isApplyingDiscount || !discountCode.trim()}
                  className="bg-primary text-black hover:bg-primary/90"
                >
                  {isApplyingDiscount ? "Applying..." : "Apply"}
                </Button>
                {discountState && (
                  <Button
                    variant="outline"
                    onClick={handleRemoveDiscount}
                    className="border-zinc-700 text-zinc-200 hover:bg-zinc-900"
                  >
                    Remove
                  </Button>
                )}
              </div>
              {discountError && (
                <p className="mt-2 text-xs text-red-400">{discountError}</p>
              )}
              {discountState && (
                <p className="mt-2 text-xs text-green-400">
                  {discountState.title} applied • Save{" "}
                  {formatPrice(discountState.appliedAmount)}
                </p>
              )}
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Subtotal</span>
                <span className="text-white">
                  {formatPrice(subtotal)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">
                    Discount ({discountState?.code ?? "Applied"})
                  </span>
                  <span className="text-green-400">
                    -{formatPrice(discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-400">Shipping</span>
                <span className="text-white">
                  {shippingLabel}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Dhaka delivery: ৳60 • Outside Dhaka: ৳100 • Free over{" "}
                {formatPrice(FREE_SHIPPING_THRESHOLD)}
              </p>
              <div className="border-t border-zinc-800 pt-3">
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-white">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4 border-t border-zinc-800 pt-4">
              <div className="space-y-2">
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="radio"
                    checked={paymentMethod === "cod"}
                    readOnly
                    className="mt-1 h-4 w-4 text-primary"
                  />
                  <span>
                    <span className="font-semibold text-white">
                      Cash on Delivery
                    </span>
                    <span className="mt-1 block text-xs text-zinc-400">
                      Inside Dhaka: Cash on Delivery. Outside Dhaka: partial advance payment is required.
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm text-zinc-500">
                  <input type="radio" disabled className="mt-1 h-4 w-4" />
                  <span>
                    <span className="font-semibold">Pay Online</span>
                    <span className="mt-1 block text-xs">
                      Online payment is coming soon.
                    </span>
                  </span>
                </label>
              </div>

              {hasStockIssues && !isLoading && (
                <div className="flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  Some items have stock issues. Please update your cart.
                </div>
              )}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying stock...
                </div>
              )}

              {formError && (
                <p className="text-xs text-red-400">{formError}</p>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isPending || hasStockIssues || isLoading}
                className="w-full bg-primary text-black hover:bg-primary/80"
                size="lg"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing order...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </div>

            <p className="mt-4 text-center text-xs text-zinc-400">
              By placing your order, you agree to our terms and conditions.
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 text-xs text-zinc-400">
            Order Summary ({totalItems} items)
          </div>
        </div>
      </div>
    </div>
  );
}
