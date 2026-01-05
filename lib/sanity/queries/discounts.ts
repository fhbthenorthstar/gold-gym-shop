import { defineQuery } from "next-sanity";

export const DISCOUNT_BY_CODE_QUERY = defineQuery(`*[
  _type == "discount"
  && lower(code) == lower($code)
][0]{
  _id,
  title,
  code,
  type,
  amount,
  minSubtotal,
  maxDiscount,
  active,
  startsAt,
  endsAt,
  maxUses,
  usedCount
}`);
