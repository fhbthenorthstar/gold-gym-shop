import { defineQuery } from "next-sanity";

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
