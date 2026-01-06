import "dotenv/config";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { writeClient } from "../sanity/lib/client";
import { dataset } from "../sanity/env";

type CategorySeed = {
  title: string;
  slug: string;
  url: string;
};

const SHOULD_WRITE = process.argv.includes("--confirm");
const SKIP_DELETE = process.argv.includes("--skip-delete");
const limitIndex = process.argv.indexOf("--limit");
const PER_CATEGORY_LIMIT =
  limitIndex !== -1 ? Number(process.argv[limitIndex + 1]) : 8;
const minIndex = process.argv.indexOf("--min");
const parsedMin = minIndex !== -1 ? Number(process.argv[minIndex + 1]) : NaN;
const MIN_PER_CATEGORY = Number.isFinite(parsedMin) ? parsedMin : 5;
const onlyIndex = process.argv.indexOf("--only");
const ONLY_SLUGS =
  onlyIndex !== -1
    ? (process.argv[onlyIndex + 1] ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : null;

const DEFAULT_STOCK = 25;
const BRAND_NAME = "Nutrition Depot";
const PRODUCT_TYPE = "supplement";

const CATEGORY_SEEDS: CategorySeed[] = [
  {
    title: "Creatine",
    slug: "creatine",
    url: "https://www.nutritiondepot.com.bd/product-category/creatine/",
  },
  {
    title: "Pre-Workout",
    slug: "pre-workout",
    url: "https://www.nutritiondepot.com.bd/product-category/pre-workout/",
  },
  {
    title: "Fat Burner",
    slug: "fat-burner",
    url: "https://www.nutritiondepot.com.bd/product-category/fat_burner/",
  },
  {
    title: "Mass Gainer",
    slug: "mass-gainer",
    url: "https://www.nutritiondepot.com.bd/product-category/mass_gainer/",
  },
  {
    title: "Protein",
    slug: "protein",
    url: "https://www.nutritiondepot.com.bd/product-category/protein/",
  },
  {
    title: "BCAA & Aminos",
    slug: "bcaa-aminos",
    url: "https://www.nutritiondepot.com.bd/product-category/bcaa-aminos/",
  },
  {
    title: "Women's Collection",
    slug: "womens-collection",
    url: "https://www.nutritiondepot.com.bd/product-category/womens-collection/",
  },
  {
    title: "Recovery",
    slug: "recovery",
    url: "https://www.nutritiondepot.com.bd/product-category/recovery/",
  },
  {
    title: "Stress & Sleep Aid",
    slug: "stress-sleep-aid",
    url: "https://www.nutritiondepot.com.bd/product-category/stress-sleep-aid/",
  },
  {
    title: "Joint Support",
    slug: "joint-support",
    url: "https://www.nutritiondepot.com.bd/product-category/joint-support/",
  },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const decodeHtml = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const htmlToText = (html: string) =>
  decodeHtml(
    html
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+\n/g, "\n")
      .replace(/\n\s+/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );

const slugFromUrl = (url: string) => {
  const cleaned = url.split("?")[0] ?? "";
  const match = cleaned.match(/\/product\/([^/]+)\//);
  return match?.[1] ?? "";
};

const getFilename = (url: string) => {
  const cleaned = url.split("?")[0] ?? "image.jpg";
  return path.basename(cleaned);
};

const parseJsonLdBlocks = (html: string) => {
  const matches = html.matchAll(
    /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  );
  const nodes: Record<string, unknown>[] = [];

  const collect = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach((item) => collect(item));
      return;
    }
    const record = value as Record<string, unknown>;
    if (record["@graph"]) {
      collect(record["@graph"]);
      return;
    }
    nodes.push(record);
  };

  for (const match of matches) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    try {
      const data = JSON.parse(raw);
      collect(data);
    } catch {
      // ignore malformed blocks
    }
  }

  return nodes;
};

const isProductNode = (node: Record<string, unknown>) => {
  const type = node["@type"];
  if (Array.isArray(type)) {
    return type.includes("Product");
  }
  return type === "Product";
};

