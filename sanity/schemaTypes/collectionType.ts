import { DashboardIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const collectionType = defineType({
  name: "collection",
  title: "Collection",
  type: "document",
  icon: DashboardIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "heroImage",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "order",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "products",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "product" }],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "heroImage",
      count: "products.length",
    },
    prepare({ title, media, count }) {
      return {
        title,
        subtitle: `${count ?? 0} products`,
        media,
      };
    },
  },
});
