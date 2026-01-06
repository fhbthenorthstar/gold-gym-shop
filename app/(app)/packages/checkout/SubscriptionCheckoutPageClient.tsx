"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SignInButton, useUser } from "@clerk/nextjs";
import { client } from "@/sanity/lib/client";
import {
  SUBSCRIPTION_PACKAGES_QUERY,
  SUBSCRIPTION_PACKAGE_BY_SLUG_QUERY,
} from "@/lib/sanity/queries/subscriptions";
import { formatPrice } from "@/lib/utils";
import { formatPackageLocation, formatPackageTier } from "@/lib/utils/subscriptions";
import { SubscriptionCheckoutClient } from "./SubscriptionCheckoutClient";

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

export function SubscriptionCheckoutPageClient() {
  const searchParams = useSearchParams();
  const packageSlug = searchParams.get("package");
  const { user, isSignedIn } = useUser();
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [selectedPackage, setSelectedPackage] =
    useState<SubscriptionPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError(null);

    const load = async () => {
      try {
        if (packageSlug) {
          const pkg = (await client.fetch(
            SUBSCRIPTION_PACKAGE_BY_SLUG_QUERY,
            {
              slug: packageSlug,
            }
          )) as SubscriptionPackage | null;
          if (isActive) {
            setSelectedPackage(pkg ?? null);
          }
          return;
        }

        const list = (await client.fetch(
          SUBSCRIPTION_PACKAGES_QUERY
        )) as SubscriptionPackage[];
        if (isActive) {
          setPackages(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        if (isActive) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load membership packages."
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    load();
    return () => {
      isActive = false;
    };
  }, [packageSlug]);

  const initialName = useMemo(() => {
    if (!user) return "";
    return (
      user.fullName ||
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    );
  }, [user]);
  const initialEmail = user?.primaryEmailAddress?.emailAddress ?? "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-zinc-200">
        <section className="mx-auto max-w-6xl px-4 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-primary">
            Gold&apos;s Gym BD Memberships
          </p>
          <h1 className="font-heading mt-4 text-3xl text-white sm:text-4xl">
            Preparing your checkout
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400">
            Loading the membership details now.
          </p>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-zinc-200">
        <section className="mx-auto max-w-6xl px-4 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-primary">
            Something went wrong
          </p>
          <h1 className="font-heading mt-4 text-3xl text-white sm:text-4xl">
            We couldn&apos;t load the membership checkout
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400">
            {error}
          </p>
          <Link
            href="/packages"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-primary/90"
          >
            Back to Packages
          </Link>
        </section>
      </div>
    );
  }

  if (packageSlug && !selectedPackage?._id) {
    return (
      <div className="min-h-screen bg-black text-zinc-200">
        <section className="mx-auto max-w-6xl px-4 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-primary">
            Package not found
          </p>
          <h1 className="font-heading mt-4 text-3xl text-white sm:text-4xl">
            We couldn&apos;t find that membership
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
        </section>
      </div>
    );
  }

  if (selectedPackage) {
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
              Lock in your membership today. Our team will confirm activation
              and onboarding within 24 hours.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          {!isSignedIn ? (
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
              pkg={selectedPackage}
              initialName={initialName}
              initialEmail={initialEmail}
            />
          )}
        </section>
      </div>
    );
  }

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
            Start by selecting a membership package that matches your goals and
            preferred club location.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        {packages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-10 text-center text-sm text-zinc-500">
            Add subscription packages in Sanity to populate this section.
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">
                Select a package to continue
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => {
                const price =
                  typeof pkg.offerPrice === "number"
                    ? pkg.offerPrice
                    : pkg.packagePrice ?? 0;
                return (
                  <div
                    key={pkg._id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                      {formatPackageLocation(pkg.location ?? "")}
                    </p>
                    <h3 className="font-heading mt-3 text-xl text-white">
                      {pkg.title ?? "Membership Package"}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-400">
                      {formatPackageTier(pkg.tier ?? "")} •{" "}
                      {pkg.durationLabel ?? "Flexible duration"}
                    </p>
                    <p className="mt-2 text-sm text-zinc-500">
                      {pkg.accessLabel ?? "Full access"}
                    </p>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary">
                        {formatPrice(price)}
                      </span>
                      <Link
                        href={`/packages/checkout?package=${encodeURIComponent(
                          pkg.slug || pkg._id
                        )}`}
                        className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-primary/90"
                      >
                        Select
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
