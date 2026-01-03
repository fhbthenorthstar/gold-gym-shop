import "dotenv/config";
import { writeClient } from "../sanity/lib/client";
import { dataset } from "../sanity/env";

const SHOULD_WRITE = process.argv.includes("--confirm");

const normalizeUrl = (url: string) =>
  url.startsWith("//") ? `https:${url}` : url;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

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

const testimonials = [
  {
    name: "Arifin Shuvoo",
    role: "Actor, Artist",
    quote:
      "Discipline is everything in my career--and Gold's Gym gives me the perfect environment to stay focused and push harder every day",
    rating: 5,
    avatar:
      "https://goldsgym.com.bd/wp-content/uploads/2025/09/Arifin-Shuvoo.jpg",
    order: 0,
    featured: true,
  },
  {
    name: "Ishrat Zaheen Ahmed",
    role: "Actor, Dancer, Influencer",
    quote:
      "Gold's Gym Bangladesh gives me the energy and balance I need to perform at my best--both on stage and on screen",
    rating: 5,
    avatar:
      "https://goldsgym.com.bd/wp-content/uploads/2025/09/Ishrat-Zaheen-Ahmed.jpg",
    order: 1,
    featured: true,
  },
  {
    name: "Rafsan Sabab",
    role: "Anchor, Stand-Up Comedian, Vlogger",
    quote:
      "Fitness doesn't have to be boring. At Gold's Gym, every session feels exciting, and it keeps me sharp for my work and my shows",
    rating: 5,
    avatar:
      "https://goldsgym.com.bd/wp-content/uploads/2025/09/Rafsan-Sabab.jpg",
    order: 2,
    featured: true,
  },
  {
    name: "Xefer Rahman",
    role: "Singer, Musician, Actress",
    quote:
      "Music and acting demand stamina. Training at Gold's Gym helps me stay fit, strong, and confident in everything I do",
    rating: 5,
    avatar:
      "https://goldsgym.com.bd/wp-content/uploads/2025/09/Xefer-Rahman.jpg",
    order: 3,
    featured: true,
  },
  {
    name: "Tawsif Mahbub",
    role: "Actor, Producer",
    quote:
      "As a producer and actor, long hours are part of my life. Gold's Gym keeps me healthy and active so I can always give my best",
    rating: 5,
    avatar:
      "https://goldsgym.com.bd/wp-content/uploads/2025/09/Tawsif-Mahbub.jpg",
    order: 4,
    featured: true,
  },
  {
    name: "Farhan Ahmed Jovan",
    role: "Actor",
    quote:
      "Gold's Gym is not just about fitness, it's about feeling stronger and more confident in life. That's why I love it here",
    rating: 5,
    avatar:
      "https://goldsgym.com.bd/wp-content/uploads/2025/09/Farhan-Ahmed-Jovan.jpg",
    order: 5,
    featured: true,
  },
  {
    name: "Shahtaj Monira Hashem",
    role: "Actor",
    quote:
      "A healthy lifestyle is key for me. Training at Gold's Gym helps me stay active and positive, both on and off screen",
    rating: 5,
    avatar:
      "https://goldsgym.com.bd/wp-content/uploads/2025/09/Shahtaj-Monira-Hashem.jpg",
    order: 6,
    featured: true,
  },
  {
    name: "Sabila Nur",
    role: "Actor, Artist",
    quote:
      "Every visit to Gold's Gym inspires me to push my limits. It's the best place to recharge and refocus",
    rating: 5,
    avatar: "https://goldsgym.com.bd/wp-content/uploads/2025/09/Sabila-Nur.jpg",
    order: 7,
    featured: true,
  },
  {
    name: "Tasnia Farin",
    role: "Actor",
    quote:
      "For me, fitness is freedom. Gold's Gym Bangladesh provides the right mix of guidance and energy to stay fit and motivated",
    rating: 5,
    avatar: "https://goldsgym.com.bd/wp-content/uploads/2025/09/Tasnia-Farin.jpg",
    order: 8,
    featured: true,
  },
];

async function run() {
  if (!SHOULD_WRITE) {
    console.log(
      "Dry run only. Re-run with --confirm to seed testimonial documents."
    );
    return;
  }

  if (dataset !== "production") {
    console.error(
      `Refusing to seed into "${dataset}". Set NEXT_PUBLIC_SANITY_DATASET=production to continue.`
    );
    process.exit(1);
  }

  for (const testimonial of testimonials) {
    const avatarId = await uploadImage(testimonial.avatar);
    const id = `testimonial-${slugify(testimonial.name)}`;

    await writeClient.createOrReplace({
      _id: id,
      _type: "testimonial",
      name: testimonial.name,
      role: testimonial.role,
      quote: testimonial.quote,
      rating: testimonial.rating,
      avatar: buildImage(avatarId),
      order: testimonial.order,
      featured: testimonial.featured,
    });
  }

  console.log(`Seeded ${testimonials.length} testimonials.`);
}

run().catch((error) => {
  console.error("Failed to seed testimonials:", error);
  process.exit(1);
});
