import { defineQuery } from "next-sanity";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants/stock";

// ============================================
// Shared Query Fragments (DRY)
// ============================================

const CATEGORY_FILTER_CONDITION = `(
  $categorySlug == ""
  || category->slug.current == $categorySlug
  || category->parent->slug.current == $categorySlug
)`;

const PRICE_FILTER_CONDITION = `(
  ($minPrice == 0 || (
    (count(variants) > 0 && count(variants[price >= $minPrice]) > 0)
    || (count(variants) == 0 && price >= $minPrice)
  ))
  && ($maxPrice == 0 || (
    (count(variants) > 0 && count(variants[price <= $maxPrice]) > 0)
    || (count(variants) == 0 && price <= $maxPrice)
  ))
)`;

const STOCK_FILTER_CONDITION = `(
  $inStock == false
  || (
    (count(variants) > 0 && count(variants[stock > 0]) > 0)
    || (count(variants) == 0 && stock > 0)
  )
)`;

const OPTION_FILTER_CONDITION = `(
  !defined($optionFilters)
  || count($optionFilters) == 0
  || count($optionFilters[
    name != null
    && count(values) > 0
    && (
      count(options[name == ^.name && count(values[@ in ^.values]) > 0]) > 0
      || count(variants[count(optionValues[name == ^.name && value in ^.values]) > 0]) > 0
    )
  ]) == count($optionFilters)
)`;

/** Common filter conditions for product filtering */
const PRODUCT_FILTER_CONDITIONS = `
  _type == "product"
  && ${CATEGORY_FILTER_CONDITION}
  && ($brand == "" || brand == $brand)
  && (count($goals) == 0 || count(goals[@ in $goals]) > 0)
  && (count($sports) == 0 || count(sports[@ in $sports]) > 0)
  && ($gender == "" || gender == $gender)
  && ${PRICE_FILTER_CONDITION}
  && ($searchQuery == "" || name match $searchQuery + "*" || description match $searchQuery + "*" || brand match $searchQuery + "*")
  && ${STOCK_FILTER_CONDITION}
  && ${OPTION_FILTER_CONDITION}
`;

const PRODUCT_OPTIONS_PROJECTION = `options[]{
  name,
  values
}`;

const PRODUCT_VARIANTS_PROJECTION = `variants[]{
  _key,
  sku,
  price,
  compareAtPrice,
  stock,
  optionValues[]{
    name,
    value
  },
  image{
    asset->{
      _id,
      url
    },
    hotspot
  }
}`;

/** Projection for filtered product lists (includes multiple images for hover) */
const FILTERED_PRODUCT_PROJECTION = `{
  _id,
  name,
  "slug": slug.current,
  description,
  price,
  brand,
  productType,
  goals,
  sports,
  gender,
  "images": images[0...4]{
    _key,
    asset->{
      _id,
      url
    }
  },
  category->{
    _id,
    title,
    "slug": slug.current,
    parent->{
      _id,
      title,
      "slug": slug.current
    }
  },
  stock,
  featured,
  isDigital,
  ${PRODUCT_OPTIONS_PROJECTION},
  ${PRODUCT_VARIANTS_PROJECTION}
}`;

// ============================================
// All Products Query
// ============================================

/**
 * Get all products with category expanded
 * Used on landing page
 */
export const ALL_PRODUCTS_QUERY = defineQuery(`*[
  _type == "product"
] | order(name asc) {
  _id,
  name,
  "slug": slug.current,
  description,
  price,
  brand,
  productType,
  goals,
  sports,
  gender,
  "images": images[]{
    _key,
    asset->{
      _id,
      url
    },
    hotspot
  },
  category->{
    _id,
    title,
    "slug": slug.current,
    parent->{
      _id,
      title,
      "slug": slug.current
    }
  },
  stock,
  featured,
  isDigital,
  ${PRODUCT_OPTIONS_PROJECTION},
  ${PRODUCT_VARIANTS_PROJECTION},
  metafields[]{
    key,
    type,
    valueString,
    valueNumber,
    valueBoolean
  }
}`);

/**
 * Get featured products for homepage carousel
 */
export const FEATURED_PRODUCTS_QUERY = defineQuery(`*[
  _type == "product"
  && featured == true
] | order(_createdAt desc) [0...6] {
  _id,
  name,
  "slug": slug.current,
  description,
  price,
  brand,
  productType,
  goals,
  sports,
  gender,
  "images": images[]{
    _key,
    asset->{
      _id,
      url
    },
    hotspot
  },
  category->{
    _id,
    title,
    "slug": slug.current
  },
  stock,
  featured,
  isDigital,
  ${PRODUCT_OPTIONS_PROJECTION},
  ${PRODUCT_VARIANTS_PROJECTION}
}`);

/**
 * Get featured products for homepage grid (fallback to newest)
 */
export const HOME_FEATURED_PRODUCTS_QUERY = defineQuery(
  `*[_type == "product"] | order(featured desc, _createdAt desc) [0...8] ${FILTERED_PRODUCT_PROJECTION}`
);

/**
 * Get products by category slug
 */
export const PRODUCTS_BY_CATEGORY_QUERY = defineQuery(`*[
  _type == "product"
  && category->slug.current == $categorySlug
] | order(name asc) {
  _id,
  name,
  "slug": slug.current,
  price,
  brand,
  productType,
  goals,
  sports,
  gender,
  "image": images[0]{
    asset->{
      _id,
      url
    },
    hotspot
  },
  category->{
    _id,
    title,
    "slug": slug.current
  },
  stock,
  featured,
  isDigital,
  ${PRODUCT_OPTIONS_PROJECTION},
  ${PRODUCT_VARIANTS_PROJECTION}
}`);