const resolveImageUrl = (
  image: unknown,
  nodes: Record<string, unknown>[]
): string | string[] | null => {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (Array.isArray(image)) {
    return image
      .map((item) => resolveImageUrl(item, nodes))
      .filter(Boolean) as string[];
  }
  if (typeof image === "object") {
    const imgObj = image as Record<string, unknown>;
    if (typeof imgObj.url === "string") return imgObj.url;
    if (typeof imgObj["@id"] === "string") {
      const match = nodes.find((node) => node["@id"] === imgObj["@id"]);
      if (match && typeof match.url === "string") return match.url as string;
    }
  }
  return null;
};

const extractGalleryImages = (html: string) => {
  const matches = html.matchAll(/data-large_image="([^"]+)"/g);
  return Array.from(matches)
    .map((match) => match[1])
    .filter(Boolean);
};

const findNextPage = (html: string) => {
  const match = html.match(/rel="next" href="([^"]+)"/);
  return match?.[1] ?? null;
};

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; GoldsGymBD/1.0; +https://goldsgym.com.bd)",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

async function collectProductUrls(categoryUrl: string) {
  const urls = new Set<string>();
  let pageUrl: string | null = categoryUrl;
  let pageCount = 0;

  while (pageUrl) {
    const html = await fetchHtml(pageUrl);
    const nodes = parseJsonLdBlocks(html);
    nodes
      .filter((node) => isProductNode(node))
      .forEach((node) => {
        const url = node.url;
        if (typeof url === "string" && url.includes("/product/")) {
          urls.add(url);
        }
      });

    pageUrl = findNextPage(html);
    pageCount += 1;
    if (pageCount > 30) break;
    await sleep(250);
  }

  return Array.from(urls);
}

async function uploadImage(url: string, cache: Map<string, string>) {
  if (cache.has(url)) {
    return cache.get(url) ?? null;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image ${url}: ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") ?? undefined;
  const filename = getFilename(url);
  const asset = await writeClient.assets.upload("image", buffer, {
    filename,
    contentType,
  });
  cache.set(url, asset._id);
  return asset._id;
}

async function ensureSupplementsCategory() {
  const existing = await writeClient.fetch(
    `*[_type == "category" && slug.current == $slug][0]{_id}`,
    { slug: "supplements" }
  );
  if (existing?._id) {
    await writeClient
      .patch(existing._id)
      .set({
        title: "Supplements",
        order: 2,
        featuredInMenu: true,
        filterConfig: {
          showBrand: true,
          showGoals: true,
          showSports: false,
          showGender: false,
          optionFilters: ["Flavor", "Weight", "Form"],
        },
      })
      .commit();
    return existing._id as string;
  }

  const created = await writeClient.create({
    _type: "category",
    title: "Supplements",
    slug: { _type: "slug", current: "supplements" },
    order: 2,
    featuredInMenu: true,
    filterConfig: {
      showBrand: true,
      showGoals: true,
      showSports: false,
      showGender: false,
      optionFilters: ["Flavor", "Weight", "Form"],
    },
  });
  return created._id;
}

async function ensureSubcategory(
  parentId: string,
  seed: CategorySeed,
  order: number
) {
  const existing = await writeClient.fetch(
    `*[_type == "category" && slug.current == $slug][0]{_id}`,
    { slug: seed.slug }
  );
  if (existing?._id) {
    await writeClient
      .patch(existing._id)
      .set({
        title: seed.title,
        order,
        featuredInMenu: true,
        parent: { _type: "reference", _ref: parentId },
        filterConfig: {
          showBrand: true,
          showGoals: true,
          showSports: false,
          showGender: false,
          optionFilters: ["Flavor", "Weight", "Form"],
        },
      })
      .commit();
    return existing._id as string;
  }

  const created = await writeClient.create({
    _type: "category",
    title: seed.title,
    slug: { _type: "slug", current: seed.slug },
    order,
    featuredInMenu: true,
    parent: { _type: "reference", _ref: parentId },
    filterConfig: {
      showBrand: true,
      showGoals: true,
      showSports: false,
      showGender: false,
      optionFilters: ["Flavor", "Weight", "Form"],
    },
  });
  return created._id;
}

async function fetchProductData(url: string) {
  const html = await fetchHtml(url);
  const nodes = parseJsonLdBlocks(html);
  const productNode =
    nodes.find(
      (node) =>
        isProductNode(node) &&
        (node.url === url ||
          (node.mainEntityOfPage &&
            typeof node.mainEntityOfPage === "object" &&
            (node.mainEntityOfPage as Record<string, unknown>)["@id"]?.toString()?.includes(
              url
            )))
    ) ?? nodes.find((node) => isProductNode(node));

  if (!productNode) {
    return null;
  }

  const rawName = typeof productNode.name === "string" ? productNode.name : "";
  const name = decodeHtml(
    rawName.replace(/\s+-\s+Nutrition Depot Bangladesh$/i, "")
  );
  const description =
    typeof productNode.description === "string"
      ? decodeHtml(productNode.description)
      : "";
  const offers =
    productNode.offers as Record<string, unknown> | Record<string, unknown>[] | undefined;
  const offer = Array.isArray(offers) ? offers[0] : offers;
  const priceValue = offer?.price ? Number(offer.price) : 0;
  const sku = typeof productNode.sku === "string" ? productNode.sku : null;

  const imageCandidates = resolveImageUrl(productNode.image, nodes);
  const galleryImages = extractGalleryImages(html);
  const imageUrls = [
    ...(Array.isArray(imageCandidates)
      ? imageCandidates
      : imageCandidates
        ? [imageCandidates]
        : []),
    ...galleryImages,
  ]
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);

  return {
    name: name || decodeHtml(rawName) || "Nutrition Depot Supplement",
    description:
      description ||
      "Premium supplement formulated for daily performance and recovery.",
    descriptionHtml: description ? `<p>${description}</p>` : undefined,
    price: Number.isFinite(priceValue) && priceValue > 0 ? priceValue : 1500,
    sku,
    imageUrls,
    slug: slugFromUrl(url),
  };
}

