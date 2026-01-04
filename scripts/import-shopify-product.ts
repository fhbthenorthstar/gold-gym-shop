import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { writeClient } from "../sanity/lib/client";
import { dataset } from "../sanity/env";

type ShopifyOption = {
  name: string;
  position: number;
  values: string[];
};

type ShopifyVariant = {
  id: number;
  title: string;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  option1?: string | null;
  option2?: string | null;
  option3?: string | null;
  featured_image?: {
    src?: string | null;
  } | null;
};

type ShopifyProduct = {
  id: number;
  title: string;
  handle: string;
  url: string;
  vendor: string;
  type: string;
  description: string;
  price_min: number;
  price_max: number;
  options: ShopifyOption[];
  variants: ShopifyVariant[];
  images: string[];
};

const DEFAULT_FILE = "/tmp/adjustable-chest-expander.json";
const SHOULD_WRITE = process.argv.includes("--confirm");
const FILE_PATH = (() => {
  const index = process.argv.indexOf("--file");
  if (index === -1) return DEFAULT_FILE;
  return process.argv[index + 1];
})();

const DEFAULT_STOCK = 12;
const STORE_URL = (process.env.SHOPIFY_SOURCE_URL ?? "").replace(/\/$/, "");

if (!STORE_URL) {
  throw new Error(
    "Missing SHOPIFY_SOURCE_URL. Set it to your Shopify store base URL."
  );
}

const normalizeUrl = (url: string) =>
  url.startsWith("//") ? `https:${url}` : url;

const priceFromCents = (value: number) =>
  Number((value / 100).toFixed(2));

const htmlToText = (html: string) =>
  html
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const getFilename = (url: string) => {
  const cleaned = url.split("?")[0] ?? "image.jpg";
  return path.basename(cleaned);
};

async function uploadImage(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image ${url}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") ?? undefined;
  const filename = getFilename(url);

  return writeClient.assets.upload("image", buffer, {
    filename,
    contentType,
  });
}

async function run() {
  if (!SHOULD_WRITE) {
    console.log("Dry run only. Re-run with --confirm to import the product.");
    return;
  }

  if (!FILE_PATH) {
    console.error("Missing --file path for the Shopify product JSON.");
    process.exit(1);
  }

  if (dataset !== "production") {
    console.error(
      `Refusing to import into "${dataset}". Set NEXT_PUBLIC_SANITY_DATASET=production to continue.`
    );
    process.exit(1);
  }

  const raw = await fs.readFile(FILE_PATH, "utf8");
  const product = JSON.parse(raw) as ShopifyProduct;

  const normalizedImages = product.images.map(normalizeUrl);
  const uploadedAssets = await Promise.all(
    normalizedImages.map((url) => uploadImage(url))
  );
  const assetByUrl = new Map(
    normalizedImages.map((url, index) => [url, uploadedAssets[index]])
  );

  const imageDocuments = normalizedImages.map((url) => {
    const asset = assetByUrl.get(url);
    if (!asset) return null;
    return {
      _key: randomUUID(),
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
    };
  });

  const categoryId = "category-equipment";
  const categoryDoc = {
    _id: categoryId,
    _type: "category",
    title: "Equipments",
    slug: { _type: "slug", current: "equipment" },
    order: 1,
    featuredInMenu: true,
    image: imageDocuments[0] ?? undefined,
    filterConfig: {
      showBrand: true,
      showGoals: true,
      showSports: true,
      showGender: false,
      optionFilters: ["Material", "Item Weight", "Color"],
    },
  };

  await writeClient.createIfNotExists(categoryDoc);

  const descriptionText = htmlToText(product.description);
  const basePrice = priceFromCents(product.price_min || 0);
  const productId = "product-adjustable-chest-expander";

  const options = product.options.map((option) => ({
    name: option.name,
    values: option.values,
  }));

  const variants = product.variants.map((variant) => {
    const optionValues = product.options
      .map((option, index) => {
        const value =
          index === 0
            ? variant.option1
            : index === 1
              ? variant.option2
              : variant.option3;
        if (!option.name || !value) return null;
        return { name: option.name, value };
      })
      .filter(Boolean);

    const variantImageUrl = variant.featured_image?.src
      ? normalizeUrl(variant.featured_image.src)
      : null;
    const variantAsset = variantImageUrl
      ? assetByUrl.get(variantImageUrl)
      : undefined;

    return {
      _key: randomUUID(),
      sku: variant.sku ?? undefined,
      price: priceFromCents(variant.price),
      compareAtPrice: variant.compare_at_price
        ? priceFromCents(variant.compare_at_price)
        : undefined,
      stock: DEFAULT_STOCK,
      optionValues,
      image: variantAsset
        ? { _type: "image", asset: { _type: "reference", _ref: variantAsset._id } }
        : undefined,
    };
  });

  const metafields = [
    {
      key: "shopifyProductId",
      type: "string",
      valueString: String(product.id),
    },
    {
      key: "shopifyHandle",
      type: "string",
      valueString: product.handle,
    },
    {
      key: "shopifyUrl",
      type: "string",
      valueString: `${STORE_URL}${product.url}`,
    },
    {
      key: "shopifyVendor",
      type: "string",
      valueString: product.vendor,
    },
    {
      key: "shopifyType",
      type: "string",
      valueString: product.type,
    },
  ];

  const productDoc = {
    _id: productId,
    _type: "product",
    name: product.title,
    slug: { _type: "slug", current: product.handle },
    description: descriptionText,
    price: basePrice,
    brand: product.vendor,
    productType: "equipment",
    category: { _type: "reference", _ref: categoryId },
    images: imageDocuments.filter(Boolean),
    stock: DEFAULT_STOCK,
    featured: true,
    isDigital: false,
    options,
    variants,
    metafields,
  };

  await writeClient.createOrReplace(productDoc);

  console.log(
    `Imported "${product.title}" with ${variants.length} variants into "${dataset}".`
  );
}

run().catch((error) => {
  console.error("Failed to import Shopify product:", error);
  process.exit(1);
});
