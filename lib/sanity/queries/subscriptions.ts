import { defineQuery } from "next-sanity";

export const SUBSCRIPTION_PACKAGES_QUERY = defineQuery(`*[
  _type == "subscriptionPackage"
  && !(_id in path("drafts.**"))
] | order(location asc, tier asc, durationMonths asc, order asc) {
  _id,
  title,
  "slug": slug.current,
  location,
  tier,
  durationLabel,
  durationMonths,
  accessLabel,
  packagePrice,
  offerPrice,
  featured
}`);

export const SUBSCRIPTION_PACKAGE_BY_SLUG_QUERY = defineQuery(`*[
  _type == "subscriptionPackage"
  && slug.current == $slug
  && !(_id in path("drafts.**"))
][0] {
  _id,
  title,
  "slug": slug.current,
  location,
  tier,
  durationLabel,
  durationMonths,
  accessLabel,
  packagePrice,
  offerPrice,
  featured
}`);

export const SUBSCRIPTIONS_BY_USER_QUERY = defineQuery(`*[
  _type == "subscription"
  && userId == $userId
  && !(_id in path("drafts.**"))
] | order(startDate desc) {
  _id,
  subscriptionNumber,
  subscriberName,
  subscriberEmail,
  subscriberPhone,
  price,
  status,
  paymentMethod,
  paymentStatus,
  startDate,
  endDate,
  nextRenewalDate,
  "package": package->{
    _id,
    title,
    location,
    tier,
    durationLabel,
    durationMonths,
    accessLabel,
    packagePrice,
    offerPrice,
    "slug": slug.current
  }
}`);

export const SUBSCRIPTIONS_RECENT_QUERY = defineQuery(`*[
  _type == "subscription"
  && !(_id in path("drafts.**"))
] | order(_createdAt desc)[0...8] {
  _id,
  subscriptionNumber,
  subscriberName,
  price,
  status,
  startDate,
  "packageTitle": package->title
}`);
