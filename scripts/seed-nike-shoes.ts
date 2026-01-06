import "dotenv/config";
import { randomUUID } from "node:crypto";
import { writeClient } from "../sanity/lib/client";
import { dataset } from "../sanity/env";

type NikeListingProduct = {
  productCode?: string;
  productType?: string;
  globalProductId?: string;
  copy?: {
    title?: string;
    subTitle?: string;
  };
  prices?: {
    currency?: string;
    currentPrice?: number;
    initialPrice?: number;
  };
  colorwayImages?: {
    portraitURL?: string;
    squarishURL?: string;
  };
  pdpUrl?: {
    url?: string;
    path?: string;
  };
};

type CategorySeed = {
  title: string;
  slug: string;
  order?: number;
  parentSlug?: string;
};

type ListingSeed = {
  title: string;
  slug: string;
  url: string;
  maxProducts: number;
  sportTag?: "fitness";
};

const SHOULD_WRITE = process.argv.includes("--confirm");
const USD_TO_BDT = 120;
const DEFAULT_STOCK = 20;
const FETCH_HEADERS = { "User-Agent": "Mozilla/5.0" };

const PARENT_CATEGORY: CategorySeed = {
  title: "Shoes",
  slug: "shoes",
  order: 4,
};

const SUBCATEGORIES: ListingSeed[] = [
  {
    title: "Basketball Shoes",
    slug: "basketball-shoes",
    url: "https://www.nike.com/w/basketball-shoes-3glsmz7ok",
    maxProducts: 8,
    sportTag: "fitness",
  },
  {
    title: "Lifestyle Shoes",
    slug: "lifestyle-shoes",
    url: "https://www.nike.com/w/lifestyle-shoes-13jrmz7ok",
    maxProducts: 8,
    sportTag: "fitness",
  },
  {
    title: "Soccer Boots",
    slug: "soccer-shoes",
    url: "https://www.nike.com/w/soccer-shoes-cleats-1gdj0z7ok",
    maxProducts: 8,
    sportTag: "fitness",
  },
  {
    title: "Trail Running Shoes",
    slug: "trail-running-shoes",
    url: "https://www.nike.com/w/trail-running-shoes-9yt34z7ok",
    maxProducts: 8,
    sportTag: "fitness",
  },
];

const normalizeUrl = (url: string) =>
  url.startsWith("//") ? `https:${url}` : url;

