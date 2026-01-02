import { PageHero } from "@/components/app/PageHero";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black">
      <PageHero
        title="Contact"
        subtitle="We are here to help with orders, partnerships, or custom quotes."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 text-zinc-300">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            <h2 className="font-heading text-2xl text-white">Get in Touch</h2>
            <p>
              Reach us for product advice, wholesale inquiries, or training
              equipment setup.
            </p>
            <div className="space-y-2 text-sm">
              <p>Address: No: 58 A, East Madison Street, Baltimore, MD, USA</p>
              <p>Phone: (000) 123 - 456789</p>
              <p>Email: info@example.com</p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="font-heading text-sm text-white">Send a Message</h3>
            <form className="mt-6 grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Name"
                className="h-10 rounded-md border border-zinc-800 bg-black px-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-lime-300"
              />
              <input
                type="text"
                placeholder="Phone"
                className="h-10 rounded-md border border-zinc-800 bg-black px-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-lime-300"
              />
              <input
                type="email"
                placeholder="Email"
                className="h-10 rounded-md border border-zinc-800 bg-black px-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-lime-300"
              />
              <input
                type="text"
                placeholder="Subject"
                className="h-10 rounded-md border border-zinc-800 bg-black px-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-lime-300"
              />
              <textarea
                placeholder="Your message"
                rows={4}
                className="sm:col-span-2 rounded-md border border-zinc-800 bg-black px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-lime-300"
              />
              <Button className="h-10 rounded-md bg-lime-300 text-xs font-semibold text-black hover:bg-lime-200 sm:col-span-2">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