async function deleteExistingSupplements(parentId: string) {
  const childCategories = await writeClient.fetch<{ _id: string }[]>(
    `*[_type == "category" && parent._ref == $parentId]{_id}`,
    { parentId }
  );
  const categoryIds = [parentId, ...childCategories.map((item) => item._id)];

  const products = await writeClient.fetch<{ _id: string }[]>(
    `*[_type == "product" && category._ref in $categoryIds]{_id}`,
    { categoryIds }
  );
  const productIds = products.map((product) => product._id);

  if (productIds.length > 0) {
    const collections = await writeClient.fetch<{ _id: string }[]>(
      `*[_type == "collection" && count(products[_ref in $productIds]) > 0]{_id}`,
      { productIds }
    );
    for (const collection of collections) {
      await writeClient
        .patch(collection._id)
        .unset(productIds.map((id) => `products[_ref=="${id}"]`))
        .commit();
    }
  }

  for (const product of products) {
    await writeClient.delete(product._id);
  }

  for (const category of childCategories) {
    await writeClient.delete(category._id);
  }
}

async function run() {
  if (!SHOULD_WRITE) {
    console.log("Dry run only. Re-run with --confirm to seed supplements.");
    return;
  }

  if (dataset !== "production") {
    console.error(
      `Refusing to seed into "${dataset}". Set NEXT_PUBLIC_SANITY_DATASET=production to continue.`
    );
    process.exit(1);
  }

  const parentId = await ensureSupplementsCategory();
  if (!SKIP_DELETE) {
    await deleteExistingSupplements(parentId);
  }

  const assetCache = new Map<string, string>();
  const existingProducts = await writeClient.fetch<
    { slug: string | null; categorySlug: string | null }[]
  >(
    `*[_type == "product" && brand == $brand]{
      "slug": slug.current,
      "categorySlug": category->slug.current
    }`,
    { brand: BRAND_NAME }
  );
  const reservedSlugs = new Set<string>();
  const existingByCategory = new Map<string, Set<string>>();

  for (const product of existingProducts) {
    if (!product.slug) continue;
    reservedSlugs.add(product.slug);
    if (product.categorySlug) {
      if (!existingByCategory.has(product.categorySlug)) {
        existingByCategory.set(product.categorySlug, new Set());
      }
      existingByCategory.get(product.categorySlug)?.add(product.slug);
    }
  }
  const seeds = ONLY_SLUGS
    ? CATEGORY_SEEDS.filter((seed) => ONLY_SLUGS.includes(seed.slug))
    : CATEGORY_SEEDS;

  if (ONLY_SLUGS && seeds.length === 0) {
    console.warn(`No categories matched: ${ONLY_SLUGS.join(", ")}`);
    return;
  }

  for (const [index, seed] of seeds.entries()) {
    const categoryId = await ensureSubcategory(parentId, seed, index + 1);
    const existingForCategory =
      existingByCategory.get(seed.slug) ?? new Set<string>();
    const limit =
      Number.isFinite(PER_CATEGORY_LIMIT) && PER_CATEGORY_LIMIT > 0
        ? PER_CATEGORY_LIMIT
        : MIN_PER_CATEGORY;
    const desiredTotal = Math.max(limit, MIN_PER_CATEGORY);
    const needed = Math.max(0, desiredTotal - existingForCategory.size);

    if (needed === 0) {
      console.log(
        `${seed.title}: already has ${existingForCategory.size} products.`
      );
      continue;
    }

    const productUrls = await collectProductUrls(seed.url);
    const selected: { url: string; slug: string }[] = [];

    for (const url of productUrls) {
      if (selected.length >= needed) break;
      const slug = slugFromUrl(url);
      if (!slug || reservedSlugs.has(slug)) continue;
      selected.push({ url, slug });
      reservedSlugs.add(slug);
    }

    if (selected.length === 0) {
      console.warn(`No products found for ${seed.title}.`);
      continue;
    }

    console.log(`Seeding ${selected.length} products for ${seed.title}...`);

    let importedCount = 0;
    for (const [productIndex, item] of selected.entries()) {
      try {
        const data = await fetchProductData(item.url);
        if (!data?.slug || data.imageUrls.length === 0) {
          console.warn(`Skipping ${item.url}: missing slug or images`);
          continue;
        }

        const productId = `product-nd-${data.slug}`;
        const existing = await writeClient.fetch(
          `*[_type == "product" && _id == $id][0]{_id}`,
          { id: productId }
        );

        if (existing?._id) {
          console.log(
            `(${productIndex + 1}/${selected.length}) exists: ${data.slug}`
          );
          continue;
        }

        const imageAssets: string[] = [];
        for (const imageUrl of data.imageUrls.slice(0, 4)) {
          try {
            const assetId = await uploadImage(imageUrl, assetCache);
            if (assetId) imageAssets.push(assetId);
            await sleep(100);
          } catch (error) {
            console.warn(`Image upload failed: ${imageUrl}`, error);
          }
        }

        if (imageAssets.length === 0) {
          console.warn(`Skipping ${data.slug}: no uploaded images`);
          continue;
        }

        const images = imageAssets.map((assetId) => ({
          _key: randomUUID(),
          _type: "image",
          asset: { _type: "reference", _ref: assetId },
        }));

        const metafields = [
          {
            _key: randomUUID(),
            key: "source",
            type: "string",
            valueString: "NutritionDepot",
          },
          {
            _key: randomUUID(),
            key: "sourceCategory",
            type: "string",
            valueString: seed.slug,
          },
          {
            _key: randomUUID(),
            key: "sourceUrl",
            type: "string",
            valueString: item.url,
          },
        ];

        if (data.sku) {
          metafields.push({
            _key: randomUUID(),
            key: "sku",
            type: "string",
            valueString: data.sku,
          });
        }

        await writeClient.createIfNotExists({
          _id: productId,
          _type: "product",
          name: data.name,
          slug: { _type: "slug", current: data.slug },
          description: data.description,
          descriptionHtml: data.descriptionHtml,
          brand: BRAND_NAME,
          productType: PRODUCT_TYPE,
          price: data.price,
          category: { _type: "reference", _ref: categoryId },
          images,
          stock: DEFAULT_STOCK,
          featured: false,
          isDigital: false,
          metafields,
        });

        importedCount += 1;
        console.log(
          `(${productIndex + 1}/${selected.length}) imported: ${data.slug}`
        );
        await sleep(250);
      } catch (error) {
        console.error(`Failed to import ${item.url}:`, error);
      }
    }

    const finalCount = existingForCategory.size + importedCount;
    if (finalCount < MIN_PER_CATEGORY) {
      console.warn(
        `${seed.title}: only ${finalCount} products available (target ${MIN_PER_CATEGORY}-${limit}).`
      );
    }
  }

  console.log("Nutrition Depot supplements seed complete.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
