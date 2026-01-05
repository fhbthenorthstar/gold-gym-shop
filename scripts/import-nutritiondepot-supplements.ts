import "dotenv/config";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { writeClient } from "../sanity/lib/client";
import { dataset } from "../sanity/env";

const CATEGORY_URL =
  "https://www.nutritiondepot.com.bd/product-category/supplements/";
const SHOULD_WRITE = process.argv.includes("--confirm");
const limitIndex = process.argv.indexOf("--limit");
const LIMIT =
  limitIndex !== -1 ? Number(process.argv[limitIndex + 1]) : undefined;

const DEFAULT_STOCK = 25;
const BRAND_NAME = "Nutrition Depot";
const PRODUCT_TYPE = "supplement";

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

async function collectProductUrls() {
  const urls = new Set<string>();
  let pageUrl: string | null = CATEGORY_URL;
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
    if (pageCount > 40) break;
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

async function ensureCategory() {
  const existing = await writeClient.fetch(
    `*[_type == "category" && slug.current == $slug][0]{_id}`,
    { slug: "supplements" }
  );
  if (existing?._id) return existing._id as string;

  const created = await writeClient.create({
    _type: "category",
    title: "Supplements",
    slug: { _type: "slug", current: "supplements" },
    order: 1,
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
  const name = decodeHtml(rawName.replace(/\s+-\s+Nutrition Depot Bangladesh$/i, ""));
  const description = typeof productNode.description === "string"
    ? decodeHtml(productNode.description)
    : "";
  const offers = productNode.offers as Record<string, unknown> | Record<string, unknown>[] | undefined;
  const offer = Array.isArray(offers) ? offers[0] : offers;
  const priceValue = offer?.price ? Number(offer.price) : 0;
  const sku = typeof productNode.sku === "string" ? productNode.sku : null;

  const imageCandidates = resolveImageUrl(productNode.image, nodes);
  const galleryImages = extractGalleryImages(html);
  const imageUrls = [
    ...(Array.isArray(imageCandidates) ? imageCandidates : imageCandidates ? [imageCandidates] : []),
    ...galleryImages,
  ]
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);

  return {
    name: name || decodeHtml(rawName) || "Nutrition Depot Supplement",
    description: description || "Premium supplement formulated for daily performance and recovery.",
    descriptionHtml: description ? `<p>${description}</p>` : undefined,
    price: Number.isFinite(priceValue) && priceValue > 0 ? priceValue : 1500,
    sku,
    imageUrls,
    slug: slugFromUrl(url),
  };
}

async function run() {
  if (!SHOULD_WRITE) {
    console.log(
      "Dry run only. Re-run with --confirm to import supplements."
    );
  }

  if (dataset !== "production") {
    console.error(
      `Refusing to import into "${dataset}". Set NEXT_PUBLIC_SANITY_DATASET=production to continue.`
    );
    process.exit(1);
  }

  const categoryId = await ensureCategory();
  const productUrls = await collectProductUrls();
  const trimmedUrls = LIMIT ? productUrls.slice(0, LIMIT) : productUrls;

  console.log(`Found ${productUrls.length} product URLs.`);
  if (LIMIT) {
    console.log(`Limiting to ${LIMIT} products for this run.`);
  }

  const assetCache = new Map<string, string>();
  let imported = 0;

  for (const [index, url] of trimmedUrls.entries()) {
    try {
      const data = await fetchProductData(url);
      if (!data?.slug || data.imageUrls.length === 0) {
        console.warn(`Skipping ${url}: missing slug or images`);
        continue;
      }

      const productId = `product-nd-${data.slug}`;
      const existing = await writeClient.fetch(
        `*[_type == "product" && _id == $id][0]{_id}`,
        { id: productId }
      );

      if (existing?._id) {
        console.log(`(${index + 1}/${trimmedUrls.length}) exists: ${data.slug}`);
        continue;
      }

      const imageAssets: string[] = [];
      for (const imageUrl of data.imageUrls) {
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

      const metafields = data.sku
        ? [
            {
              _key: randomUUID(),
              key: "sku",
              type: "string",
              valueString: data.sku,
            },
            {
              _key: randomUUID(),
              key: "source",
              type: "string",
              valueString: "NutritionDepot",
            },
          ]
        : [
            {
              _key: randomUUID(),
              key: "source",
              type: "string",
              valueString: "NutritionDepot",
            },
          ];

      if (SHOULD_WRITE) {
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
          featured: index < 12,
          isDigital: false,
          metafields,
        });
      } else {
        console.log(`[dry-run] Would import ${data.slug}`);
      }

      imported += 1;
      console.log(
        `(${index + 1}/${trimmedUrls.length}) imported: ${data.slug}`
      );
      await sleep(250);
    } catch (error) {
      console.error(`Failed to import ${url}:`, error);
    }
  }

  console.log(`Imported ${imported} supplements.`);
}

run();
