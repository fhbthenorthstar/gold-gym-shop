export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-200">
      <section className="border-b border-zinc-900 py-16">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-primary">
            Gold&apos;s Gym BD Shop
          </p>
          <h1 className="font-heading mt-4 text-3xl text-white sm:text-4xl">
            Privacy Policy
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
              What we collect
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              <li>Contact details such as name, phone number, and email.</li>
              <li>Delivery information including address and city/region.</li>
              <li>Order history, cart items, and subscription selections.</li>
              <li>Support messages and inquiries submitted through our forms.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
            <h2 className="font-heading text-xl text-white">
              How we use your data
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              <li>Process orders, deliveries, and membership subscriptions.</li>
              <li>Confirm payments and provide order or renewal updates.</li>
              <li>Respond to service requests and customer support inquiries.</li>
              <li>Improve our products, inventory, and online experience.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
            <h2 className="font-heading text-xl text-white">
              Sharing &amp; security
            </h2>
            <p className="mt-4 text-sm text-zinc-400">
              We never sell your personal data. We only share necessary details
              with trusted service providers (such as delivery partners and
              payment processors) to fulfill your orders in Bangladesh. We use
              secure systems and restricted access to protect your information.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
            <h2 className="font-heading text-xl text-white">
              Cookies &amp; analytics
            </h2>
            <p className="mt-4 text-sm text-zinc-400">
              We use cookies and similar technologies to remember your
              preferences, maintain your cart, and measure site performance. You
              can disable cookies in your browser, but some features may not
              work as intended.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
            <h2 className="font-heading text-xl text-white">
              Your choices
            </h2>
            <p className="mt-4 text-sm text-zinc-400">
              You may request access, correction, or deletion of your data at
              any time. Contact our team using the details below and we will
              assist you promptly.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
            <h2 className="font-heading text-xl text-white">Contact us</h2>
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
