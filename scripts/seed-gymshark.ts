import "dotenv/config";
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
  price: string;
  compare_at_price: string | null;
  option1?: string | null;
  option2?: string | null;
  option3?: string | null;
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

type CategorySeed = {
  title: string;
  slug: string;
  parentSlug?: string | null;
  order?: number;
  featuredInMenu?: boolean;
  filterConfig?: {
    showBrand?: boolean;
    showGoals?: boolean;
    showSports?: boolean;
    showGender?: boolean;
    optionFilters?: string[];
  };
};

type SubcategorySource = {
  title: string;
  slug: string;
  parentSlug: string;
  productType: "activewear" | "equipment" | "accessory";
  gender?: "men" | "women" | "unisex";
  collections: string[];
  includeKeywords?: string[];
  excludeKeywords?: string[];
  maxProducts?: number;
  useGlobalSearch?: boolean;
  keywordMatches?: string[];
};

const SHOULD_WRITE = process.argv.includes("--confirm");
const ONLY_SHOES = process.argv.includes("--only-shoes");
const STORE_URL = "https://gymshark.com";
const USD_TO_BDT = 120;
const DEFAULT_STOCK = 20;
const MAX_PRODUCTS = 8;
const MAX_GLOBAL_PAGES = 6;
const FETCH_HEADERS = { "User-Agent": "Mozilla/5.0" };

if (!SHOULD_WRITE) {
  console.log("Dry run only. Re-run with --confirm to seed Gymshark.");
  process.exit(0);
}

if (dataset !== "production") {
  console.error(
    `Refusing to seed into "${dataset}". Set NEXT_PUBLIC_SANITY_DATASET=production to continue.`
  );
  process.exit(1);
}

const normalizeUrl = (url: string) =>
  url.startsWith("//") ? `https:${url}` : url;

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

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const toNumber = (value?: string | null) => {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) return null;
  return parsed;
};

const convertPrice = (usd: number | null) =>
  usd === null ? null : Math.round(usd * USD_TO_BDT);

const imageCache = new Map<string, string>();
const writeClientWithTimeout = writeClient.withConfig({ timeout: 600000 });

async function uploadImage(url: string) {
  const normalized = normalizeUrl(url);
  const cached = imageCache.get(normalized);
  if (cached) return cached;

  const asset = await withRetry(
    `upload image ${normalized}`,
    async () => {
      const response = await fetch(normalized);
      if (!response.ok) {
        throw new Error(`Failed to fetch image ${normalized}: ${response.status}`);
      }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") ?? undefined;
    const filename = normalized.split("?")[0]?.split("/").pop() ?? "image.jpg";

      return writeClientWithTimeout.assets.upload("image", buffer, {
        filename,
        contentType,
      });
    },
    2
  );

  imageCache.set(normalized, asset._id);
  return asset._id;
}

const buildImage = (assetId: string) => ({
  _type: "image",
  asset: {
    _type: "reference",
    _ref: assetId,
  },
});

const CATEGORY_SEEDS: CategorySeed[] = [
  {
    title: "Clothing",
    slug: "clothing",
    order: 1,
    featuredInMenu: true,
    filterConfig: {
      showBrand: true,
      showGoals: false,
      showSports: false,
      showGender: true,
      optionFilters: ["Color", "Size"],
    },
  },
  {
    title: "Accessories",
    slug: "accessories",
    order: 2,
    featuredInMenu: true,
    filterConfig: {
      showBrand: true,
      showGoals: false,
      showSports: false,
      showGender: false,
      optionFilters: ["Color", "Size"],
    },
  },
  {
    title: "Equipment",
    slug: "equipment",
    order: 3,
    featuredInMenu: true,
    filterConfig: {
      showBrand: true,
      showGoals: false,
      showSports: false,
      showGender: false,
      optionFilters: ["Color", "Size", "Weight", "Length"],
    },
  },
  {
    title: "Shoes",
    slug: "shoes",
    order: 4,
    featuredInMenu: true,
    filterConfig: {
      showBrand: true,
      showGoals: false,
      showSports: false,
      showGender: true,
      optionFilters: ["Color", "Size"],
    },
  },
];