const formatDescription = (title?: string, subtitle?: string) => {
  const parts = [subtitle, "Nike performance footwear built for everyday training."].filter(Boolean);
  return `${title ?? "Nike Shoe"} — ${parts.join(" ")}`;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const toNumber = (value?: number | null) =>
  typeof value === "number" && !Number.isNaN(value) ? value : null;

const convertPrice = (usd: number | null) =>
  usd === null ? null : Math.round(usd * USD_TO_BDT);

const imageCache = new Map<string, string>();
const writeClientWithTimeout = writeClient.withConfig({ timeout: 600000 });

async function uploadImage(url: string) {
  const normalized = normalizeUrl(url);
  const cached = imageCache.get(normalized);
  if (cached) return cached;

  const response = await fetch(normalized, { headers: FETCH_HEADERS });
  if (!response.ok) {
    throw new Error(`Failed to fetch image ${normalized}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") ?? undefined;
  const filename = normalized.split("?")[0]?.split("/").pop() ?? "image.jpg";

  const asset = await writeClientWithTimeout.assets.upload("image", buffer, {
    filename,
    contentType,
  });

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

async function ensureCategory(seed: CategorySeed, parentId?: string | null) {
  const existing = await writeClient.fetch<{ _id: string } | null>(
    `*[_type == "category" && slug.current == $slug][0]{_id}`,
    { slug: seed.slug }
  );
  const id = existing?._id ?? `category-${seed.slug}`;

  await writeClientWithTimeout.createIfNotExists({
    _id: id,
    _type: "category",
    title: seed.title,
    slug: { _type: "slug", current: seed.slug },
  });

  let patch = writeClientWithTimeout.patch(id).set({
    title: seed.title,
    slug: { _type: "slug", current: seed.slug },
    order: seed.order ?? 0,
    featuredInMenu: true,
    filterConfig: {
      showBrand: true,
      showGoals: false,
      showSports: true,
      showGender: true,
      optionFilters: ["Color", "Size"],
    },
  });

  if (parentId) {
    patch = patch.set({ parent: { _type: "reference", _ref: parentId } });
  } else {
    patch = patch.unset(["parent"]);
  }

  await patch.commit();
  return id;
}

async function fetchListingProducts(url: string) {
  const res = await fetch(url, { headers: FETCH_HEADERS });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  const html = await res.text();
  const marker = '<script id="__NEXT_DATA__" type="application/json">';
  const start = html.indexOf(marker);
  if (start === -1) {
    throw new Error(`Unable to find listing data for ${url}`);
  }
  const jsonStart = html.indexOf(">", start) + 1;
  const jsonEnd = html.indexOf("</script>", jsonStart);
  const json = JSON.parse(html.slice(jsonStart, jsonEnd));
  const groups =
    json.props?.pageProps?.initialState?.Wall?.productGroupings ?? [];
  const products: NikeListingProduct[] = [];
  for (const group of groups) {
    if (!group?.products) continue;
    for (const product of group.products) {
      products.push(product);
    }
  }
  return products;
}

function inferGender(subtitle?: string | null) {
  const value = (subtitle ?? "").toLowerCase();
  if (value.includes("women")) return "women";
  if (value.includes("men")) return "men";
  return "unisex";
}

async function run() {
  if (!SHOULD_WRITE) {
    console.log("Dry run only. Re-run with --confirm to seed Nike shoes.");
    return;
  }

  if (dataset !== "production") {
    console.error(
      `Refusing to seed into "${dataset}". Set NEXT_PUBLIC_SANITY_DATASET=production to continue.`
    );
    process.exit(1);
  }

  const existingNike = await writeClient.fetch<{ _id: string }[]>(
    `*[_type == "product" && _id match "product-nike-*"]{_id}`
  );
  const existingIds = new Set(existingNike.map((item) => item._id));

  const parentId = await ensureCategory(PARENT_CATEGORY);

  for (const subcategory of SUBCATEGORIES) {
    const categoryId = await ensureCategory(
      {
        title: subcategory.title,
        slug: subcategory.slug,
        parentSlug: PARENT_CATEGORY.slug,
      },
      parentId
    );

    const products = await fetchListingProducts(subcategory.url);
    const selected: NikeListingProduct[] = [];
    const seenCodes = new Set<string>();

    for (const product of products) {
      if (selected.length >= subcategory.maxProducts) break;
      const code = product.productCode ?? product.globalProductId ?? "";
      if (!code || seenCodes.has(code)) continue;
      seenCodes.add(code);
      selected.push(product);
    }

    if (selected.length === 0) {
      console.log(`No products found for ${subcategory.title}.`);
      continue;
    }

    console.log(`Seeding ${selected.length} products for ${subcategory.title}...`);

    for (const product of selected) {
      const code = product.productCode ?? product.globalProductId ?? randomUUID();
      const id = `product-nike-${slugify(code)}`;
      if (existingIds.has(id)) {
        console.log(`Skipping existing product: ${id}`);
        continue;
      }

      const title = product.copy?.title ?? "Nike Shoe";
      const subtitle = product.copy?.subTitle ?? "Nike footwear";
      const price = convertPrice(toNumber(product.prices?.currentPrice)) ?? 0;
      const imageUrls = [
        product.colorwayImages?.squarishURL,
        product.colorwayImages?.portraitURL,
      ].filter(Boolean) as string[];
      if (imageUrls.length === 0) {
        console.log(`Skipping ${title} (missing image)`);
        continue;
      }

      const imageAssetIds = [];
      for (const url of imageUrls.slice(0, 2)) {
        imageAssetIds.push(await uploadImage(url));
      }

      const doc = {
        _id: id,
        _type: "product",
        name: title,
        slug: { _type: "slug", current: slugify(`nike-${code}`) },
        description: formatDescription(title, subtitle),
        brand: "Nike",
        productType: "activewear",
        sports: subcategory.sportTag ? [subcategory.sportTag] : [],
        gender: inferGender(subtitle),
        price,
        category: { _type: "reference", _ref: categoryId },
        images: imageAssetIds.map((assetId) => ({
          _key: randomUUID(),
          ...buildImage(assetId),
        })),
        stock: DEFAULT_STOCK,
        featured: false,
        isDigital: false,
        options: [],
        variants: [],
        metafields: [
          {
            _key: randomUUID(),
            key: "source",
            type: "string",
            valueString: "nike",
          },
          {
            _key: randomUUID(),
            key: "sourceUrl",
            type: "string",
            valueString: product.pdpUrl?.url ?? product.pdpUrl?.path ?? subcategory.url,
          },
          {
            _key: randomUUID(),
            key: "sourceCategory",
            type: "string",
            valueString: subcategory.slug,
          },
        ],
      };

      await writeClientWithTimeout.createOrReplace(doc);
      existingIds.add(id);
    }
  }

  console.log("Nike shoes seed complete.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
