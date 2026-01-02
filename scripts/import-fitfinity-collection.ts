import "dotenv/config";
import { randomUUID } from "node:crypto";
import { writeClient } from "../sanity/lib/client";
import { dataset } from "../sanity/env";

type ShopifyCollection = {
  id: number;
  title: string;
  handle: string;
  image?: { src?: string | null } | null;
};

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
  featured_image?: { src?: string | null } | null;
};

type ShopifyProduct = {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string[];
  variants: ShopifyVariant[];
  images: { src: string }[];
  options: ShopifyOption[];
};

const SHOULD_WRITE = process.argv.includes("--confirm");
const PASSWORD = (() => {
  const index = process.argv.indexOf("--password");
  if (index === -1) return "1";
  return process.argv[index + 1] ?? "1";
})();
const DEFAULT_STOCK = 12;

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

const mapProductType = (rawType?: string | null) => {
  const type = (rawType ?? "").toLowerCase();
  if (!type) return "equipment";
  if (type.includes("suppl") || type.includes("nutrition")) return "supplement";
  if (
    type.includes("pant") ||
    type.includes("top") ||
    type.includes("bra") ||
    type.includes("shoe")
  ) {
    return "activewear";
  }
  if (
    type.includes("bag") ||
    type.includes("towel") ||
    type.includes("bottle") ||
    type.includes("headphone") ||
    type.includes("ear") ||
    type.includes("rope") ||
    type.includes("grip") ||
    type.includes("glove")
  ) {
    return "accessory";
  }
  if (
    type.includes("dumb") ||
    type.includes("weight") ||
    type.includes("treadmill") ||
    type.includes("equipment") ||
    type.includes("roller") ||
    type.includes("ball") ||
    type.includes("cycling")
  ) {
    return "equipment";
  }
  return "equipment";
};

const fetchJson = async <T>(url: string, cookie: string): Promise<T> => {
  const res = await fetch(url, { headers: { Cookie: cookie } });
  if (!res.ok) {
    throw new Error(`Failed ${url}: ${res.status}`);
  }
  return res.json();
};

const login = async () => {
  const body = new URLSearchParams({
    form_type: "storefront_password",
    utf8: "✓",
    password: PASSWORD,
  });
  const res = await fetch("https://dt-fitfinity.myshopify.com/password", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    redirect: "manual",
  });
  const cookie = res.headers.get("set-cookie") ?? "";
  if (!cookie) {
    throw new Error("Failed to obtain Shopify password cookie.");
  }
  return cookie;
};

async function uploadImage(url: string, cache: Map<string, string>) {
  const cached = cache.get(url);
  if (cached) return cached;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image ${url}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") ?? undefined;
  const filename = url.split("?")[0]?.split("/").pop() ?? "image.jpg";

  const asset = await writeClient.assets.upload("image", buffer, {
    filename,
    contentType,
  });

  cache.set(url, asset._id);
  return asset._id;
}