const SUBCATEGORY_SOURCES: SubcategorySource[] = [
  {
    title: "T-Shirts",
    slug: "t-shirts",
    parentSlug: "clothing",
    productType: "activewear",
    gender: "unisex",
    collections: ["bodybuilding-t-shirts", "heavyweight-t-shirts", "apex-t-shirt"],
  },
  {
    title: "Tank Tops",
    slug: "tank-tops",
    parentSlug: "clothing",
    productType: "activewear",
    gender: "unisex",
    collections: ["stringers", "tanks-sale"],
  },
  {
    title: "Track Pants",
    slug: "track-pants",
    parentSlug: "clothing",
    productType: "activewear",
    gender: "unisex",
    collections: ["joggers"],
  },
  {
    title: "Shorts",
    slug: "shorts",
    parentSlug: "clothing",
    productType: "activewear",
    gender: "unisex",
    collections: ["black-shorts", "basketball-shorts"],
  },
  {
    title: "Leggings",
    slug: "leggings",
    parentSlug: "clothing",
    productType: "activewear",
    gender: "women",
    collections: ["bottoms-leggings", "black-leggings"],
  },
  {
    title: "Sports Bras",
    slug: "sports-bras",
    parentSlug: "clothing",
    productType: "activewear",
    gender: "women",
    collections: ["support-sports-bras", "black-sports-bras"],
  },
  {
    title: "Hoodies & Jackets",
    slug: "hoodies-jackets",
    parentSlug: "clothing",
    productType: "activewear",
    gender: "unisex",
    collections: ["heavyweight-hoodies", "graphic-hoodies", "bbl-jackets"],
  },
  {
    title: "Bags",
    slug: "bags",
    parentSlug: "accessories",
    productType: "accessory",
    gender: "unisex",
    collections: ["gym-bags", "duffel-bags"],
  },
  {
    title: "Bottles",
    slug: "bottles",
    parentSlug: "accessories",
    productType: "accessory",
    gender: "unisex",
    collections: ["bottles"],
    includeKeywords: ["bottle", "shaker", "flask", "cup"],
  },
  {
    title: "Socks",
    slug: "socks",
    parentSlug: "accessories",
    productType: "accessory",
    gender: "unisex",
    collections: ["socks"],
  },
  {
    title: "Jump Ropes",
    slug: "jump-ropes",
    parentSlug: "accessories",
    productType: "accessory",
    gender: "unisex",
    collections: ["equipment"],
    includeKeywords: ["jump rope"],
  },
  {
    title: "Dumbbells",
    slug: "dumbbells",
    parentSlug: "equipment",
    productType: "equipment",
    gender: "unisex",
    collections: ["equipment"],
    includeKeywords: ["dumbbell"],
  },
  {
    title: "Weight Bench",
    slug: "weight-bench",
    parentSlug: "equipment",
    productType: "equipment",
    gender: "unisex",
    collections: ["equipment"],
    includeKeywords: ["bench"],
  },
  {
    title: "Treadmills",
    slug: "treadmills",
    parentSlug: "equipment",
    productType: "equipment",
    gender: "unisex",
    collections: ["equipment"],
    includeKeywords: ["treadmill"],
  },
  {
    title: "Exercise Machines",
    slug: "exercise-machines",
    parentSlug: "equipment",
    productType: "equipment",
    gender: "unisex",
    collections: ["equipment"],
    includeKeywords: ["machine"],
  },
  {
    title: "Resistance Bands",
    slug: "resistance-bands",
    parentSlug: "equipment",
    productType: "equipment",
    gender: "unisex",
    collections: ["equipment"],
    includeKeywords: ["band"],
    excludeKeywords: ["waist band"],
  },
  {
    title: "Lifting Belts",
    slug: "lifting-belts",
    parentSlug: "equipment",
    productType: "equipment",
    gender: "unisex",
    collections: ["equipment"],
    includeKeywords: ["belt"],
  },
  {
    title: "Lifting Straps",
    slug: "lifting-straps",
    parentSlug: "equipment",
    productType: "equipment",
    gender: "unisex",
    collections: ["equipment"],
    includeKeywords: ["strap"],
  },
  {
    title: "Gym Gloves",
    slug: "gym-gloves",
    parentSlug: "equipment",
    productType: "equipment",
    gender: "unisex",
    collections: ["equipment"],
    includeKeywords: ["glove"],
  },
  {
    title: "Training Mats",
    slug: "training-mats",
    parentSlug: "equipment",
    productType: "equipment",
    gender: "unisex",
    collections: ["equipment"],
    includeKeywords: ["mat"],
  },
  {
    title: "Foam Rollers",
    slug: "foam-rollers",
    parentSlug: "equipment",
    productType: "equipment",
    gender: "unisex",
    collections: ["equipment"],
    includeKeywords: ["roller"],
  },
  {
    title: "Training Shoes",
    slug: "training-shoes",
    parentSlug: "shoes",
    productType: "activewear",
    gender: "unisex",
    collections: ["footwear"],
    useGlobalSearch: true,
    keywordMatches: ["training", "trainer"],
    maxProducts: 8,
  },
  {
    title: "Running Shoes",
    slug: "running-shoes",
    parentSlug: "shoes",
    productType: "activewear",
    gender: "unisex",
    collections: ["footwear"],
    useGlobalSearch: true,
    keywordMatches: ["running", "runner"],
    maxProducts: 8,
  },
];