/**
 * Get single product by slug
 * Used on product detail page
 */
export const PRODUCT_BY_SLUG_QUERY = defineQuery(`*[
  _type == "product"
  && slug.current == $slug
][0] {
  _id,
  name,
  "slug": slug.current,
  description,
  descriptionHtml,
  price,
  brand,
  productType,
  goals,
  sports,
  gender,
  "images": images[]{
    _key,
    asset->{
      _id,
      url
    },
    hotspot
  },
  category->{
    _id,
    title,
    "slug": slug.current,
    parent->{
      _id,
      title,
      "slug": slug.current
    }
  },
  stock,
  featured,
  isDigital,
  ${PRODUCT_OPTIONS_PROJECTION},
  ${PRODUCT_VARIANTS_PROJECTION},
  metafields[]{
    key,
    type,
    valueString,
    valueNumber,
    valueBoolean
  }
}`);

// ============================================
// Search & Filter Queries (Server-Side)
// ============================================

/**
 * Filter products - ordered by best selling (featured + newest fallback)
 */
export const FILTER_PRODUCTS_BY_BEST_SELLING_QUERY = defineQuery(
  `*[${PRODUCT_FILTER_CONDITIONS}] | order(featured desc, _createdAt desc) ${FILTERED_PRODUCT_PROJECTION}`
);

/**
 * Filter products - ordered by newest
 */
export const FILTER_PRODUCTS_BY_NEWEST_QUERY = defineQuery(
  `*[${PRODUCT_FILTER_CONDITIONS}] | order(_createdAt desc) ${FILTERED_PRODUCT_PROJECTION}`
);

/**
 * Filter products - ordered by price ascending
 */
export const FILTER_PRODUCTS_BY_PRICE_ASC_QUERY = defineQuery(
  `*[${PRODUCT_FILTER_CONDITIONS}] | order(price asc) ${FILTERED_PRODUCT_PROJECTION}`
);

/**
 * Filter products - ordered by price descending
 */
export const FILTER_PRODUCTS_BY_PRICE_DESC_QUERY = defineQuery(
  `*[${PRODUCT_FILTER_CONDITIONS}] | order(price desc) ${FILTERED_PRODUCT_PROJECTION}`
);

/**
 * Search products with relevance scoring
 */
export const SEARCH_PRODUCTS_QUERY = defineQuery(`*[
  _type == "product"
  && (
    name match $searchQuery + "*"
    || description match $searchQuery + "*"
    || brand match $searchQuery + "*"
  )
] | order(_createdAt desc) {
  _id,
  name,
  "slug": slug.current,
  price,
  brand,
  "image": images[0]{
    asset->{
      _id,
      url
    },
    hotspot
  },
  category->{
    _id,
    title,
    "slug": slug.current
  },
  stock
}`);

/**
 * Get products by IDs (for cart/checkout)
 */
export const PRODUCTS_BY_IDS_QUERY = defineQuery(`*[
  _type == "product"
  && _id in $ids
] {
  _id,
  name,
  "slug": slug.current,
  price,
  "image": images[0]{
    asset->{
      _id,
      url
    },
    hotspot
  },
  stock,
  ${PRODUCT_OPTIONS_PROJECTION},
  ${PRODUCT_VARIANTS_PROJECTION}
}`);

/**
 * Get low stock products (admin)
 * Uses LOW_STOCK_THRESHOLD constant for consistency
 */
export const LOW_STOCK_PRODUCTS_QUERY = defineQuery(`*[
  _type == "product"
  && stock > 0
  && stock <= ${LOW_STOCK_THRESHOLD}
] | order(stock asc) {
  _id,
  name,
  "slug": slug.current,
  stock,
  "image": images[0]{
    asset->{
      _id,
      url
    }
  }
}`);

/**
 * Get out of stock products (admin)
 */
export const OUT_OF_STOCK_PRODUCTS_QUERY = defineQuery(`*[
  _type == "product"
  && stock == 0
] | order(name asc) {
  _id,
  name,
  "slug": slug.current,
  "image": images[0]{
    asset->{
      _id,
      url
    }
  }
}`);

// ============================================
// AI Shopping Assistant Query
// ============================================

/**
 * Search products for AI shopping assistant
 */
export const AI_SEARCH_PRODUCTS_QUERY = defineQuery(`*[
  _type == "product"
  && (
    $searchQuery == ""
    || name match $searchQuery + "*"
    || description match $searchQuery + "*"
    || brand match $searchQuery + "*"
    || category->title match $searchQuery + "*"
  )
  && ${CATEGORY_FILTER_CONDITION}
  && ($brand == "" || brand == $brand)
  && (count($goals) == 0 || count(goals[@ in $goals]) > 0)
  && (count($sports) == 0 || count(sports[@ in $sports]) > 0)
  && ($gender == "" || gender == $gender)
  && ${PRICE_FILTER_CONDITION}
] | order(_createdAt desc) [0...20] {
  _id,
  name,
  "slug": slug.current,
  description,
  price,
  brand,
  productType,
  goals,
  sports,
  gender,
  "image": images[0]{
    asset->{
      _id,
      url
    }
  },
  category->{
    _id,
    title,
    "slug": slug.current
  },
  stock,
  featured,
  isDigital,
  ${PRODUCT_OPTIONS_PROJECTION},
  ${PRODUCT_VARIANTS_PROJECTION}
}`);
