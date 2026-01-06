import Image from "next/image";
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

interface TrainingItem {
  _id?: string;
  title?: string | null;
  link?: string | null;
  image?: {
    asset?: {
      _id?: string;
      url?: string | null;
    };
    hotspot?: unknown;
  } | null;
}

const TRAININGS_QUERY = `*[_type == "training"] | order(order asc, title asc) {
  _id,
  title,
  link,
  "image": image{
    asset->{
      _id,
      url
    },
    hotspot
  }
}`;

const isExternalUrl = (value?: string | null) =>
  !!value?.startsWith("http://") || !!value?.startsWith("https://");

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

  const [trainingsResult, subscriptionsResult] = await Promise.all([
    sanityFetch({ query: TRAININGS_QUERY }),
    sanityFetch({
      query: SUBSCRIPTIONS_BY_USER_QUERY,
      params: { userId },
    }),
  ]);

  const trainings = (trainingsResult.data as TrainingItem[] | null) ?? [];
  const subscriptions =
    (subscriptionsResult.data as SubscriptionRecord[] | null) ?? [];
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
            <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-primary p-6 text-black shadow-[0_20px_60px_rgba(253,233,21,0.25)]">
              <div className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full bg-black/90">
                <Image
                  src="/Gold's_Gym_logo.png"
                  alt="Gold's Gym BD"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/70">
                Current Membership
              </p>
              <h2 className="font-heading mt-2 text-2xl text-black">
                {activeSubscription?.package?.title ?? "Membership Package"}
              </h2>
              <div className="mt-4 space-y-2 text-sm text-black/80">
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
                <div className="rounded-xl border border-black/70 bg-black/90 p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-primary/80">
                    Next Renewal
                  </p>
                  <p className="mt-2 text-lg text-white">
                    {formatDate(activeSubscription?.nextRenewalDate, "long", "—")}
                  </p>
                </div>
                <div className="rounded-xl border border-black/70 bg-black/90 p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-primary/80">
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

        {trainings.length > 0 && (
          <section className="pt-12">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-primary">
                Trainings We Offer
              </p>
              <h2 className="font-heading mt-3 text-2xl text-white sm:text-3xl">
                Stay Sharp.{" "}
                <span className="text-primary">Train With Purpose.</span>
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Explore the programs available with your membership.
              </p>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {trainings.map((item, index) => {
                const imageUrl = item.image?.asset?.url ?? "";
                const href = item.link || "/shop";
                const content = (
                  <>
                    <div className="relative h-44 w-full sm:h-52">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.title ?? "Training"}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                          Image coming soon
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-4 flex justify-center">
                      <span className="font-heading text-sm text-white">
                        {item.title ?? "Training"}
                      </span>
                    </div>
                  </>
                );

                return isExternalUrl(href) ? (
                  <a
                    key={item._id ?? item.title ?? index}
                    href={href}
                    className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/40"
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={item._id ?? item.title ?? index}
                    href={href}
                    className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/40"
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </section>
    </div>
  );
}
