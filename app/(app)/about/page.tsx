import { PageHero } from "@/components/app/PageHero";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      <PageHero
        title="About Us"
        subtitle="Modern fitness retail for athletes, gyms, and performance teams."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 text-zinc-300">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="font-heading text-2xl text-white">Fitfinity Story</h2>
            <p>
              Fitfinity is built for people who train with purpose. We curate
              high-performance apparel, supplements, and equipment that support
              everything from strength training to conditioning.
            </p>
            <p>
              From gym floor essentials to recovery tools, we bring together the
              best gear with a customer experience that mirrors the intensity of
              your goals.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="font-heading text-2xl text-white">Why Choose Us</h2>
            <ul className="space-y-3 text-sm">
              <li>Curated brands trusted by coaches and athletes.</li>
              <li>Nationwide delivery and responsive customer care.</li>
              <li>Premium training gear, apparel, and accessories.</li>
              <li>Performance-first product selection.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
