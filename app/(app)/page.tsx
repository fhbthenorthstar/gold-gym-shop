import Image from "next/image";
import Link from "next/link";
import { Check, Facebook, Instagram, X } from "lucide-react";
import { sanityFetch } from "@/sanity/lib/live";
import {
  HOME_OFFER_QUERY,
  HOME_TESTIMONIALS_QUERY,
  HOME_TRAININGS_QUERY,
  HOME_TRAINERS_QUERY,
} from "@/lib/sanity/queries/home";
import {
  HOME_FEATURED_PRODUCTS_QUERY,
} from "@/lib/sanity/queries/products";
import { HomeTestimonials } from "@/components/app/HomeTestimonials";
import { HomeInstagramSlider } from "@/components/app/HomeInstagramSlider";
import { ProductCard } from "@/components/app/ProductCard";
import { cn } from "@/lib/utils";
import type {
  FILTER_PRODUCTS_BY_BEST_SELLING_QUERYResult,
} from "@/sanity.types";

type SanityImage = {
  asset?: {
    _id?: string;
    url?: string | null;
  } | null;
  hotspot?: unknown;
};

type HomeOffer = {
  _id?: string;
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  bullets?: string[] | null;
  ctaLabel?: string | null;
  ctaLink?: string | null;
  image?: SanityImage | null;
  brandLogos?:
    | Array<{
        _key?: string;
        asset?: {
          _id?: string;
          url?: string | null;
        } | null;
        hotspot?: unknown;
      } | null>
    | null;
};

type Trainer = {
  _id?: string;
  name?: string | null;
  role?: string | null;
  image?: SanityImage | null;
};

type Testimonial = {
  _id?: string;
  name?: string | null;
  role?: string | null;
  quote?: string | null;
  rating?: number | null;
  avatar?: SanityImage | null;
};

type Training = {
  _id?: string;
  title?: string | null;
  link?: string | null;
  image?: SanityImage | null;
};

const instagramPlaceholderItems = [
  {
    id: "instagram-placeholder-1",
    imageUrl: "/instagram/1.jpg",
  },
  {
    id: "instagram-placeholder-2",
    imageUrl: "/instagram/2.jpg",
  },
  {
    id: "instagram-placeholder-3",
    imageUrl: "/instagram/3.jpg",
  },
  {
    id: "instagram-placeholder-4",
    imageUrl: "/instagram/4.jpg",
  },
  {
    id: "instagram-placeholder-5",
    imageUrl: "/instagram/5.jpg",
  },
  {
    id: "instagram-placeholder-6",
    imageUrl: "/instagram/6.jpg",
  },
  {
    id: "instagram-placeholder-7",
    imageUrl: "/instagram/7.jpg",
  },
  {
    id: "instagram-placeholder-8",
    imageUrl: "/instagram/8.jpg",
  },
  {
    id: "instagram-placeholder-9",
    imageUrl: "/instagram/9.jpg",
  },
  {
    id: "instagram-placeholder-10",
    imageUrl: "/instagram/10.jpeg",
  },
];

