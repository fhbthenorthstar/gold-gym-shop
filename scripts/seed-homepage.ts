import "dotenv/config";
import { writeClient } from "../sanity/lib/client";
import { dataset } from "../sanity/env";

const SHOULD_WRITE = process.argv.includes("--confirm");
const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const toAbsoluteUrl = (path: string) => new URL(path, siteUrl).toString();
const normalizeUrl = (url: string) =>
  url.startsWith("//") ? `https:${url}` : url;

const imageCache = new Map<string, string>();

const uploadImage = async (url: string) => {
  const normalized = normalizeUrl(url);
  const cached = imageCache.get(normalized);
  if (cached) return cached;

  const response = await fetch(normalized);
  if (!response.ok) {
    throw new Error(`Failed to fetch image ${normalized}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") ?? undefined;
  const filename = normalized.split("?")[0]?.split("/").pop() ?? "image.jpg";

  const asset = await writeClient.assets.upload("image", buffer, {
    filename,
    contentType,
  });

  imageCache.set(normalized, asset._id);
  return asset._id;
};

const buildImage = (assetId: string) => ({
  _type: "image",
  asset: {
    _type: "reference",
    _ref: assetId,
  },
});

const offerSeed = {
  _id: "home-offer-fitfinity",
  _type: "homeOffer",
  eyebrow: "The Gym Offers",
  title: "The Gym with Safe and Comfort Zone",
  description:
    "Aenean vel elit scelerisque mauris pellentesque. At varius vel pharetra vel turpis. Volutpat odio facilisis mauris sit amet massa vitae tortor condimentum.",
  bullets: [
    "Maecenas venenatis augue dui",
    "Orci varius natoque penatibus",
    "Eget eleifend urna fringilla id.",
    "Pagnis dis parturient montes.",
  ],
  ctaLabel: "Discover More",
  ctaLink: toAbsoluteUrl("/pages/about-us"),
  imageUrl:
    "https://dt-fitfinity.myshopify.com/cdn/shop/files/Rectangle_9.png?v=1707204172",
  brandLogoUrls: [
    "https://dt-fitfinity.myshopify.com/cdn/shop/files/Botrio_logo_1.png?v=1707208506",
    "https://dt-fitfinity.myshopify.com/cdn/shop/files/Jerix_Logo_1.png?v=1707208506",
    "https://dt-fitfinity.myshopify.com/cdn/shop/files/Rave_Logo_1.png?v=1707208506",
    "https://dt-fitfinity.myshopify.com/cdn/shop/files/Urban_1_2.png?v=1707218457",
  ],
  order: 0,
};

const trainerSeeds = [
  {
    _id: "trainer-david",
    name: "David",
    role: "Strength Coach",
    imageUrl:
      "https://dt-fitfinity.myshopify.com/cdn/shop/files/Rectangle_14_1.png?v=1707204754",
    order: 0,
  },
  {
    _id: "trainer-jenny",
    name: "Jenny",
    role: "Fitness Trainer",
    imageUrl:
      "https://dt-fitfinity.myshopify.com/cdn/shop/files/Rectangle_10.png?v=1707204754",
    order: 1,
  },
  {
    _id: "trainer-mathew",
    name: "Mathew",
    role: "Conditioning Coach",
    imageUrl:
      "https://dt-fitfinity.myshopify.com/cdn/shop/files/Rectangle_11_3.png?v=1707204722",
    order: 2,
  },
  {
    _id: "trainer-alisa",
    name: "Alisa",
    role: "Wellness Coach",
    imageUrl:
      "https://dt-fitfinity.myshopify.com/cdn/shop/files/Rectangle_12_1.png?v=1707204722",
    order: 3,
  },
];

const testimonialSeeds = [
  {
    _id: "testimonial-alfie-russell",
    name: "Alfie Russell",
    role: "CEO",
    quote:
      "Nunc quis lorem ligula. Cras quis ultricies ipsum. Suspendisse potenti. Ut efficitur convallis rim ctetur lectus id blandit. Curabitur lorem ipsum dolor sit amet, consectetur adipiscing elit. Cr blandit sit amet, consectetur cras orci nunc, facilisis sed massa vitae, ullam lacus rictra.",
    rating: 4,
    avatarUrl:
      "https://dt-fitfinity.myshopify.com/cdn/shop/files/Ellipse_4_3.png?v=1707204860",
    order: 0,
  },
  {
    _id: "testimonial-olivia-emma",
    name: "Olivia Emma",
    role: "MD",
    quote:
      "Ut efficitur convallis rim ctetur lectus id blandit. Nunc quis lorem ligula. Cras quis ultricies ipsum. Suspendisse potenti. Curabitur lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    rating: 3,
    avatarUrl:
      "https://dt-fitfinity.myshopify.com/cdn/shop/files/Ellipse_3_3.png?v=1707204860",
    order: 1,
  },
  {
    _id: "testimonial-nerisan-sophia",
    name: "Nerisan Sophia",
    role: "Developer",
    quote:
      "Sit amet, consectetur cras orci nunc, facilisis sed massa vitae, ullam lacus esctra. Nunc quis lorem ligula. Convallis rim ctetur lectus id blandit. Curabitur lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    rating: 5,
    avatarUrl:
      "https://dt-fitfinity.myshopify.com/cdn/shop/files/Ellipse_2_5.png?v=1707204897",
    order: 2,
  },
  {
    _id: "testimonial-luna-emily",
    name: "Luna Emily",
    role: "Musician",
    quote:
      "Curabitur lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc quis lorem ligula. Cras quis ultricies ipsum. Suspendisse potenti. Ut efficitur convallis rim ctetur lectus id blandit.",
    rating: 3,
    avatarUrl:
      "https://dt-fitfinity.myshopify.com/cdn/shop/files/home-testimonial-1-1.webp?v=1707208289",
    order: 3,
  },
];

const gallerySeeds = [
  {
    _id: "gallery-rectangle-22",
    title: "Fitfinity Gallery 1",
    link: toAbsoluteUrl("/shop"),
    imageUrl:
      "https://dt-fitfinity.myshopify.com/cdn/shop/files/Rectangle_22.png?v=1707207603",
    order: 0,
  },
  {
    _id: "gallery-rectangle-17",
    title: "Fitfinity Gallery 2",
    link: toAbsoluteUrl("/shop"),
    imageUrl:
      "https://dt-fitfinity.myshopify.com/cdn/shop/files/Rectangle_17_2.png?v=1707212312",
    order: 1,
  },
  {
    _id: "gallery-rectangle-18",
    title: "Fitfinity Gallery 3",
    link: toAbsoluteUrl("/shop"),
    imageUrl:
      "https://dt-fitfinity.myshopify.com/cdn/shop/files/Rectangle_18_1.png?v=1707207602",
    order: 2,
  },
  {
    _id: "gallery-rectangle-19",
    title: "Fitfinity Gallery 4",
    link: toAbsoluteUrl("/shop"),
    imageUrl:
      "https://dt-fitfinity.myshopify.com/cdn/shop/files/Rectangle_19_2.png?v=1707212312",
    order: 3,
  },
  {
    _id: "gallery-rectangle-21",
    title: "Fitfinity Gallery 5",
    link: toAbsoluteUrl("/shop"),
    imageUrl:
      "https://dt-fitfinity.myshopify.com/cdn/shop/files/Rectangle_21_1.png?v=1707207676",
    order: 4,
  },
  {
    _id: "gallery-rectangle-21-2",
    title: "Fitfinity Gallery 6",
    link: toAbsoluteUrl("/shop"),
    imageUrl:
      "https://dt-fitfinity.myshopify.com/cdn/shop/files/Rectangle_21_2.png?v=1707212312",
    order: 5,
  },
  {
    _id: "gallery-rectangle-20",
    title: "Fitfinity Gallery 7",
    link: toAbsoluteUrl("/shop"),
    imageUrl:
      "https://dt-fitfinity.myshopify.com/cdn/shop/files/Rectangle_20_1.png?v=1707207676",
    order: 6,
  },
];

async function seedOffer() {
  const imageId = await uploadImage(offerSeed.imageUrl);
  const brandLogoIds = await Promise.all(
    offerSeed.brandLogoUrls.map((url) => uploadImage(url))
  );

  await writeClient.createOrReplace({
    _id: offerSeed._id,
    _type: offerSeed._type,
    eyebrow: offerSeed.eyebrow,
    title: offerSeed.title,
    description: offerSeed.description,
    bullets: offerSeed.bullets,
    ctaLabel: offerSeed.ctaLabel,
    ctaLink: offerSeed.ctaLink,
    image: buildImage(imageId),
    brandLogos: brandLogoIds.map((assetId) => buildImage(assetId)),
    order: offerSeed.order,
  });
}

async function seedTrainers() {
  for (const trainer of trainerSeeds) {
    const imageId = await uploadImage(trainer.imageUrl);
    await writeClient.createOrReplace({
      _id: trainer._id,
      _type: "trainer",
      name: trainer.name,
      role: trainer.role,
      image: buildImage(imageId),
      order: trainer.order,
      featured: true,
    });
  }
}

async function seedTestimonials() {
  for (const testimonial of testimonialSeeds) {
    const avatarId = await uploadImage(testimonial.avatarUrl);
    await writeClient.createOrReplace({
      _id: testimonial._id,
      _type: "testimonial",
      name: testimonial.name,
      role: testimonial.role,
      quote: testimonial.quote,
      rating: testimonial.rating,
      avatar: buildImage(avatarId),
      order: testimonial.order,
      featured: true,
    });
  }
}

async function seedGallery() {
  for (const item of gallerySeeds) {
    const imageId = await uploadImage(item.imageUrl);
    await writeClient.createOrReplace({
      _id: item._id,
      _type: "galleryImage",
      title: item.title,
      link: item.link,
      image: buildImage(imageId),
      order: item.order,
      featured: true,
    });
  }
}

async function run() {
  if (!SHOULD_WRITE) {
    console.log(
      "Dry run only. Re-run with --confirm to seed homepage content."
    );
    return;
  }

  if (dataset !== "production") {
    console.error(
      `Refusing to seed into "${dataset}". Set NEXT_PUBLIC_SANITY_DATASET=production to continue.`
    );
    process.exit(1);
  }

  await seedOffer();
  await seedTrainers();
  await seedTestimonials();
  await seedGallery();

  console.log("Homepage content seeded successfully.");
}

run().catch((error) => {
  console.error("Failed to seed homepage content:", error);
  process.exit(1);
});