async function run() {
  if (!SHOULD_WRITE) {
    console.log("Dry run only. Re-run with --confirm to import products.");
    return;
  }

  if (dataset !== "production") {
    console.error(
      `Refusing to import into "${dataset}". Set NEXT_PUBLIC_SANITY_DATASET=production to continue.`
    );
    process.exit(1);
  }

  const cookie = await login();

  const collectionsData = await fetchJson<{ collections: ShopifyCollection[] }>(
    "https://dt-fitfinity.myshopify.com/collections.json?limit=250",
    cookie
  );

  const collections = collectionsData.collections ?? [];
  const collectionOrder = collections.map((collection) => collection.handle);
  const collectionProductMap = new Map<string, string>();
  const collectionOptionNames = new Map<string, Set<string>>();
  const collectionImageMap = new Map<string, string>();

  for (const collection of collections) {
    let page = 1;
    while (true) {
      const data = await fetchJson<{ products: ShopifyProduct[] }>(
        `https://dt-fitfinity.myshopify.com/collections/${collection.handle}/products.json?limit=250&page=${page}`,
        cookie
      );
      if (!data.products || data.products.length === 0) break;

      for (const product of data.products) {
        if (!collectionProductMap.has(product.handle)) {
          collectionProductMap.set(product.handle, collection.handle);
        }
        const optionSet =
          collectionOptionNames.get(collection.handle) ?? new Set<string>();
        product.options?.forEach((option) => {
          if (option?.name) optionSet.add(option.name);
        });
        collectionOptionNames.set(collection.handle, optionSet);

        if (!collectionImageMap.has(collection.handle)) {
          const imageUrl = product.images?.[0]?.src;
          if (imageUrl) {
            collectionImageMap.set(collection.handle, normalizeUrl(imageUrl));
          }
        }
      }

      if (data.products.length < 250) break;
      page += 1;
    }
  }

  const allProducts: ShopifyProduct[] = [];
  let page = 1;
  while (true) {
    const data = await fetchJson<{ products: ShopifyProduct[] }>(
      `https://dt-fitfinity.myshopify.com/collections/all/products.json?limit=250&page=${page}`,
      cookie
    );
    if (!data.products || data.products.length === 0) break;
    allProducts.push(...data.products);
    if (data.products.length < 250) break;
    page += 1;
  }

  const imageCache = new Map<string, string>();
  const featuredHandles = new Set(
    allProducts.slice(0, 8).map((product) => product.handle)
  );

  for (const collection of collections) {
    const optionFilters = Array.from(
      collectionOptionNames.get(collection.handle) ?? new Set<string>()
    );
    const imageUrl =
      normalizeUrl(collection.image?.src ?? "") ||
      collectionImageMap.get(collection.handle);

    let image = undefined;
    if (imageUrl) {
      const assetId = await uploadImage(imageUrl, imageCache);
      image = {
        _type: "image",
        asset: { _type: "reference", _ref: assetId },
      };
    }

    await writeClient.createIfNotExists({
      _id: `category-${collection.handle}`,
      _type: "category",
      title: collection.title,
      slug: { _type: "slug", current: collection.handle },
      order: collectionOrder.indexOf(collection.handle) + 1,
      featuredInMenu: true,
      image,
      filterConfig: {
        showBrand: true,
        showGoals: false,
        showSports: false,
        showGender: false,
        optionFilters,
      },
    });
  }

  for (const product of allProducts) {
    const categoryHandle =
      collectionProductMap.get(product.handle) || collectionOrder[0];
    const categoryId = categoryHandle
      ? `category-${categoryHandle}`
      : undefined;

    const normalizedImages = (product.images ?? [])
      .map((image) => normalizeUrl(image.src))
      .filter(Boolean);
    const assetIds: string[] = [];
    for (const url of normalizedImages) {
      const assetId = await uploadImage(url, imageCache);
      assetIds.push(assetId);
    }

    const imageDocuments = assetIds.map((assetId) => ({
      _key: randomUUID(),
      _type: "image",
      asset: { _type: "reference", _ref: assetId },
    }));

    const options = (product.options ?? []).map((option) => ({
      name: option.name,
      values: option.values,
    }));

    const variants = (product.variants ?? []).map((variant) => {
      const optionValues = (product.options ?? [])
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
      const variantAssetId = variantImageUrl
        ? imageCache.get(variantImageUrl)
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
        image: variantAssetId
          ? {
              _type: "image",
              asset: { _type: "reference", _ref: variantAssetId },
            }
          : undefined,
      };
    });

    const descriptionText = htmlToText(product.body_html ?? "");
    const basePrice = priceFromCents(product.variants?.[0]?.price ?? 0);
    const shopifyUrl = `https://dt-fitfinity.myshopify.com/products/${product.handle}`;

    await writeClient.createOrReplace({
      _id: `product-${product.handle}`,
      _type: "product",
      name: product.title,
      slug: { _type: "slug", current: product.handle },
      description: descriptionText,
      descriptionHtml: product.body_html ?? "",
      price: basePrice,
      brand: product.vendor,
      productType: mapProductType(product.product_type),
      category: categoryId
        ? { _type: "reference", _ref: categoryId }
        : undefined,
      images: imageDocuments,
      stock: DEFAULT_STOCK,
      featured: featuredHandles.has(product.handle),
      isDigital: false,
      options,
      variants,
      metafields: [
        { key: "shopifyProductId", type: "string", valueString: String(product.id) },
        { key: "shopifyHandle", type: "string", valueString: product.handle },
        { key: "shopifyUrl", type: "string", valueString: shopifyUrl },
        { key: "shopifyVendor", type: "string", valueString: product.vendor },
        { key: "shopifyType", type: "string", valueString: product.product_type },
        { key: "shopifyCollection", type: "string", valueString: categoryHandle },
      ],
    });
  }

  console.log(
    `Imported ${allProducts.length} products into "${dataset}" with ${collections.length} categories.`
  );
}

run().catch((error) => {
  console.error("Failed to import Fitfinity collection:", error);
  process.exit(1);
});
