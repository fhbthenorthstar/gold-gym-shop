"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarDays, CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/utils";
import { formatPackageLocation, formatPackageTier } from "@/lib/utils/subscriptions";
import { createSubscription } from "@/lib/actions/subscription";
import type { SubscriptionPaymentMethod } from "@/lib/constants/subscriptionPayments";

interface SubscriptionPackage {
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
}

interface SubscriptionCheckoutClientProps {
  pkg: SubscriptionPackage;
  initialName: string;
  initialEmail: string;
}

export function SubscriptionCheckoutClient({
  pkg,
  initialName,
  initialEmail,
}: SubscriptionCheckoutClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0] ?? "";
  });
  const [paymentMethod, setPaymentMethod] =
    useState<SubscriptionPaymentMethod>("offline");
  const [error, setError] = useState<string | null>(null);

  const price = useMemo(() => {
    if (typeof pkg.offerPrice === "number") return pkg.offerPrice;
    return pkg.packagePrice ?? 0;
  }, [pkg.offerPrice, pkg.packagePrice]);

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await createSubscription({
        packageSlug: pkg.slug ?? pkg._id,
        startDate,
        phone,
        notes,
        paymentMethod,
      });

      if (!result.success) {
        setError(result.error ?? "Unable to create subscription.");
        return;
      }

      toast.success("Subscription request submitted");
      if (result.subscriptionId) {
        router.push(
          `/packages/checkout/success?subscriptionId=${result.subscriptionId}`
        );
      } else {
        router.push("/my-subscription");
      }
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
          <h2 className="font-heading text-xl text-white">
            Subscriber Details
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Confirm your details and lock in your membership start date.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Full Name
              </Label>
              <Input
                value={initialName}
                readOnly
                className="border-zinc-800 bg-black/60 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Email
              </Label>
              <Input
                value={initialEmail}
                readOnly
                className="border-zinc-800 bg-black/60 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Phone Number
              </Label>
              <Input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="01XXXXXXXXX"
                className="border-zinc-800 bg-black/60 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Start Date
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="border-zinc-800 bg-black/60 text-zinc-100"
              />
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <Label className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              Notes for the team
            </Label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Let us know your goals or preferred training time."
              className="border-zinc-800 bg-black/60 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
          <h3 className="font-heading text-lg text-white">Payment</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Online payment will be available soon. Choose onsite payment for
            now.
          </p>

          <div className="mt-5 space-y-4">
            <label className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-zinc-100">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "offline"}
                onChange={() => setPaymentMethod("offline")}
                className="accent-black"
              />
              <div className="flex-1">
                <p className="font-semibold text-primary">Onsite payment</p>
                <p className="text-xs text-zinc-400">
                  Pay at the club once your membership is confirmed.
                </p>
              </div>
              <CreditCard className="h-5 w-5 text-primary" />
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-black/40 p-4 text-sm text-zinc-500 opacity-70">
              <input type="radio" disabled className="accent-black" />
              <div className="flex-1">
                <p className="font-semibold">Online payment (disabled)</p>
                <p className="text-xs text-zinc-600">
                  bKash, Nagad, and card payments will go live soon.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                Selected Package
              </p>
              <h3 className="font-heading text-lg text-white">
                {pkg.title ?? "Gold's Gym Package"}
              </h3>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm text-zinc-300">
            <p>
              Location: {formatPackageLocation(pkg.location ?? "")}
            </p>
            <p>Tier: {formatPackageTier(pkg.tier ?? "")}</p>
            <p>Duration: {pkg.durationLabel ?? "1 Month"}</p>
            <p>Access: {pkg.accessLabel ?? "Full access"}</p>
          </div>

          <div className="mt-6 border-t border-zinc-800 pt-4">
            <div className="flex items-center justify-between text-sm text-zinc-400">
              <span>Offer price</span>
              <span>{formatPrice(price)}</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-lg font-semibold text-white">
              <span>Total due today</span>
              <span>{formatPrice(price)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="h-12 w-full bg-primary text-black hover:bg-primary/90"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirm Membership
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
