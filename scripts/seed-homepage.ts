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
  _id: "home-offer-goldsgym",
  _type: "homeOffer",
  eyebrow: "The Gym Offers",
  title: "Gold's Gym Bangladesh Experience",
  description:
    "Train with world-class equipment, certified coaches, and a motivating community built to help you reach your goals.",
  bullets: [
    "Premium strength & conditioning zones",
    "Certified trainers and custom programs",
    "Recovery facilities including spa & pool",
    "Flexible memberships for every lifestyle",
  ],
  ctaLabel: "Discover More",
  ctaLink: toAbsoluteUrl("/about"),
  imageUrl: toAbsoluteUrl("/gold-gym-contact.jpg"),
  brandLogoUrls: [
    toAbsoluteUrl("/Gold's_Gym_logo.png"),
    toAbsoluteUrl("/goldgymshop.png"),
    toAbsoluteUrl("/Gold's_Gym_logo (1).png"),
    toAbsoluteUrl("/Gold's_Gym_logo.png"),
  ],
  order: 0,
};

const trainerSeeds = [
  {
    _id: "trainer-david",
    name: "David",
    role: "Strength Coach",
    imageUrl: toAbsoluteUrl("/trinners/1.jpg"),
    order: 0,
  },
  {
    _id: "trainer-jenny",
    name: "Jenny",
    role: "Fitness Trainer",
    imageUrl: toAbsoluteUrl("/trinners/2.jpg"),
    order: 1,
  },
  {
    _id: "trainer-mathew",
    name: "Mathew",
    role: "Conditioning Coach",
    imageUrl: toAbsoluteUrl("/trinners/3.jpg"),
    order: 2,
  },
  {
    _id: "trainer-alisa",
    name: "Alisa",
    role: "Wellness Coach",
    imageUrl: toAbsoluteUrl("/trinners/4.jpg"),
    order: 3,
  },
];

const testimonialSeeds = [
  {
    _id: "testimonial-alfie-russell",
    name: "Arifin Shuvoo",
    role: "Actor, Artist",
    quote:
      "Discipline is everything in my career—and Gold's Gym gives me the perfect environment to stay focused and push harder every day.",
    rating: 5,
    avatarUrl: toAbsoluteUrl("/instagram/1.jpg"),
    order: 0,
  },
  {
    _id: "testimonial-olivia-emma",
    name: "Ishrat Zaheen Ahmed",
    role: "Actor, Dancer, Influencer",
    quote:
      "Gold's Gym Bangladesh gives me the energy and balance I need to perform at my best—both on stage and on screen.",
    rating: 5,
    avatarUrl: toAbsoluteUrl("/instagram/2.jpg"),
    order: 1,
  },
  {
    _id: "testimonial-nerisan-sophia",
    name: "Rafsan Sabab",
    role: "Anchor, Comedian, Vlogger",
    quote:
      "Fitness doesn’t have to be boring. At Gold's Gym, every session feels exciting and it keeps me sharp for my work.",
    rating: 5,
    avatarUrl: toAbsoluteUrl("/instagram/3.jpg"),
    order: 2,
  },
  {
    _id: "testimonial-luna-emily",
    name: "Xefer Rahman",
    role: "Singer, Musician, Actress",
    quote:
      "Training at Gold's Gym helps me stay fit, strong, and confident in everything I do.",
    rating: 5,
    avatarUrl: toAbsoluteUrl("/instagram/4.jpg"),
    order: 3,
  },
];

const gallerySeeds = [
  {
    _id: "gallery-rectangle-22",
    title: "Gold's Gym BD Gallery 1",
    link: toAbsoluteUrl("/shop"),
    imageUrl: toAbsoluteUrl("/instagram/5.jpg"),
    order: 0,
  },
  {
    _id: "gallery-rectangle-17",
    title: "Gold's Gym BD Gallery 2",
    link: toAbsoluteUrl("/shop"),
    imageUrl: toAbsoluteUrl("/instagram/6.jpg"),
    order: 1,
  },
  {
    _id: "gallery-rectangle-18",
    title: "Gold's Gym BD Gallery 3",
    link: toAbsoluteUrl("/shop"),
    imageUrl: toAbsoluteUrl("/instagram/7.jpg"),
    order: 2,
  },
  {
    _id: "gallery-rectangle-19",
    title: "Gold's Gym BD Gallery 4",
    link: toAbsoluteUrl("/shop"),
    imageUrl: toAbsoluteUrl("/instagram/8.jpg"),
    order: 3,
  },
  {
    _id: "gallery-rectangle-21",
    title: "Gold's Gym BD Gallery 5",
    link: toAbsoluteUrl("/shop"),
    imageUrl: toAbsoluteUrl("/instagram/9.jpg"),
    order: 4,
  },
  {
    _id: "gallery-rectangle-21-2",
    title: "Gold's Gym BD Gallery 6",
    link: toAbsoluteUrl("/shop"),
    imageUrl: toAbsoluteUrl("/instagram/10.jpeg"),
    order: 5,
  },
  {
    _id: "gallery-rectangle-20",
    title: "Gold's Gym BD Gallery 7",
    link: toAbsoluteUrl("/shop"),
    imageUrl: toAbsoluteUrl("/instagram/1.jpg"),
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
