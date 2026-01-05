import Image from "next/image";
import Link from "next/link";
import { sanityFetch } from "@/sanity/lib/live";
import { HOME_TRAININGS_QUERY } from "@/lib/sanity/queries/home";
import { SUBSCRIPTION_PACKAGES_QUERY } from "@/lib/sanity/queries/subscriptions";
import { formatPrice } from "@/lib/utils";
import { formatPackageLocation, formatPackageTier } from "@/lib/utils/subscriptions";
import { ContactForm } from "@/components/app/ContactForm";
import { HomeInstagramSlider } from "@/components/app/HomeInstagramSlider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface TrainingItem {
  _id: string;
  title?: string | null;
  link?: string | null;
  image?: {
    asset?: {
      url?: string | null;
    } | null;
  } | null;
}

interface SubscriptionPackageItem {
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

const instagramPlaceholderItems = [
  {
    id: "packages-instagram-1",
    imageUrl: "/instagram/1.jpg",
  },
  {
    id: "packages-instagram-2",
    imageUrl: "/instagram/2.jpg",
  },
  {
    id: "packages-instagram-3",
    imageUrl: "/instagram/3.jpg",
  },
  {
    id: "packages-instagram-4",
    imageUrl: "/instagram/4.jpg",
  },
  {
    id: "packages-instagram-5",
    imageUrl: "/instagram/5.jpg",
  },
  {
    id: "packages-instagram-6",
    imageUrl: "/instagram/6.jpg",
  },
  {
    id: "packages-instagram-7",
    imageUrl: "/instagram/7.jpg",
  },
  {
    id: "packages-instagram-8",
    imageUrl: "/instagram/8.jpg",
  },
  {
    id: "packages-instagram-9",
    imageUrl: "/instagram/9.jpg",
  },
  {
    id: "packages-instagram-10",
    imageUrl: "/instagram/10.jpeg",
  },
];

const isExternalUrl = (value?: string | null) =>
  Boolean(value && (value.startsWith("http://") || value.startsWith("https://")));

const groupPackages = (packages: SubscriptionPackageItem[]) => {
  const grouped: Record<string, Record<string, SubscriptionPackageItem[]>> = {};
  packages.forEach((pkg) => {
    const location = pkg.location ?? "unknown";
    const tier = pkg.tier ?? "standard";
    if (!grouped[location]) {
      grouped[location] = {};
    }
    if (!grouped[location][tier]) {
      grouped[location][tier] = [];
    }
    grouped[location][tier].push(pkg);
  });
  return grouped;
};

export default async function PackagesPage() {
  const [trainingsResult, packagesResult] = await Promise.all([
    sanityFetch({ query: HOME_TRAININGS_QUERY }),
    sanityFetch({ query: SUBSCRIPTION_PACKAGES_QUERY }),
  ]);

  const trainings = (trainingsResult.data as TrainingItem[] | null) ?? [];
  const packages = (packagesResult.data as SubscriptionPackageItem[] | null) ?? [];
  const groupedPackages = groupPackages(packages);
  const locations = Object.keys(groupedPackages);
  const defaultLocation = locations[0] ?? "";
  const instagramProfileUrl = "https://www.instagram.com/goldsgymbangladesh/";
  const instagramSlides = instagramPlaceholderItems.map((item) => ({
    id: item.id,
    imageUrl: item.imageUrl,
    link: instagramProfileUrl,
    caption: null,
  }));

  return (
    <div className="min-h-screen bg-black text-zinc-200">
      <section className="border-b border-zinc-900 py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-primary">
            Gold&apos;s Gym BD Packages
          </p>
          <h1 className="font-heading mt-4 text-3xl text-white sm:text-4xl lg:text-5xl">
            Choose a Plan That Matches Your Goals
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400 sm:text-base">
            Flexible gym, pool, and spa access built for busy schedules. Pick your
            duration, lock in the offer price, and start training with Gold&apos;s Gym
            Bangladesh today.
          </p>
        </div>
      </section>

      {instagramSlides.length > 0 && (
        <HomeInstagramSlider
          items={instagramSlides}
          profileUrl={instagramProfileUrl}
        />
      )}

      {trainings.length > 0 && (
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-primary">
                Trainings We Offer
              </p>
              <h2 className="font-heading mt-3 text-2xl text-white sm:text-3xl">
                Move With Purpose.{" "}
                <span className="text-primary">Train With Experts.</span>
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                From boxing to conditioning, pick your focus and level up your
                routine.
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
                          Image coming soon
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

                return isExternalUrl(href) ? (
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
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden border-t border-zinc-900 py-16">
        <Image
          src="/rsg-group-history-golds-gym-2020-1440x1080.png"
          alt="Gold's Gym legacy"
          fill
          className="object-cover opacity-20"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-primary">
              Membership Options
            </p>
            <h2 className="font-heading mt-3 text-2xl text-white sm:text-3xl">
              Choose Your{" "}
              <span className="text-primary">Package</span>
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Select your club location and access level to unlock today&apos;s best
              offers.
            </p>
          </div>

          {packages.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-10 text-center text-sm text-zinc-500">
              Add subscription packages in Sanity to populate this section.
            </div>
          ) : (
            <div className="mt-10">
              <Tabs defaultValue={defaultLocation}>
                <div className="flex flex-col items-center gap-6">
                  <TabsList className="flex h-auto w-full max-w-3xl flex-col flex-wrap gap-2 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-2 sm:flex-row sm:justify-center sm:gap-3">
                    {locations.map((location) => (
                      <TabsTrigger
                        key={location}
                        value={location}
                        className="w-full rounded-full border border-transparent px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300 sm:w-auto sm:px-6 sm:whitespace-nowrap data-[state=active]:border-primary/40 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                      >
                        {formatPackageLocation(location)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {locations.map((location) => {
                  const tiers = Object.keys(groupedPackages[location] ?? {});
                  const defaultTier = tiers[0] ?? "";
                  return (
                    <TabsContent key={location} value={location} className="mt-10">
                      <Tabs defaultValue={defaultTier}>
                        <div className="flex flex-col items-center gap-6">
                          <TabsList className="flex h-auto w-full max-w-3xl flex-col flex-wrap gap-2 rounded-3xl border border-zinc-800 bg-black/60 p-2 sm:flex-row sm:justify-center sm:gap-3">
                            {tiers.map((tier) => (
                              <TabsTrigger
                                key={tier}
                                value={tier}
                                className="w-full rounded-full border border-transparent px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300 sm:w-auto sm:px-6 sm:whitespace-nowrap data-[state=active]:border-primary/40 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                              >
                                {formatPackageTier(tier)}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                        </div>

                        {tiers.map((tier) => (
                          <TabsContent key={tier} value={tier} className="mt-10">
                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                              {groupedPackages[location]?.[tier]?.map((pkg) => {
                                const offerPrice =
                                  typeof pkg.offerPrice === "number"
                                    ? pkg.offerPrice
                                    : pkg.packagePrice ?? 0;
                                const packagePrice = pkg.packagePrice ?? 0;
                                return (
                                  <div
                                    key={pkg._id}
                                    className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-black p-6 text-center shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
                                  >
                                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
                                      {pkg.durationLabel}
                                    </p>
                                    <p className="mt-2 text-xs uppercase tracking-[0.3em] text-zinc-500">
                                      Pack
                                    </p>
                                    <h3 className="font-heading mt-2 text-2xl text-white">
                                      {formatPackageTier(pkg.tier)}
                                    </h3>
                                    <p className="mt-2 text-xs text-zinc-400">
                                      {pkg.accessLabel}
                                    </p>
                                    <div className="mt-5 border-t border-zinc-800 pt-4">
                                      <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                                        Package Price
                                      </p>
                                      <p className="mt-2 text-sm text-zinc-400 line-through">
                                        {formatPrice(packagePrice)}
                                      </p>
                                      <p className="mt-2 text-xs uppercase tracking-[0.3em] text-zinc-500">
                                        Offer Price
                                      </p>
                                      <p className="mt-2 text-2xl font-semibold text-primary">
                                        {formatPrice(offerPrice)}
                                      </p>
                                    </div>
                                    <Link
                                      href={`/subscribe?package=${encodeURIComponent(
                                        pkg.slug || pkg._id
                                      )}`}
                                      className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-full bg-primary text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-primary/90"
                                    >
                                      Join Now
                                    </Link>
                                  </div>
                                );
                              })}
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>
          )}
        </div>
      </section>

      <section className="border-b border-zinc-900 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-8 text-center sm:p-10">
            <p className="text-xs uppercase tracking-[0.4em] text-primary">
              Need Help Choosing?
            </p>
            <h2 className="font-heading mt-3 text-2xl text-white sm:text-3xl">
              Talk with a Membership Advisor
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400">
              Share your goals and preferred location. Our team will recommend
              the best package and follow up with you fast.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