const collectionCache = new Map<string, ShopifyProduct[]>();

async function fetchCollectionProducts(handle: string, max: number) {
  const cached = collectionCache.get(handle);
  if (cached && cached.length >= max) return cached;

  const products: ShopifyProduct[] = [];
  let page = 1;
  while (products.length < max) {
    const url = `${STORE_URL}/collections/${handle}/products.json?limit=250&page=${page}`;
    const res = await fetch(url, { headers: FETCH_HEADERS });
    if (!res.ok) {
      break;
    }
    const data = (await res.json()) as { products: ShopifyProduct[] };
    if (!data.products?.length) break;
    products.push(...data.products);
    if (data.products.length < 250) break;
    page += 1;
    await sleep(200);
  }

  collectionCache.set(handle, products);
  return products;
}

async function fetchProductsByKeywords(
  keywords: string[],
  max: number,
  usedHandles: Set<string>,
  existingHandles: Set<string>
) {
  const normalized = keywords.map((keyword) => keyword.toLowerCase());
  const products: ShopifyProduct[] = [];

  if (normalized.length === 0) return products;

  for (let page = 1; page <= MAX_GLOBAL_PAGES; page += 1) {
    if (products.length >= max) break;
    const url = `${STORE_URL}/products.json?limit=250&page=${page}`;
    const res = await fetch(url, { headers: FETCH_HEADERS });
    if (!res.ok) break;
    const data = (await res.json()) as { products: ShopifyProduct[] };
    if (!data.products?.length) break;

    for (const product of data.products) {
      if (products.length >= max) break;
      if (usedHandles.has(product.handle) || existingHandles.has(product.handle)) {
        continue;
      }
      const haystack = `${product.title} ${product.product_type ?? ""} ${product.tags?.join(" ") ?? ""}`.toLowerCase();
      if (!normalized.some((keyword) => haystack.includes(keyword))) {
        continue;
      }
      products.push(product);
      usedHandles.add(product.handle);
    }

    await sleep(200);
  }

  return products;
}

const matchesKeywords = (
  title: string,
  includeKeywords?: string[],
  excludeKeywords?: string[]
) => {
  const normalized = title.toLowerCase();
  if (excludeKeywords?.some((kw) => normalized.includes(kw))) return false;
  if (!includeKeywords || includeKeywords.length === 0) return true;
  return includeKeywords.some((kw) => normalized.includes(kw));
};

