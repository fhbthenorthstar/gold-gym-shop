import { defineQuery } from "next-sanity";

/**
 * Get orders by Clerk user ID
 * Used on orders list page
 */
export const ORDERS_BY_USER_QUERY = defineQuery(`*[
  _type == "order"
  && clerkUserId == $clerkUserId
] | order(createdAt desc) {
  _id,
  orderNumber,
  total,
  status,
  createdAt,
  "itemCount": count(items),
  "itemNames": items[].product->name,
  "itemImages": items[].product->images[0].asset->url
}`);

/**
 * Get single order by ID with full details
 * Used on order detail page
 */
export const ORDER_BY_ID_QUERY = defineQuery(`*[
  _type == "order"
  && _id == $id
][0] {
  _id,
  orderNumber,
  clerkUserId,
  email,
  items[]{
    _key,
    quantity,
    priceAtPurchase,
    product->{
      _id,
      name,
      "slug": slug.current,
      "image": images[0]{
        asset->{
          _id,
          url
        }
      }
    }
  },
  total,
  subtotal,
  shippingFee,
  status,
  paymentMethod,
  orderNotes,
  address{
    name,
    line1,
    line2,
    "division": coalesce(division, city),
    postcode,
    country,
    phone
  },
  createdAt
}`);

/**
 * Get recent orders (for admin dashboard)
 */
export const RECENT_ORDERS_QUERY = defineQuery(`*[
  _type == "order"
] | order(createdAt desc) [0...$limit] {
  _id,
  orderNumber,
  email,
  total,
  status,
  createdAt
}`);
