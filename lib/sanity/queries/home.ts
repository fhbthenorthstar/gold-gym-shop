import { defineQuery } from "next-sanity";

const HOME_PRODUCT_CARD_PROJECTION = `{
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
  options[]{
    name,
    values
  },
  variants[]{
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
  }
}`;

export const HOME_OFFER_QUERY = defineQuery(`*[_type == "homeOffer"] | order(order asc)[0]{
  _id,
  eyebrow,
  title,
  description,
  bullets,
  ctaLabel,
  ctaLink,
  image{
    asset->{
      _id,
      url
    },
    hotspot
  },
  "brandLogos": brandLogos[]{
    _key,
    asset->{
      _id,
      url
    },
    hotspot
  }
}`);

export const HOME_TRAINERS_QUERY = defineQuery(`*[
  _type == "trainer"
  && (featured == true || !defined(featured))
] | order(order asc, name asc) {
  _id,
  name,
  role,
  "image": image{
    asset->{
      _id,
      url
    },
    hotspot
  }
}`);

export const HOME_TESTIMONIALS_QUERY = defineQuery(`*[
  _type == "testimonial"
  && (featured == true || !defined(featured))
] | order(order asc, name asc) {
  _id,
  name,
  role,
  quote,
  rating,
  "avatar": avatar{
    asset->{
      _id,
      url
    },
    hotspot
  }
}`);

export const HOME_TRAININGS_QUERY = defineQuery(`*[
  _type == "training"
  && (featured == true || !defined(featured))
] | order(order asc, title asc) {
  _id,
  title,
  link,
  "image": image{
    asset->{
      _id,
      url
    },
    hotspot
  }
}`);

export const HOME_GALLERY_QUERY = defineQuery(`*[
  _type == "galleryImage"
  && (featured == true || !defined(featured))
] | order(order asc) {
  _id,
  title,
  link,
  "image": image{
    asset->{
      _id,
      url
    },
    hotspot
  }
}`);

export const HOME_CATEGORY_TABS_QUERY = defineQuery(`*[
  _type == "category"
  && !defined(parent)
  && (featuredInMenu == true || !defined(featuredInMenu))
] | order(order asc, title asc) {
  _id,
  title,
  "slug": slug.current,
  "products": *[
    _type == "product"
    && (
      category->slug.current == ^.slug.current
      || category->parent->slug.current == ^.slug.current
    )
  ] | order(featured desc, _createdAt desc) [0...9] ${HOME_PRODUCT_CARD_PROJECTION}
}`);
