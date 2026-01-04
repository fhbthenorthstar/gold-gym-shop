import { ActivityIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const trainingType = defineType({
  name: "training",
  title: "Training",
  type: "document",
  icon: ActivityIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "link",
      type: "string",
      description: "Optional link for the training card (category or product)",
    }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "order",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "featured",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
    },
  },
});
