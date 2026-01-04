import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  Dumbbell,
  Globe2,
  CheckCircle2,
  Users2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const galleryImages = [
  "/about-us/1-min.png",
  "/about-us/2-min.png",
  "/about-us/3-min.png",
  "/about-us/4-min.png",
  "/about-us/5-min.png",
];

const accessHighlights = [
  "Technogym® equipment — world-leading machines trusted by athletes worldwide.",
  "Certified and experienced trainers — ensuring safe, effective, and personalized training.",
  "Diverse programs — from strength and conditioning to cardio, group classes, yoga, and more.",
  "Exclusive facilities — including pool, spa, and ladies-only zones.",
  "Flexible packages — for general members, students, families, corporates, and special groups.",
];

const highlightCards = [
  {
    title: "Global Legacy",
    icon: Globe2,
    description:
      "Gold's Gym is the world's most iconic fitness brand, with a legacy that began in 1965 in Venice Beach, California.",
  },
  {
    title: "Bodybuilding Heritage",
    icon: Dumbbell,
    description:
      'What started as a small neighborhood gym quickly became the "Mecca of Bodybuilding," home to legends like Arnold Schwarzenegger, Lou Ferrigno, and Franco Columbu.',
  },
  {
    title: "Worldwide Community",
    icon: Users2,
    description:
      "Gold's Gym has transformed into a global fitness powerhouse with 700+ locations across 28 countries, serving millions of members worldwide.",
  },
];

const faqs = [
  {
    question: "What does the Gold's Gym brand stand for?",
    answer:
      "The brand stands for more than just weightlifting—it represents strength, endurance, community, and lifestyle.",
  },
  {
    question: "Where is Gold's Gym Bangladesh located?",
    answer:
      "With branches at Bashundhara Sports City (BSC) and Bashundhara City Shopping Mall (BCDL), we offer a premium fitness experience that blends international standards with local accessibility.",
  },
  {
    question: "What can members access at Gold's Gym Bangladesh?",
    answer: accessHighlights,
  },
  {
    question: "Who is Gold's Gym Bangladesh built for?",
    answer:
      "Whether you're a beginner taking your first step or a professional aiming to elevate your performance, we provide the environment, expertise, and motivation to help you succeed.",
  },
  {
    question: "How does the legacy continue in Bangladesh?",
    answer:
      "Here in Bangladesh, the Gold's Gym legacy continues—proving that strength has no boundaries.",
  },
];

