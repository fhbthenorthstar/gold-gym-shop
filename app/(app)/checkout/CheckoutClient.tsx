"use client";

import { useMemo, useState, useTransition } from "react";
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
} from "@/lib/store/cart-store-provider";
import { useCartStock } from "@/lib/hooks/useCartStock";
import { createCodOrder } from "@/lib/actions/cod-order";
import {
  BANGLADESH_DIVISIONS,
  DEFAULT_COUNTRY,
  getShippingFee,
} from "@/lib/constants/bangladesh";
import type { CUSTOMER_BY_CLERK_ID_QUERYResult } from "@/sanity.types";

interface CheckoutClientProps {
  isSignedIn: boolean;
  initialEmail: string;
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
  line2: string;
  division: string;
  postcode: string;
  country: string;
  phone: string;
};

const emptyAddress: AddressFormState = {
  name: "",
  line1: "",
  line2: "",
  division: "",
  postcode: "",
  country: DEFAULT_COUNTRY,
  phone: "",
};

export function CheckoutClient({
  isSignedIn,
  initialEmail,
  initialAddresses,
}: CheckoutClientProps) {
  const router = useRouter();
  const items = useCartItems();
  const subtotal = useTotalPrice();
  const totalItems = useTotalItems();
  const { isLoading, hasStockIssues } = useCartStock(items);
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
          line2: defaultAddress.line2 ?? "",
          division: defaultAddress.division ?? "",
          postcode: defaultAddress.postcode ?? "",
          country: defaultAddress.country ?? DEFAULT_COUNTRY,
          phone: defaultAddress.phone ?? "",
        }
      : { ...emptyAddress }
  );
  const [email, setEmail] = useState(initialEmail ?? "");
  const [orderNotes, setOrderNotes] = useState("");
  const [saveAddress, setSaveAddress] = useState(isSignedIn);
  const [makeDefault, setMakeDefault] = useState(
    !!defaultAddress?.isDefault || addresses.length === 0
  );
  const [paymentMethod] = useState<"cod" | "online">("cod");
  const [formError, setFormError] = useState<string | null>(null);

  const shippingFee = useMemo(
    () => getShippingFee(addressForm.division),
    [addressForm.division]
  );
  const total = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-600" />
          <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Your cart is empty
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Add some items to your cart before checking out.
          </p>
          <Button asChild className="mt-8">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleSelectAddress = (address: CustomerAddress | null) => {
    if (!address) {
      setSelectedAddressKey(null);
      setAddressForm({ ...emptyAddress });
      setMakeDefault(addresses.length === 0);
      return;
    }

    setSelectedAddressKey(address._key ?? null);
    setAddressForm({
      name: address.name ?? "",
      line1: address.line1 ?? "",
      line2: address.line2 ?? "",
      division: address.division ?? "",
      postcode: address.postcode ?? "",
      country: address.country ?? DEFAULT_COUNTRY,
      phone: address.phone ?? "",
    });
    setMakeDefault(!!address.isDefault);
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-400">
        <span>Shopping Cart</span>
        <span className="text-zinc-300">›</span>
        <span className="text-zinc-900 dark:text-zinc-100">
          Checkout Details
        </span>
        <span className="text-zinc-300">›</span>
        <span>Order Complete</span>
      </div>

      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continue Shopping
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Checkout
        </h1>
      </div>

      {!isSignedIn && (
        <div className="mb-4 text-sm text-zinc-500">
          Returning customer?{" "}
          <SignInButton mode="modal">
            <button type="button" className="text-zinc-900 underline">
              Click here to login
            </button>
          </SignInButton>
        </div>
      )}

      <div className="mb-6 text-sm text-zinc-500">
        Have a coupon?{" "}
        <span className="text-zinc-900">Click here to enter your code</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          {isSignedIn && addresses.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
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
                        ? "border-zinc-900 bg-zinc-50 text-zinc-900"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {address.label || address.name || "Saved Address"}
                      </span>
                      {address.isDefault && (
                        <span className="text-xs text-emerald-600">Default</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {[address.line1, address.division].filter(Boolean).join(", ")}
                    </p>
                    {address.phone && (
                      <p className="mt-1 text-xs text-zinc-500">{address.phone}</p>
                    )}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleSelectAddress(null)}
                  className={`rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                    selectedAddressKey === null
                      ? "border-zinc-900 bg-zinc-50 text-zinc-900"
                      : "border-dashed border-zinc-200 text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  Use a new address
                </button>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Billing & Shipping
            </h2>

            <div className="mt-5 grid gap-4">
              <div>
                <Label htmlFor="full-name">Full Name *</Label>
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
                />
              </div>

              <div>
                <Label htmlFor="address-line-1">Address *</Label>
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
                />
              </div>

              <div>
                <Label htmlFor="address-line-2">Address Line 2</Label>
                <Input
                  id="address-line-2"
                  value={addressForm.line2}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      line2: event.target.value,
                    }))
                  }
                  placeholder="Apartment, suite, unit, etc."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Division *</Label>
                  <Select
                    value={addressForm.division}
                    onValueChange={(value) =>
                      setAddressForm((prev) => ({ ...prev, division: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      {BANGLADESH_DIVISIONS.map((division) => (
                        <SelectItem key={division} value={division}>
                          {division}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    value={addressForm.postcode}
                    onChange={(event) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        postcode: event.target.value,
                      }))
                    }
                    placeholder="Postcode"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Phone *</Label>
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
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={DEFAULT_COUNTRY} disabled />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@email.com"
                />
              </div>

              {isSignedIn && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-zinc-600">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(event) => setSaveAddress(event.target.checked)}
                      className="h-4 w-4"
                    />
                    Save this address for next time
                  </label>
                  {saveAddress && (
                    <label className="flex items-center gap-2 text-sm text-zinc-600">
                      <input
                        type="checkbox"
                        checked={makeDefault}
                        onChange={(event) =>
                          setMakeDefault(event.target.checked)
                        }
                        className="h-4 w-4"
                      />
                      Make this my default address
                    </label>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Additional Information
            </h2>
            <div className="mt-4">
              <Label htmlFor="order-notes">Order notes (optional)</Label>
              <Textarea
                id="order-notes"
                value={orderNotes}
                onChange={(event) => setOrderNotes(event.target.value)}
                placeholder="Notes about your order, e.g. special notes for delivery"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Your Order
            </h2>

            <div className="mt-4 space-y-4 border-b border-zinc-200 pb-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                    {item.image ? (
                      <Image
                        src={item.image}
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
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {item.name}
                    </p>
                    {item.variant?.options?.length ? (
                      <p className="text-xs text-zinc-500">
                        {item.variant.options
                          .map((option) => `${option.name}: ${option.value}`)
                          .join(" / ")}
                      </p>
                    ) : null}
                    <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Subtotal</span>
                <span className="text-zinc-900 dark:text-zinc-100">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Shipping</span>
                <span className="text-zinc-900 dark:text-zinc-100">
                  {shippingFee > 0
                    ? formatPrice(shippingFee)
                    : "Calculated at checkout"}
                </span>
              </div>
              <div className="border-t border-zinc-200 pt-3">
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-zinc-900 dark:text-zinc-100">Total</span>
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4 border-t border-zinc-200 pt-4">
              <div className="space-y-2">
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="radio"
                    checked={paymentMethod === "cod"}
                    readOnly
                    className="mt-1 h-4 w-4"
                  />
                  <span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Cash on Delivery
                    </span>
                    <span className="mt-1 block text-xs text-zinc-500">
                      Inside Dhaka: Cash on Delivery. Outside Dhaka: partial advance payment is required.
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm text-zinc-400">
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
                <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  Some items have stock issues. Please update your cart.
                </div>
              )}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying stock...
                </div>
              )}

              {formError && (
                <p className="text-xs text-red-600">{formError}</p>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isPending || hasStockIssues || isLoading}
                className="w-full bg-lime-500 text-white hover:bg-lime-600"
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

            <p className="mt-4 text-center text-xs text-zinc-500">
              By placing your order, you agree to our terms and conditions.
            </p>
          </div>

          <div className="mt-6 rounded-lg border border-zinc-100 bg-zinc-50 p-4 text-xs text-zinc-500">
            Order Summary ({totalItems} items)
          </div>
        </div>
      </div>
    </div>
  );
}
