export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-200">
      <section className="border-b border-zinc-900 py-16">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-primary">
            Gold&apos;s Gym BD Shop
          </p>
          <h1 className="font-heading mt-4 text-3xl text-white sm:text-4xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            Last updated: January 2026
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-5xl space-y-10 px-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
            <h2 className="font-heading text-xl text-white">
              Orders &amp; pricing
            </h2>
            <p className="mt-4 text-sm text-zinc-400">
              All prices are listed in Bangladeshi Taka (BDT) and may change
              without notice. We reserve the right to refuse or cancel orders
              due to pricing errors, inventory issues, or suspected fraud.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
            <h2 className="font-heading text-xl text-white">
              Payments &amp; delivery
            </h2>
            <p className="mt-4 text-sm text-zinc-400">
              We currently support onsite/COD payment options. Delivery
              timelines vary by location across Bangladesh. Free delivery applies
              only when the cart value meets the stated threshold.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
            <h2 className="font-heading text-xl text-white">
              Returns &amp; exchanges
            </h2>
            <p className="mt-4 text-sm text-zinc-400">
              Items must be unused, unopened, and in original packaging to be
              eligible for return or exchange. Certain items (supplements,
              hygiene products, and clearance goods) may be non-returnable. See
              our Returns page for details.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
            <h2 className="font-heading text-xl text-white">
              Membership subscriptions
            </h2>
            <p className="mt-4 text-sm text-zinc-400">
              Subscription packages are confirmed by our team after checkout.
              Access, start dates, and renewals are provided based on the
              selected package. All membership services are subject to Gold&apos;s
              Gym Bangladesh club policies.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
            <h2 className="font-heading text-xl text-white">
              User responsibilities
            </h2>
            <p className="mt-4 text-sm text-zinc-400">
              You are responsible for maintaining accurate account information
              and for all activities under your account. Do not misuse or
              attempt to interfere with site security or service availability.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
            <h2 className="font-heading text-xl text-white">
              Governing law
            </h2>
            <p className="mt-4 text-sm text-zinc-400">
              These terms are governed by the laws of Bangladesh. Any disputes
              shall be resolved within the applicable courts of Bangladesh.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
            <h2 className="font-heading text-xl text-white">Contact</h2>
            <p className="mt-4 text-sm text-zinc-400">
              Email: info@goldsgym.com.bd
            </p>
            <p className="text-sm text-zinc-400">
              Phone: +880 1704 112385
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