async function ensureCategory(
  seed: CategorySeed,
  parentId?: string | null,
  imageAssetId?: string
) {
  const existing = await withRetry(
    `fetch category ${seed.slug}`,
    () =>
      writeClient.fetch<{ _id: string } | null>(
        `*[_type == "category" && slug.current == $slug][0]{_id}`,
        { slug: seed.slug }
      ),
    2
  );
  const id = existing?._id ?? `category-${seed.slug}`;

  await withRetry(`create category ${seed.slug}`, () =>
    writeClientWithTimeout.createIfNotExists({
      _id: id,
      _type: "category",
      title: seed.title,
      slug: { _type: "slug", current: seed.slug },
    })
  );

  let patch = writeClientWithTimeout.patch(id).set({
    title: seed.title,
    slug: { _type: "slug", current: seed.slug },
    order: seed.order ?? 0,
    featuredInMenu: seed.featuredInMenu ?? true,
    filterConfig: seed.filterConfig,
  });

  if (parentId) {
    patch = patch.set({
      parent: { _type: "reference", _ref: parentId },
    });
  } else {
    patch = patch.unset(["parent"]);
  }

  if (imageAssetId) {
    patch = patch.set({ image: buildImage(imageAssetId) });
  }

  await withRetry(`update category ${seed.slug}`, () => patch.commit());
  return id;
}

async function createOrReplaceProduct(
  product: ShopifyProduct,
  categoryId: string,
  productType: SubcategorySource["productType"],
  gender: SubcategorySource["gender"] | undefined,
  imageAssetIds: string[]
) {
  const description = htmlToText(product.body_html) || product.title;
  const optionDefs = (product.options || []).filter(
    (option) =>
      option?.name &&
      option.name.toLowerCase() !== "title" &&
      option.values?.some((value) => value && value !== "Default Title")
  );

  const variantPrices = product.variants
    .map((variant) => convertPrice(toNumber(variant.price)))
    .filter((price): price is number => typeof price === "number");

  const basePrice =
    variantPrices.length > 0 ? Math.min(...variantPrices) : null;

  const options = optionDefs.map((option) => ({
    _key: randomUUID(),
    _type: "object",
    name: option.name,
    values: option.values.filter(Boolean),
  }));

  const variants =
    optionDefs.length === 0
      ? []
      : product.variants.map((variant) => {
          const optionValues = optionDefs
            .map((option, index) => {
              const value = variant[`option${index + 1}` as "option1"];
              if (!value) return null;
              return {
                _key: randomUUID(),
                _type: "object",
                name: option.name,
                value,
              };
            })
            .filter(Boolean) as { _key: string; _type: "object"; name: string; value: string }[];

          return {
            _key: randomUUID(),
            _type: "object",
            sku: variant.sku ?? null,
            price: convertPrice(toNumber(variant.price)),
            compareAtPrice: convertPrice(toNumber(variant.compare_at_price)),
            stock: DEFAULT_STOCK,
            optionValues,
          };
        });

  const productDoc = {
    _id: `product-gymshark-${product.handle}`,
    _type: "product",
    name: product.title,
    slug: { _type: "slug", current: product.handle },
    description,
    descriptionHtml: product.body_html,
    brand: "Gym Shark",
    productType,
    gender: gender ?? "unisex",
    price: basePrice ?? convertPrice(toNumber(product.variants[0]?.price)) ?? 0,
    category: { _type: "reference", _ref: categoryId },
    images: imageAssetIds.map((assetId) => ({
      _key: randomUUID(),
      ...buildImage(assetId),
    })),
    stock: DEFAULT_STOCK,
    featured: false,
    isDigital: false,
    options,
    variants,
    metafields: [
      {
        _key: randomUUID(),
        key: "source",
        type: "string",
        valueString: "gymshark",
      },
      {
        _key: randomUUID(),
        key: "sourceHandle",
        type: "string",
        valueString: product.handle,
      },
    ],
  };

  await withRetry(`create product ${product.handle}`, () =>
    writeClientWithTimeout.createOrReplace(productDoc)
  );
}

