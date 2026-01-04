import { defineQuery } from "next-sanity";

/**
 * Get total product count
 */
export const PRODUCT_COUNT_QUERY = defineQuery(`count(*[_type == "product"])`);

/**
 * Get total order count
 */
export const ORDER_COUNT_QUERY = defineQuery(`count(*[_type == "order"])`);

/**
 * Get total revenue from completed orders
 */
export const TOTAL_REVENUE_QUERY = defineQuery(`math::sum(*[
  _type == "order"
  && status == "paid"
].total)`);

/**
 * Get total subscription count
 */
export const SUBSCRIPTION_COUNT_QUERY = defineQuery(
  `count(*[_type == "subscription" && !(_id in path("drafts.**"))])`
);

/**
 * Get active subscription count
 */
export const ACTIVE_SUBSCRIPTION_COUNT_QUERY = defineQuery(
  `count(*[_type == "subscription" && status == "active" && !(_id in path("drafts.**"))])`
);

/**
 * Get subscription revenue comparison data (current vs previous period)
 */
export const SUBSCRIPTION_REVENUE_BY_PERIOD_QUERY = defineQuery(`{
  "currentPeriod": math::sum(*[
    _type == "subscription"
    && paymentStatus == "paid"
    && _createdAt >= $currentStart
    && !(_id in path("drafts.**"))
  ].price),
  "previousPeriod": math::sum(*[
    _type == "subscription"
    && paymentStatus == "paid"
    && _createdAt >= $previousStart
    && _createdAt < $currentStart
    && !(_id in path("drafts.**"))
  ].price),
  "currentCount": count(*[
    _type == "subscription"
    && _createdAt >= $currentStart
    && !(_id in path("drafts.**"))
  ]),
  "previousCount": count(*[
    _type == "subscription"
    && _createdAt >= $previousStart
    && _createdAt < $currentStart
    && !(_id in path("drafts.**"))
  ])
}`);

// ============================================
// AI Insights Analytics Queries
// ============================================

/**
 * Get orders from the last 7 days with details
 * Excludes draft documents
 */
export const ORDERS_LAST_7_DAYS_QUERY = defineQuery(`*[
  _type == "order"
  && createdAt >= $startDate
  && !(_id in path("drafts.**"))
] | order(createdAt desc) {
  _id,
  orderNumber,
  total,
  status,
  createdAt,
  "itemCount": count(items),
  items[]{
    quantity,
    priceAtPurchase,
    "productName": product->name,
    "productId": product->_id
  }
}`);

/**
 * Get order status distribution
 * Excludes draft documents to get accurate counts
 */
export const ORDER_STATUS_DISTRIBUTION_QUERY = defineQuery(`{
  "cod": count(*[_type == "order" && status == "cod" && !(_id in path("drafts.**"))]),
  "paid": count(*[_type == "order" && status == "paid" && !(_id in path("drafts.**"))])
}`);

/**
 * Get top selling products by quantity sold
 * Excludes draft documents
 */
export const TOP_SELLING_PRODUCTS_QUERY = defineQuery(`*[
  _type == "order"
  && status == "paid"
  && !(_id in path("drafts.**"))
] {
  items[]{
    "productId": product->_id,
    "productName": product->name,
    "productPrice": product->price,
    quantity
  }
}.items[]`);

/**
 * Get all products with stock and sales data for inventory analysis
 */
export const PRODUCTS_INVENTORY_QUERY = defineQuery(`*[_type == "product"] {
  _id,
  name,
  price,
  stock,
  "category": category->title
}`);

/**
 * Get unfulfilled orders (COD orders awaiting confirmation)
 * Excludes draft documents to get accurate counts
 */
export const UNFULFILLED_ORDERS_QUERY = defineQuery(`*[
  _type == "order"
  && status == "cod"
  && !(_id in path("drafts.**"))
] | order(createdAt asc) {
  _id,
  orderNumber,
  total,
  createdAt,
  email,
  "itemCount": count(items)
}`);

/**
 * Get revenue comparison data (current vs previous period)
 * Excludes draft documents
 */
export const REVENUE_BY_PERIOD_QUERY = defineQuery(`{
  "currentPeriod": math::sum(*[
    _type == "order"
    && status == "paid"
    && createdAt >= $currentStart
    && !(_id in path("drafts.**"))
  ].total),
  "previousPeriod": math::sum(*[
    _type == "order"
    && status == "paid"
    && createdAt >= $previousStart
    && createdAt < $currentStart
    && !(_id in path("drafts.**"))
  ].total),
  "currentOrderCount": count(*[
    _type == "order"
    && createdAt >= $currentStart
    && !(_id in path("drafts.**"))
  ]),
  "previousOrderCount": count(*[
    _type == "order"
    && createdAt >= $previousStart
    && createdAt < $currentStart
    && !(_id in path("drafts.**"))
  ])
}`);