const isExternalUrl = (value?: string | null) =>
  Boolean(value && /^https?:\/\//i.test(value));

type TrainerCardProps = {
  trainer: Trainer;
  size?: "large" | "small";
  className?: string;
  showSocial?: boolean;
};

const TrainerCard = ({
  trainer,
  size = "large",
  className,
  showSocial = false,
}: TrainerCardProps) => {
  const imageUrl = trainer.image?.asset?.url ?? null;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70 transition-shadow duration-300 hover:shadow-[0_18px_40px_rgba(246,201,75,0.18)]",
        className
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-black",
          size === "large" ? "h-80" : "h-56"
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={trainer.name ?? "Trainer"}
            fill
            className="origin-top object-cover object-top transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">
            No image
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4">
        <div className="rounded-xl bg-zinc-900/85 px-4 py-3 backdrop-blur-sm ring-1 ring-primary/25">
          <p className="font-heading text-sm text-white">
            {trainer.name ?? "Trainer"}
          </p>
          {trainer.role && (
            <p className="mt-1 text-[10px] uppercase tracking-[0.35em] text-primary/80">
              {trainer.role}
            </p>
          )}
        </div>
      </div>
      {showSocial && (
        <div className="absolute right-4 top-4 flex items-center gap-2">
          {[X, Facebook, Instagram].map((Icon, index) => (
            <span
              key={index}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 bg-black/60 text-zinc-200 transition hover:border-primary/60 hover:text-primary/90"
            >
              <Icon className="h-4 w-4" />
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default async function HomePage() {
  const [
    featuredProductsResult,
    offerResult,
    trainingsResult,
    trainersResult,
    testimonialsResult,
  ] = await Promise.all([
    sanityFetch({ query: HOME_FEATURED_PRODUCTS_QUERY }),
    sanityFetch({ query: HOME_OFFER_QUERY }),
    sanityFetch({ query: HOME_TRAININGS_QUERY }),
    sanityFetch({ query: HOME_TRAINERS_QUERY }),
    sanityFetch({ query: HOME_TESTIMONIALS_QUERY }),
  ]);

  const featuredProducts =
    (featuredProductsResult.data as FILTER_PRODUCTS_BY_BEST_SELLING_QUERYResult | null) ??
    [];
  const offer = (offerResult.data as HomeOffer | null) ?? null;
  const trainings = (trainingsResult.data as Training[] | null) ?? [];
  const trainers = (trainersResult.data as Trainer[] | null) ?? [];
  const testimonials = (testimonialsResult.data as Testimonial[] | null) ?? [];
  const instagramProfileUrl = "https://www.instagram.com/goldsgymbangladesh/";
  const instagramSlides = instagramPlaceholderItems.map((item) => ({
    id: item.id,
    imageUrl: item.imageUrl,
    link: instagramProfileUrl,
    caption: null,
  }));

  return (
    <div className="min-h-screen bg-black">
      <section className="relative isolate min-h-[80svh] overflow-hidden border-b border-zinc-800 sm:min-h-[100svh]">
        <Image
          src="/trinners/head-trainers-01.webp"
          alt="Gold's Gym trainers"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/10" />
        <div className="relative mx-auto flex min-h-[80svh] max-w-7xl items-center px-4 py-16 sm:min-h-[100svh] sm:py-24">
          <div className="max-w-xl space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-700">
            <p className="text-xs uppercase tracking-[0.4em] text-primary">
              Save up to 50% off
            </p>
            <h1 className="font-heading text-3xl text-white sm:text-4xl lg:text-5xl">
              Coaches Guide,
              <span className="block text-primary">Goals Achieved.</span>
            </h1>
            <p className="max-w-xl text-sm text-zinc-200 sm:text-base">
              Shop premium gym wear, supplements, and equipment curated for
              modern training. Built for Gold's Gym Bangladesh and Zulcan
              Indoor Arena athletes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-primary/90"
              >
                Explore Now
              </Link>
              <Link
                href="/about"
                className="inline-flex h-11 items-center justify-center rounded-full border border-primary/40 px-6 text-xs font-semibold uppercase tracking-[0.2em] text-primary transition hover:border-primary/80 hover:text-primary/90"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {trainings.length > 0 && (
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-primary">
                Training Programs
              </p>
              <h2 className="font-heading mt-3 text-2xl text-white sm:text-3xl">
                Train Smarter. <span className="text-primary">Perform Better.</span>
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Choose a focus and let our coaches guide your next session.
              </p>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {trainings.map((item, index) => {
                const imageUrl = item.image?.asset?.url ?? "";
                const href = item.link || "/shop";
                const content = (
                  <>
                    <div className="relative h-48 w-full sm:h-52">
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
                          No image
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

                return (
                  isExternalUrl(href) ? (
                    <a
                      key={item._id ?? item.title ?? index}
                      href={href}
                      className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/40 animate-in fade-in-0 slide-in-from-bottom-2 duration-700"
                      style={{ animationDelay: `${index * 90}ms` }}
                    >
                      {content}
                    </a>
                  ) : (
                    <Link
                      key={item._id ?? item.title ?? index}
                      href={href}
                      className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/40 animate-in fade-in-0 slide-in-from-bottom-2 duration-700"
                      style={{ animationDelay: `${index * 90}ms` }}
                    >
                      {content}
                    </Link>
                  )
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-primary">
              Best sellers
            </p>
            <h2 className="font-heading mt-3 text-2xl text-white sm:text-3xl">
              Gold&apos;s Gym <span className="text-primary">Favorites</span>
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Coach-approved essentials and member favorites ready for your next session.
            </p>
          </div>
          {featuredProducts.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.slice(0, 8).map((product, index) => (
                <div
                  key={product._id}
                  className="animate-in fade-in-0 slide-in-from-bottom-2 duration-700"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-10 text-center text-sm text-zinc-500">
              Add featured products in Sanity to populate this section.
            </div>
          )}
        </div>
      </section>

      {offer?.image?.asset?.url && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
              <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-black/40 shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
                <div className="relative h-[360px] w-full sm:h-[420px] lg:h-[520px]">
                  <Image
                    src={offer.image.asset.url}
                    alt={offer.title ?? "Gym offer"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
              <div>
                {offer.eyebrow && (
                  <p className="text-xs uppercase tracking-[0.4em] text-primary">
                    {offer.eyebrow}
                  </p>
                )}
                <h2 className="font-heading mt-3 text-2xl text-white sm:text-3xl">
                  {offer.title}
                </h2>
                {offer.description && (
                  <p className="mt-4 text-sm text-zinc-200">
                    {offer.description}
                  </p>
                )}
                {offer.bullets && offer.bullets.length > 0 && (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {offer.bullets.map((bullet, index) => (
                      <div
                        key={`${bullet}-${index}`}
                        className="flex items-start gap-3 text-sm text-zinc-200"
                      >
                        <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-black">
                          <Check className="h-3 w-3" />
                        </span>
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-8 border-t border-zinc-700 pt-6">
                  <p className="font-heading text-xs uppercase tracking-[0.3em] text-zinc-300 text-center">
                    Proudly Powered By
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 sm:gap-x-8">
                    {offer.brandLogos?.map((logo) =>
                      logo?.asset?.url ? (
                        <div
                          key={logo._key ?? logo.asset.url}
                          className="flex w-[45%] items-center justify-center sm:w-auto"
                        >
                          <Image
                            src={logo.asset.url}
                            alt="Brand logo"
                            width={160}
                            height={60}
                            className="h-8 w-auto max-w-[120px] object-contain sm:h-10 sm:max-w-[160px]"
                          />
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
                {offer.ctaLabel && offer.ctaLink ? (
                  isExternalUrl(offer.ctaLink) ? (
                    <a
                      href={offer.ctaLink}
                      className="mt-8 inline-flex h-11 w-fit items-center justify-center rounded-md bg-primary px-6 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-primary/90"
                    >
                      {offer.ctaLabel}
                    </a>
                  ) : (
                    <Link
                      href={offer.ctaLink}
                      className="mt-8 inline-flex h-11 w-fit items-center justify-center rounded-md bg-primary px-6 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-primary/90"
                    >
                      {offer.ctaLabel}
                    </Link>
                  )
                ) : null}
              </div>
            </div>
          </div>
        </section>
      )}

      {instagramSlides.length > 0 && (
        <HomeInstagramSlider
          items={instagramSlides}
          profileUrl={instagramProfileUrl}
        />
      )}

      {trainers.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-primary">
                World-class Trainers Available
              </p>
              <h2 className="font-heading mt-3 text-2xl text-white sm:text-3xl">
                 <span className="text-primary">Top</span> Trainers
              </h2>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trainers.map((trainer) => (
                <TrainerCard
                  key={trainer._id ?? trainer.name}
                  trainer={trainer}
                  size="large"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <HomeTestimonials items={testimonials} />
      )}

      

      <section className="relative overflow-hidden border-y border-zinc-800">
        <div className="relative h-[380px] w-full sm:h-[460px] lg:h-[540px]">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          >
            <source src="/videos/ensure-fit.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-primary">
            Special Facilities
          </p>
          <h2 className="font-heading mt-3 text-2xl text-white sm:text-3xl">
            SPA &amp; Pool
          </h2>
        </div>
      </section>
    </div>
  );
}
