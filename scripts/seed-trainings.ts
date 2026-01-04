import "dotenv/config";
import { writeClient } from "../sanity/lib/client";
import { dataset } from "../sanity/env";

const SHOULD_WRITE = process.argv.includes("--confirm");

const trainingSeeds = [
  {
    _id: "training-rope-workout",
    title: "Rope Workout",
    link: "/shop",
    imageUrl:
      "https://dt-fitfinity.myshopify.com/cdn/shop/files/Rectangle_3_2.png?v=1707204331",
    order: 0,
  },
  {
    _id: "training-boxing",
    title: "Boxing",
    link: "/shop",
    imageUrl:
      "https://dt-fitfinity.myshopify.com/cdn/shop/files/Rectangle_5_2.png?v=1707204331",
    order: 1,
  },
  {
    _id: "training-cycling",
    title: "Cycling",
    link: "/shop",
    imageUrl:
      "https://dt-fitfinity.myshopify.com/cdn/shop/files/Rectangle_6_1.png?v=1707204425",
    order: 2,
  },
  {
    _id: "training-treadmill",
    title: "Treadmill",
    link: "/shop",
    imageUrl:
      "https://dt-fitfinity.myshopify.com/cdn/shop/files/Rectangle_7_1_7042a7e6-3fe6-4818-b299-85c9d369ba37.png?v=1707220906",
    order: 3,
  },
  {
    _id: "training-zumba",
    title: "Zumba",
    link: "/shop",
    imageUrl:
      "https://dt-fitfinity.myshopify.com/cdn/shop/files/Rectangle_8.png?v=1707204425",
    order: 4,
  },
  {
    _id: "training-weight-lift",
    title: "Weight Lift",
    link: "/shop",
    imageUrl:
      "https://dt-fitfinity.myshopify.com/cdn/shop/files/Rectangle_4_5.png?v=1707291964",
    order: 5,
  },
];

const uploadImage = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image ${url}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") ?? undefined;
  const filename = url.split("?")[0]?.split("/").pop() ?? "image.jpg";

  return writeClient.assets.upload("image", buffer, {
    filename,
    contentType,
  });
};

const buildImage = (assetId: string) => ({
  _type: "image",
  asset: {
    _type: "reference",
    _ref: assetId,
  },
});

async function run() {
  if (!SHOULD_WRITE) {
    console.log("Dry run only. Re-run with --confirm to seed trainings.");
    return;
  }

  if (dataset !== "production") {
    console.error(
      `Refusing to seed into \"${dataset}\". Set NEXT_PUBLIC_SANITY_DATASET=production to continue.`
    );
    process.exit(1);
  }

  for (const training of trainingSeeds) {
    const asset = await uploadImage(training.imageUrl);
    await writeClient.createOrReplace({
      _id: training._id,
      _type: "training",
      title: training.title,
      link: training.link,
      image: buildImage(asset._id),
      order: training.order,
      featured: true,
    });
  }

  console.log("Training content seeded successfully.");
}

run().catch((error) => {
  console.error("Failed to seed trainings:", error);
  process.exit(1);
});
