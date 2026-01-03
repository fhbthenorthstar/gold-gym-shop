import Image from "next/image";
import { MapPin, Mail, Phone } from "lucide-react";
import { ContactForm } from "@/components/app/ContactForm";

export default function ContactPage() {
  const branches = [
    {
      name: "Gold's Gym Bangladesh",
      address: "Bashundhara Residential Area, Block N",
      email: "info@goldsgym.com.bd",
      phone: "+8801704112385",
    },
    {
      name: "Gold's Gym Bangladesh",
      address: "Bashundhara City Shopping Mall, Level 8",
      email: "info@goldsgym.com.bd",
      phone: "+8801313095035",
    },
    {
      name: "Zulcan Indoor Arena",
      address: "Bashundhara City Shopping Mall, Level 8",
      email: "info@zulcan.com.bd",
      phone: "Hotline: +880 1969-900555",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <section className="border-b border-zinc-900 py-16 text-zinc-300">
        <div className="mx-auto max-w-7xl px-4">
          <div className="space-y-6 text-center">
            <div className="mx-auto max-w-3xl space-y-4">
              <h1 className="font-heading text-2xl uppercase tracking-[0.15em] text-white sm:text-3xl">
                Our Branches
              </h1>
              <p className="text-sm text-zinc-400">
                Visit Gold&apos;s Gym Bangladesh and Zulcan Indoor Arena for
                memberships, strength training, and combat conditioning. Our
                teams can guide you on classes, schedules, and facility access.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {branches.map((branch) => (
                <div
                  key={branch.name}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 text-left"
                >
                  <h3 className="font-heading text-base text-white">
                    {branch.name}
                  </h3>
                  <ul className="mt-4 space-y-3 text-xs text-zinc-400">
                    <li className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-lime-300" />
                      <span>{branch.address}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-lime-300" />
                      <span>{branch.email}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-lime-300" />
                      <span>{branch.phone}</span>
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 text-zinc-300">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-2xl uppercase tracking-[0.12em] text-white sm:text-3xl">
            Hello! Welcome to Get Train
            </h2>
            <p className="mt-3 text-sm text-zinc-400">
              Ask about memberships, personal training, combat programs, or
              facility tours. We&apos;ll get back to you quickly.
            </p>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-black/80 sm:min-h-[440px] lg:min-h-[560px]">
              <Image
                src="/contact-us.jpg"
                alt="Training session"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 lg:self-center lg:py-10">
              <h3 className="font-heading text-xl uppercase tracking-[0.08em] text-white">
                Have Question? Get In Touch!
              </h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