async function cleanupEmptyCategories() {
  const categories = await withRetry("fetch categories", () =>
    writeClient.fetch<
      {
        _id: string;
        slug: { current: string } | null;
        parent?: { _id: string } | null;
      }[]
    >(`*[_type == "category"]{_id, slug, parent->{_id}}`)
  );

  const products = await withRetry("fetch products", () =>
    writeClient.fetch<{ category?: { _id: string } | null }[]>(
      `*[_type == "product"]{category->{_id}}`
    )
  );

  const productCount = new Map<string, number>();
  for (const product of products) {
    const categoryId = product.category?._id;
    if (!categoryId) continue;
    productCount.set(categoryId, (productCount.get(categoryId) ?? 0) + 1);
  }

  const childrenMap = new Map<string, string[]>();
  for (const category of categories) {
    const parentId = category.parent?._id;
    if (!parentId) continue;
    const children = childrenMap.get(parentId) ?? [];
    children.push(category._id);
    childrenMap.set(parentId, children);
  }

  const hasProductsMap = new Map<string, boolean>();
  const hasProductsOrDescendant = (id: string): boolean => {
    if (hasProductsMap.has(id)) return hasProductsMap.get(id)!;
    const direct = (productCount.get(id) ?? 0) > 0;
    const children = childrenMap.get(id) ?? [];
    const childHas = children.some((childId) => hasProductsOrDescendant(childId));
    const value = direct || childHas;
    hasProductsMap.set(id, value);
    return value;
  };

  categories.forEach((category) => hasProductsOrDescendant(category._id));

  const deletions = categories.filter(
    (category) => !hasProductsMap.get(category._id)
  );

  if (deletions.length === 0) {
    console.log("No empty categories to delete.");
    return;
  }

  console.log(`Deleting ${deletions.length} empty categories...`);
  for (const category of deletions) {
    await withRetry(`delete category ${category._id}`, () =>
      writeClientWithTimeout.delete(category._id)
    );
  }
}

async function removeLegacyCategories() {
  const legacyMap = [
    { from: "womens-wear", to: "clothing" },
    { from: "gym-equipments", to: "equipment" },
  ];

  const categories = await withRetry("fetch legacy categories", () =>
    writeClient.fetch<
      { _id: string; slug: { current: string } | null }[]
    >(`*[_type == "category" && slug.current in $slugs]{_id, slug}`, {
      slugs: legacyMap.flatMap((entry) => [entry.from, entry.to]),
    })
  );

  const categoryBySlug = new Map(
    categories
      .map((category) => [category.slug?.current, category._id] as const)
      .filter((entry): entry is [string, string] => Boolean(entry[0]))
  );

  for (const entry of legacyMap) {
    const fromId = categoryBySlug.get(entry.from);
    const toId = categoryBySlug.get(entry.to);
    if (!fromId) continue;

    if (toId) {
      const products = await withRetry(
        `fetch products for ${entry.from}`,
        () =>
          writeClient.fetch<{ _id: string }[]>(
            `*[_type == "product" && category._ref == $fromId]{_id}`,
            { fromId }
          )
      );
      for (const product of products) {
        await withRetry(`reassign product ${product._id}`, () =>
          writeClientWithTimeout
            .patch(product._id)
            .set({ category: { _type: "reference", _ref: toId } })
            .commit()
        );
      }
    }

    await withRetry(`delete legacy category ${entry.from}`, () =>
      writeClientWithTimeout.delete(fromId)
    );
  }
}

