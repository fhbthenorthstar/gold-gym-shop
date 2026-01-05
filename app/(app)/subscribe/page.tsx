import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";
import { sanityFetch } from "@/sanity/lib/live";
import { SUBSCRIPTION_PACKAGE_BY_SLUG_QUERY } from "@/lib/sanity/queries/subscriptions";
import { SubscriptionCheckoutClient } from "../packages/checkout/SubscriptionCheckoutClient";

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

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: { package?: string };
}) {
  const packageSlug = searchParams.package;
  if (!packageSlug) {
    return (
      <div className="min-h-screen bg-black text-zinc-200">
        <section className="border-b border-zinc-900 py-16">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-primary">
              Gold&apos;s Gym BD Memberships
            </p>
            <h1 className="font-heading mt-4 text-3xl text-white sm:text-4xl">
              Choose Your Subscription Package
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400">
              Start by selecting a membership package that matches your goals
              and preferred club location.
            </p>
            <Link
              href="/packages"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-primary/90"
            >
              View Membership Packages
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const packageResult = await sanityFetch({
    query: SUBSCRIPTION_PACKAGE_BY_SLUG_QUERY,
    params: { slug: packageSlug },
  });
  const pkg = packageResult.data as SubscriptionPackage | null;

  if (!pkg?._id) {
    return (
      <div className="min-h-screen bg-black text-zinc-200">
        <section className="border-b border-zinc-900 py-16">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-primary">
              Package not found
            </p>
            <h1 className="font-heading mt-4 text-3xl text-white sm:text-4xl">
              We couldn&apos;t find that subscription
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400">
              Please choose another membership package and try again.
            </p>
            <Link
              href="/packages"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-primary/90"
            >
              Browse Packages
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const initialName =
    user?.fullName || `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  const initialEmail = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <div className="min-h-screen bg-black text-zinc-200">
      <section className="border-b border-zinc-900 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <Link
            href="/packages"
            className="text-sm text-zinc-400 hover:text-primary"
          >
            ← Back to packages
          </Link>
          <h1 className="font-heading mt-4 text-2xl text-white sm:text-3xl">
            Membership Subscription
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Lock in your membership today. Our team will confirm activation and
            onboarding within 24 hours.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        {!userId ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-8 text-center">
            <h2 className="font-heading text-xl text-white">
              Sign in to continue
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Create an account to subscribe, manage renewals, and track your
              membership history.
            </p>
            <div className="mt-6">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-primary/90"
                >
                  Sign In to Subscribe
                </button>
              </SignInButton>
            </div>
          </div>
        ) : (
          <SubscriptionCheckoutClient
            pkg={pkg}
            initialName={initialName}
            initialEmail={initialEmail}
          />
        )}
      </section>
    </div>
  );
}
