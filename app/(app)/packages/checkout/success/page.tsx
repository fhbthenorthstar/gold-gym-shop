import Link from "next/link";
import { CheckCircle } from "lucide-react";

export const metadata = {
  title: "Membership Submitted | Gold's Gym BD Shop",
  description: "Your membership request has been submitted.",
};

export default function SubscriptionCheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { subscriptionId?: string };
}) {
  const subscriptionId = searchParams.subscriptionId;

  return (
    <div className="min-h-screen bg-black text-zinc-200">
      <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-heading mt-6 text-3xl text-white">
          Membership Request Received
        </h1>
        <p className="mt-3 text-sm text-zinc-400 sm:text-base">
          Thanks for choosing Gold&apos;s Gym BD. Our team is confirming your
          membership and will reach out with payment instructions shortly.
        </p>
        {subscriptionId && (
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-zinc-500">
            Reference: {subscriptionId}
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/my-subscription"
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-primary/90"
          >
            View Membership
          </Link>
          <Link
            href="/packages"
            className="inline-flex h-11 items-center justify-center rounded-full border border-primary/40 px-6 text-xs font-semibold uppercase tracking-[0.2em] text-primary transition hover:border-primary/80 hover:text-primary/90"
          >
            Back to Packages
          </Link>
        </div>
      </section>
    </div>
  );
}
