import { BoltIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const homeOfferType = defineType({
  name: "homeOffer",
  title: "Home Offer",
  type: "document",
  icon: BoltIcon,
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      description: "Small label above the headline",
    }),
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "bullets",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "ctaLabel",
      type: "string",
    }),
    defineField({
      name: "ctaLink",
      type: "url",
    }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "brandLogos",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
        }),
      ],
    }),
    defineField({
      name: "order",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
    },
  },
});