async function withRetry<T>(
  label: string,
  fn: () => Promise<T>,
  attempts = 3
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`${label} failed (attempt ${attempt}/${attempts}).`);
      if (attempt < attempts) {
        await sleep(500 * attempt);
      }
    }
  }
  throw lastError;
}
async function run() {
  console.log("Fetching Gymshark collections...");
  const collectionsJson = await withRetry("fetch collections", async () => {
    const collectionsData = await fetch(
      `${STORE_URL}/collections.json?limit=250`,
      { headers: FETCH_HEADERS }
    );
    return collectionsData.json() as Promise<{ collections: { handle: string }[] }>;
  });
  const availableCollections = new Set(
    (collectionsJson.collections ?? []).map((collection) => collection.handle)
  );

  const categoryIdBySlug = new Map<string, string>();
  const existingHandles = new Set<string>();

  const existing = await withRetry("fetch existing gymshark handles", () =>
    writeClient.fetch<{ handle?: string | null }[]>(
      `*[_type == "product" && _id match "product-gymshark-*"]{"handle": slug.current}`
    )
  );
  existing.forEach((item) => {
    if (item.handle) existingHandles.add(item.handle);
  });

  await removeLegacyCategories();

  for (const category of CATEGORY_SEEDS) {
    const id = await ensureCategory(category);
    categoryIdBySlug.set(category.slug, id);
  }

  const usedHandles = new Set<string>();
  const categoryImageMap = new Map<string, string>();
  const sources = ONLY_SHOES
    ? SUBCATEGORY_SOURCES.filter((subcategory) => subcategory.parentSlug === "shoes")
    : SUBCATEGORY_SOURCES;

  if (ONLY_SHOES) {
    console.log("Seeding shoes only (using global search fallback).");
  }

  for (const subcategory of sources) {
    const parentId = categoryIdBySlug.get(subcategory.parentSlug);
    if (!parentId) continue;

    const validCollections = subcategory.collections.filter((handle) =>
      availableCollections.has(handle)
    );

    if (validCollections.length === 0) {
      console.log(
        `Skipping ${subcategory.title} - no matching Gymshark collection found.`
      );
      continue;
    }

    const categoryId = await ensureCategory(
      {
        title: subcategory.title,
        slug: subcategory.slug,
        parentSlug: subcategory.parentSlug,
        order: CATEGORY_SEEDS.findIndex(
          (category) => category.slug === subcategory.parentSlug
        ),
        featuredInMenu: true,
        filterConfig: CATEGORY_SEEDS.find(
          (category) => category.slug === subcategory.parentSlug
        )?.filterConfig,
      },
      parentId
    );

    categoryIdBySlug.set(subcategory.slug, categoryId);

    const maxProducts = subcategory.maxProducts ?? MAX_PRODUCTS;
    let products: ShopifyProduct[] = [];

    if (subcategory.useGlobalSearch && subcategory.keywordMatches) {
      products = await fetchProductsByKeywords(
        subcategory.keywordMatches,
        maxProducts,
        usedHandles,
        existingHandles
      );
    } else {
      products = [];
      for (const collectionHandle of validCollections) {
        if (products.length >= maxProducts) break;
        const collectionProducts = await fetchCollectionProducts(
          collectionHandle,
          200
        );

        for (const product of collectionProducts) {
          if (products.length >= maxProducts) break;
          if (
            usedHandles.has(product.handle) ||
            existingHandles.has(product.handle)
          ) {
            continue;
          }
          if (
            !matchesKeywords(
              product.title,
              subcategory.includeKeywords,
              subcategory.excludeKeywords
            )
          ) {
            continue;
          }
          products.push(product);
          usedHandles.add(product.handle);
        }
      }
    }

    if (products.length === 0) {
      console.log(`No products matched for ${subcategory.title}.`);
      continue;
    }

    console.log(
      `Seeding ${products.length} products for ${subcategory.title}...`
    );

    for (const product of products) {
      const productId = `product-gymshark-${product.handle}`;
      const existing = await writeClient.fetch<{ _id: string } | null>(
        `*[_id == $id][0]{_id}`,
        { id: productId }
      );
      if (existing?._id) {
        console.log(`Skipping existing product: ${product.title}`);
        continue;
      }

      try {
        const imageUrls = product.images
          .map((image) => normalizeUrl(image.src))
          .slice(0, 1);
        const imageAssetIds = [];
        for (const url of imageUrls) {
          imageAssetIds.push(await uploadImage(url));
        }

        if (!categoryImageMap.has(subcategory.slug) && imageAssetIds[0]) {
          categoryImageMap.set(subcategory.slug, imageAssetIds[0]);
        }

        await createOrReplaceProduct(
          product,
          categoryId,
          subcategory.productType,
          subcategory.gender,
          imageAssetIds
        );
        existingHandles.add(product.handle);
        await sleep(150);
      } catch (error) {
        console.warn(`Skipping product ${product.title}:`, error);
      }
    }
  }

  for (const [slug, imageId] of categoryImageMap.entries()) {
    const categoryId = categoryIdBySlug.get(slug);
    if (!categoryId) continue;
    await withRetry(`update category image ${slug}`, () =>
      writeClientWithTimeout
        .patch(categoryId)
        .set({ image: buildImage(imageId) })
        .commit()
    );
  }

  await cleanupEmptyCategories();

  console.log("Gymshark seed complete.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
