import { defineQuery } from "next-sanity";

export const CUSTOMER_BY_EMAIL_QUERY = defineQuery(`*[
  _type == "customer"
  && email == $email
][0]{
  _id,
  email,
  name,
  clerkUserId,
  addresses,
  createdAt
}`);

export const CUSTOMER_BY_CLERK_ID_QUERY = defineQuery(`*[
  _type == "customer"
  && clerkUserId == $clerkUserId
][0]{
  _id,
  email,
  name,
  clerkUserId,
  addresses[]{
    _key,
    label,
    name,
    line1,
    line2,
    division,
    postcode,
    country,
    phone,
    isDefault
  },
  createdAt
}`);
