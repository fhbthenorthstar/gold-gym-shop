import "dotenv/config";
import { writeClient } from "../sanity/lib/client";
import { dataset } from "../sanity/env";

const SHOULD_WRITE = process.argv.includes("--confirm");

const LOCATION_MAP: Record<
  string,
  { label: string; short: string }
> = {
  "bashundhara-sports-city": {
    label: "Bashundhara Sports City",
    short: "bsc",
  },
  "bashundhara-city-shopping-mall": {
    label: "Bashundhara City Shopping Mall",
    short: "bcdl",
  },
};

const TIER_LABELS: Record<string, string> = {
  gold: "Gold",
  silver: "Silver",
  "pool-spa": "Pool & Spa",
};

const packageSeeds = [
  {
    location: "bashundhara-sports-city",
    tier: "gold",
    durationLabel: "1 Month",
    durationMonths: 1,
    accessLabel: "Gym, Spa & Pool Access",
    packagePrice: 30000,
    offerPrice: 16500,
  },
  {
    location: "bashundhara-sports-city",
    tier: "gold",
    durationLabel: "3 Months",
    durationMonths: 3,
    accessLabel: "Gym, Spa & Pool Access",
    packagePrice: 80000,
    offerPrice: 44000,
  },
  {
    location: "bashundhara-sports-city",
    tier: "gold",
    durationLabel: "6 Months",
    durationMonths: 6,
    accessLabel: "Gym, Spa & Pool Access",
    packagePrice: 150000,
    offerPrice: 82500,
  },
  {
    location: "bashundhara-sports-city",
    tier: "gold",
    durationLabel: "1 Year",
    durationMonths: 12,
    accessLabel: "Gym, Spa & Pool Access",
    packagePrice: 250000,
    offerPrice: 137500,
  },
  {
    location: "bashundhara-sports-city",
    tier: "silver",
    durationLabel: "1 Month",
    durationMonths: 1,
    accessLabel: "Gym Access Only",
    packagePrice: 25000,
    offerPrice: 13750,
  },
  {
    location: "bashundhara-sports-city",
    tier: "silver",
    durationLabel: "3 Months",
    durationMonths: 3,
    accessLabel: "Gym Access Only",
    packagePrice: 65000,
    offerPrice: 35750,
  },
  {
    location: "bashundhara-sports-city",
    tier: "silver",
    durationLabel: "6 Months",
    durationMonths: 6,
    accessLabel: "Gym Access Only",
    packagePrice: 110000,
    offerPrice: 60500,
  },
  {
    location: "bashundhara-sports-city",
    tier: "silver",
    durationLabel: "1 Year",
    durationMonths: 12,
    accessLabel: "Gym Access Only",
    packagePrice: 180000,
    offerPrice: 99000,
  },
  {
    location: "bashundhara-sports-city",
    tier: "pool-spa",
    durationLabel: "1 Month",
    durationMonths: 1,
    accessLabel: "Spa & Pool Access Only",
    packagePrice: 25000,
    offerPrice: 17500,
  },
  {
    location: "bashundhara-sports-city",
    tier: "pool-spa",
    durationLabel: "3 Months",
    durationMonths: 3,
    accessLabel: "Spa & Pool Access Only",
    packagePrice: 45000,
    offerPrice: 31500,
  },
  {
    location: "bashundhara-sports-city",
    tier: "pool-spa",
    durationLabel: "6 Months",
    durationMonths: 6,
    accessLabel: "Spa & Pool Access Only",
    packagePrice: 75000,
    offerPrice: 52500,
  },
  {
    location: "bashundhara-sports-city",
    tier: "pool-spa",
    durationLabel: "1 Year",
    durationMonths: 12,
    accessLabel: "Spa & Pool Access Only",
    packagePrice: 125000,
    offerPrice: 87500,
  },
  {
    location: "bashundhara-city-shopping-mall",
    tier: "gold",
    durationLabel: "1 Month",
    durationMonths: 1,
    accessLabel: "Gym, Spa & Pool Access",
    packagePrice: 30000,
    offerPrice: 15000,
  },
  {
    location: "bashundhara-city-shopping-mall",
    tier: "gold",
    durationLabel: "3 Months",
    durationMonths: 3,
    accessLabel: "Gym, Spa & Pool Access",
    packagePrice: 80000,
    offerPrice: 40000,
  },
  {
    location: "bashundhara-city-shopping-mall",
    tier: "gold",
    durationLabel: "6 Months",
    durationMonths: 6,
    accessLabel: "Gym, Spa & Pool Access",
    packagePrice: 150000,
    offerPrice: 75000,
  },
  {
    location: "bashundhara-city-shopping-mall",
    tier: "gold",
    durationLabel: "1 Year",
    durationMonths: 12,
    accessLabel: "Gym, Spa & Pool Access",
    packagePrice: 250000,
    offerPrice: 125000,
  },
  {
    location: "bashundhara-city-shopping-mall",
    tier: "silver",
    durationLabel: "1 Month",
    durationMonths: 1,
    accessLabel: "Gym Access Only",
    packagePrice: 25000,
    offerPrice: 12500,
  },
  {
    location: "bashundhara-city-shopping-mall",
    tier: "silver",
    durationLabel: "3 Months",
    durationMonths: 3,
    accessLabel: "Gym Access Only",
    packagePrice: 65000,
    offerPrice: 32500,
  },
  {
    location: "bashundhara-city-shopping-mall",
    tier: "silver",
    durationLabel: "6 Months",
    durationMonths: 6,
    accessLabel: "Gym Access Only",
    packagePrice: 110000,
    offerPrice: 55000,
  },
  {
    location: "bashundhara-city-shopping-mall",
    tier: "silver",
    durationLabel: "1 Year",
    durationMonths: 12,
    accessLabel: "Gym Access Only",
    packagePrice: 180000,
    offerPrice: 90000,
  },
  {
    location: "bashundhara-city-shopping-mall",
    tier: "pool-spa",
    durationLabel: "1 Month",
    durationMonths: 1,
    accessLabel: "Spa & Pool Access Only",
    packagePrice: 25000,
    offerPrice: 17500,
  },
  {
    location: "bashundhara-city-shopping-mall",
    tier: "pool-spa",
    durationLabel: "3 Months",
    durationMonths: 3,
    accessLabel: "Spa & Pool Access Only",
    packagePrice: 45000,
    offerPrice: 31500,
  },
  {
    location: "bashundhara-city-shopping-mall",
    tier: "pool-spa",
    durationLabel: "6 Months",
    durationMonths: 6,
    accessLabel: "Spa & Pool Access Only",
    packagePrice: 75000,
    offerPrice: 52500,
  },
  {
    location: "bashundhara-city-shopping-mall",
    tier: "pool-spa",
    durationLabel: "1 Year",
    durationMonths: 12,
    accessLabel: "Spa & Pool Access Only",
    packagePrice: 125000,
    offerPrice: 87500,
  },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

async function run() {
  if (!SHOULD_WRITE) {
    console.log("Dry run only. Re-run with --confirm to seed packages.");
    return;
  }

  if (dataset !== "production") {
    console.error(
      `Refusing to seed into \"${dataset}\". Set NEXT_PUBLIC_SANITY_DATASET=production to continue.`
    );
    process.exit(1);
  }

  for (const pkg of packageSeeds) {
    const locationMeta = LOCATION_MAP[pkg.location];
    const tierLabel = TIER_LABELS[pkg.tier] ?? pkg.tier;
    const durationSlug = slugify(pkg.durationLabel);
    const slug = `${locationMeta.short}-${pkg.tier}-${durationSlug}`;
    const title = `${tierLabel} ${pkg.durationLabel} - ${locationMeta.label}`;

    await writeClient.createOrReplace({
      _id: `subscription-package-${slug}`,
      _type: "subscriptionPackage",
      title,
      slug: {
        _type: "slug",
        current: slug,
      },
      location: pkg.location,
      tier: pkg.tier,
      durationLabel: pkg.durationLabel,
      durationMonths: pkg.durationMonths,
      accessLabel: pkg.accessLabel,
      packagePrice: pkg.packagePrice,
      offerPrice: pkg.offerPrice,
      order: pkg.durationMonths,
      featured: true,
    });
  }

  console.log(`Seeded ${packageSeeds.length} subscription packages.`);
}

run().catch((error) => {
  console.error("Failed to seed packages:", error);
  process.exit(1);
});