const collaborators = [
  "Gold's Gym",
  "Bashundhara",
  "Technogym",
  "BSC",
  "BCDL",
  "Zulcan Arena",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-200">
      <section className="border-b border-zinc-900 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-primary">
            Gold's Gym Bangladesh
          </p>
          <h1 className="font-heading mt-4 text-3xl text-white sm:text-4xl lg:text-5xl">
            Strength, Endurance, Community &amp; Lifestyle
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-zinc-400 sm:text-base">
            Gold's Gym is the world's most iconic fitness brand, with a legacy
            that began in 1965 in Venice Beach, California.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {galleryImages.map((src, index) => (
              <div
                key={src}
                className="relative h-32 overflow-hidden rounded-xl border border-zinc-800 sm:h-36 lg:h-40"
              >
                <Image
                  src={src}
                  alt={`About gallery ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20">
        <Image
          src="/rsg-group-history-golds-gym-2020-1440x1080.png"
          alt="Gold's Gym legacy"
          fill
          className="object-cover opacity-20"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-primary">
                Gold's Gym Legacy
              </p>
              <h2 className="font-heading text-2xl text-white sm:text-3xl">
                We Endure in Every Stage
              </h2>
              <p className="text-sm text-zinc-300">
                What started as a small neighborhood gym quickly became the
                "Mecca of Bodybuilding," home to legends like Arnold
                Schwarzenegger, Lou Ferrigno, and Franco Columbu.
              </p>
              <p className="text-sm text-zinc-400">
                The brand stands for more than just weightlifting—it represents
                strength, endurance, community, and lifestyle.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black/60 p-6 text-sm text-zinc-300">
              <p className="text-lg text-white">
                Gold's Gym has transformed into a global fitness powerhouse
                with 700+ locations across 28 countries, serving millions of
                members worldwide.
              </p>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-primary">
                Gold's Gym Worldwide
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-900 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.6fr_1fr]">
            <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 sm:min-h-[420px]">
              <Image
                src="/trinners/trainers-01.webp"
                alt="Gold's Gym Bangladesh training"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-primary/90 text-black">
              <div className="space-y-0">
                {[
                  "Technogym Equipment",
                  "Certified Trainers",
                  "Diverse Programs",
                  "Exclusive Facilities",
                  "Flexible Packages",
                  "Recovery & Wellness Zones",
                  "Women-Only Training Areas",
                  "Performance Nutrition Guidance",
                  "Personal Progress Tracking",
                  "Community Events & Challenges",
                ].map((item, index) => (
                  <div
                    key={item}
                    className={`flex items-center gap-3 px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] ${
                      index !== 0 ? "border-t border-black/10" : ""
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-primary">
                Gold's Gym Bangladesh
              </p>
              <h3 className="font-heading text-2xl text-white">
                Track your fitness journey effortlessly
              </h3>
              <p className="text-sm text-zinc-400">
                Bringing this global legacy to Bangladesh, Gold's Gym Bangladesh
                operates under the Bashundhara Group, delivering world-class
                fitness facilities tailored to the local community.
              </p>
              <ul className="space-y-3 text-sm text-zinc-300">
                {accessHighlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-4 h-10 rounded-md bg-primary px-4 text-xs font-semibold uppercase tracking-[0.2em] text-black hover:bg-primary/90">
                View More
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-zinc-900 py-20">
        <Image
          src="/rsg-group-history-golds-gym-2020-1440x1080.png"
          alt="Gold's Gym worldwide"
          fill
          className="object-cover opacity-20"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black/60" />
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-primary">
            Workout Enthusiasm
          </p>
          <h2 className="font-heading mt-3 text-2xl text-white sm:text-3xl">
            Gold's Gym Worldwide
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400">
            Gold's Gym has transformed into a global fitness powerhouse with
            700+ locations across 28 countries, serving millions of members
            worldwide.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {highlightCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-2xl border border-zinc-800 bg-black/70 p-6 text-left"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg text-white">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm text-zinc-400">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-900 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
              <Image
                src="/contact-us.jpg"
                alt="Gold's Gym training"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-primary">
                Fitness FAQs
              </p>
              <h2 className="font-heading mt-3 text-2xl text-white sm:text-3xl">
                Get your questions answered
              </h2>
              <div className="mt-6 space-y-4">
                {faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="group rounded-xl border border-zinc-800 bg-black/60 px-4 py-3"
                  >
                    <summary className="flex cursor-pointer items-center justify-between text-sm text-white">
                      {faq.question}
                      <span className="text-primary transition group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    {Array.isArray(faq.answer) ? (
                      <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                        {faq.answer.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-1 h-4 w-4 text-primary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-zinc-400">
                        {faq.answer}
                      </p>
                    )}
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 text-center">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs uppercase tracking-[0.4em] text-primary">
            Our Collaborators
          </p>
          <h2 className="font-heading mt-3 text-2xl text-white sm:text-3xl">
            Partners behind the legacy
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {collaborators.map((item) => (
              <div
                key={item}
                className="flex min-h-[44px] items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 px-4 text-center text-[10px] uppercase tracking-[0.25em] text-zinc-400 sm:text-xs"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-zinc-900 py-20">
        <Image
          src="/trinners/3.jpg"
          alt="Gold's Gym Bangladesh"
          fill
          className="object-cover opacity-20"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-primary">
            Begin your fitness journey
          </p>
          <h2 className="font-heading mt-4 text-3xl text-white sm:text-4xl">
            Here in Bangladesh, the Gold's Gym legacy continues
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400">
            More than just a gym, Gold's Gym Bangladesh is a fitness community
            that inspires you to push your limits and celebrate progress every
            day.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              asChild
              className="h-11 rounded-md bg-primary px-6 text-xs font-semibold uppercase tracking-[0.2em] text-black hover:bg-primary/90"
            >
              <Link href="/shop">Shop Now</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-md border-zinc-700 px-6 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-200 hover:border-primary hover:text-primary/90"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
