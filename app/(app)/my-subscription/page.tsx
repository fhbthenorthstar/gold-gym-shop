import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";
import { sanityFetch } from "@/sanity/lib/live";
import { SUBSCRIPTIONS_BY_USER_QUERY } from "@/lib/sanity/queries/subscriptions";
import { formatDate, formatPrice } from "@/lib/utils";
import { getSubscriptionStatus } from "@/lib/constants/subscriptionStatus";
import { formatPackageLocation, formatPackageTier } from "@/lib/utils/subscriptions";

interface SubscriptionPackage {
  title?: string | null;
  location?: string | null;
  tier?: string | null;
  durationLabel?: string | null;
  accessLabel?: string | null;
  slug?: string | null;
}

interface SubscriptionRecord {
  _id: string;
  subscriptionNumber?: string | null;
  price?: number | null;
  status?: string | null;
  paymentStatus?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  nextRenewalDate?: string | null;
  package?: SubscriptionPackage | null;
}

export default async function MySubscriptionPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="min-h-screen bg-black text-zinc-200">
        <section className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="font-heading text-3xl text-white">My Subscription</h1>
          <p className="mt-3 text-sm text-zinc-400">
            Sign in to view your membership details and renewal history.
          </p>
          <div className="mt-6">
            <SignInButton mode="modal">
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-primary/90"
              >
                Sign In
              </button>
            </SignInButton>
          </div>
        </section>
      </div>
    );
  }

  const { data } = await sanityFetch({
    query: SUBSCRIPTIONS_BY_USER_QUERY,
    params: { userId },
  });

  const subscriptions = (data as SubscriptionRecord[] | null) ?? [];
  const activeSubscription =
    subscriptions.find((sub) => sub.status === "active") ??
    subscriptions.find((sub) => sub.status === "pending") ??
    subscriptions[0] ??
    null;

  return (
    <div className="min-h-screen bg-black text-zinc-200">
      <section className="border-b border-zinc-900 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="font-heading text-3xl text-white">My Subscription</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Track your membership, renewals, and package history.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        {subscriptions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-10 text-center text-sm text-zinc-500">
            You don&apos;t have an active membership yet.
            <div className="mt-4">
              <Link
                href="/packages"
                className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-primary/90"
              >
                View Packages
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">
                Current Membership
              </p>
              <h2 className="font-heading mt-2 text-2xl text-white">
                {activeSubscription?.package?.title ?? "Membership Package"}
              </h2>
              <div className="mt-4 space-y-2 text-sm text-zinc-300">
                <p>
                  Location:{" "}
                  {formatPackageLocation(
                    activeSubscription?.package?.location ?? ""
                  )}
                </p>
                <p>
                  Tier:{" "}
                  {formatPackageTier(activeSubscription?.package?.tier ?? "")}
                </p>
                <p>
                  Duration:{" "}
                  {activeSubscription?.package?.durationLabel ?? "—"}
                </p>
                <p>
                  Access: {activeSubscription?.package?.accessLabel ?? "—"}
                </p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-800 bg-black/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Next Renewal
                  </p>
                  <p className="mt-2 text-lg text-white">
                    {formatDate(activeSubscription?.nextRenewalDate, "long", "—")}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-black/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Monthly Value
                  </p>
                  <p className="mt-2 text-lg text-white">
                    {formatPrice(activeSubscription?.price ?? 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">
                Subscription History
              </p>
              <div className="mt-4 space-y-4">
                {subscriptions.map((sub) => {
                  const status = getSubscriptionStatus(sub.status);
                  return (
                    <div
                      key={sub._id}
                      className="rounded-xl border border-zinc-800 bg-black/60 p-4 text-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">
                            {sub.package?.title ?? "Membership"}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {sub.subscriptionNumber ?? "Subscription"}
                          </p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-400">
                        <span>Start: {formatDate(sub.startDate, "short", "—")}</span>
                        <span>End: {formatDate(sub.endDate, "short", "—")}</span>
                        <span>Total: {formatPrice(sub.price ?? 0)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
