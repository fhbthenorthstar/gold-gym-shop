import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const categoryType = defineType({
  name: "category",
  title: "Category",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => [
        rule.required().error("Category title is required"),
      ],
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => [
        rule.required().error("Slug is required for URL generation"),
      ],
    }),
    defineField({
      name: "image",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "Category thumbnail image",
    }),
    defineField({
      name: "parent",
      type: "reference",
      to: [{ type: "category" }],
      description: "Optional parent category for nested navigation",
    }),
    defineField({
      name: "order",
      type: "number",
      initialValue: 0,
      description: "Lower numbers appear first",
    }),
    defineField({
      name: "featuredInMenu",
      type: "boolean",
      initialValue: true,
      description: "Show this category in the mega menu",
    }),
    defineField({
      name: "filterConfig",
      type: "object",
      description: "Filter visibility rules for the shop page",
      fields: [
        defineField({
          name: "showBrand",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "showGoals",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "showSports",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "showGender",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "optionFilters",
          type: "array",
          of: [{ type: "string" }],
          description:
            "List of option names to surface (e.g., Color, Size, Weight)",
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
      parentTitle: "parent.title",
    },
    prepare({ title, media, parentTitle }) {
      return {
        title,
        subtitle: parentTitle ? `Parent: ${parentTitle}` : undefined,
        media,
      };
    },
  },
});
