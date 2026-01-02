import { PackageIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import {
  PRODUCT_TYPE_SANITY_LIST,
  GOAL_SANITY_LIST,
  SPORT_SANITY_LIST,
  GENDER_SANITY_LIST,
} from "@/lib/constants/filters";

export const productType = defineType({
  name: "product",
  title: "Product",
  type: "document",
  icon: PackageIcon,
  groups: [
    { name: "details", title: "Details", default: true },
    { name: "media", title: "Media" },
    { name: "inventory", title: "Inventory" },
    { name: "variants", title: "Options & Variants" },
    { name: "metadata", title: "Metafields" },
  ],
  fields: [
    defineField({
      name: "name",
      type: "string",
      group: "details",
      validation: (rule) => [rule.required().error("Product name is required")],
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "details",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (rule) => [
        rule.required().error("Slug is required for URL generation"),
      ],
    }),
    defineField({
      name: "description",
      type: "text",
      group: "details",
      rows: 4,
      validation: (rule) => [
        rule.required().error("Description is required"),
      ],
    }),
    defineField({
      name: "brand",
      type: "string",
      group: "details",
      description: "Brand or manufacturer name",
    }),
    defineField({
      name: "productType",
      type: "string",
      group: "details",
      options: {
        list: PRODUCT_TYPE_SANITY_LIST,
        layout: "radio",
      },
      validation: (rule) => [
        rule.required().error("Product type is required"),
      ],
    }),
    defineField({
      name: "goals",
      type: "array",
      group: "details",
      of: [
        defineArrayMember({
          type: "string",
          options: {
            list: GOAL_SANITY_LIST,
          },
        }),
      ],
    }),
    defineField({
      name: "sports",
      type: "array",
      group: "details",
      of: [
        defineArrayMember({
          type: "string",
          options: {
            list: SPORT_SANITY_LIST,
          },
        }),
      ],
    }),
    defineField({
      name: "gender",
      type: "string",
      group: "details",
      options: {
        list: GENDER_SANITY_LIST,
        layout: "radio",
      },
    }),
    defineField({
      name: "price",
      type: "number",
      group: "details",
      description: "Base price in BDT (variants can override)",
      validation: (rule) => [
        rule.required().error("Price is required"),
        rule.positive().error("Price must be a positive number"),
      ],
    }),
    defineField({
      name: "category",
      type: "reference",
      to: [{ type: "category" }],
      group: "details",
      validation: (rule) => [rule.required().error("Category is required")],
    }),
    defineField({
      name: "images",
      type: "array",
      group: "media",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
      validation: (rule) => [
        rule.min(1).error("At least one image is required"),
      ],
    }),
    defineField({
      name: "stock",
      type: "number",
      group: "inventory",
      initialValue: 0,
      description: "Base stock (variants can override)",
      validation: (rule) => [
        rule.min(0).error("Stock cannot be negative"),
        rule.integer().error("Stock must be a whole number"),
      ],
    }),
    defineField({
      name: "featured",
      type: "boolean",
      group: "inventory",
      initialValue: false,
      description: "Show on homepage and promotions",
    }),
    defineField({
      name: "isDigital",
      type: "boolean",
      group: "inventory",
      initialValue: false,
      description: "Digital product (no shipping required)",
    }),
    defineField({
      name: "options",
      type: "array",
      group: "variants",
      description: "Shopify-style option definitions",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "name",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "values",
              type: "array",
              of: [{ type: "string" }],
              validation: (rule) => rule.min(1),
            }),
          ],
          preview: {
            select: {
              title: "name",
              values: "values",
            },
            prepare({ title, values }) {
              return {
                title: title ?? "Option",
                subtitle: Array.isArray(values) ? values.join(", ") : "",
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "variants",
      type: "array",
      group: "variants",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "sku",
              type: "string",
            }),
            defineField({
              name: "price",
              type: "number",
              validation: (rule) => [
                rule.positive().error("Variant price must be positive"),
              ],
            }),
            defineField({
              name: "compareAtPrice",
              type: "number",
              validation: (rule) => [
                rule.min(0).error("Compare-at price must be positive"),
              ],
            }),
            defineField({
              name: "stock",
              type: "number",
              validation: (rule) => [
                rule.min(0).error("Stock cannot be negative"),
                rule.integer().error("Stock must be a whole number"),
              ],
            }),
            defineField({
              name: "optionValues",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  fields: [
                    defineField({
                      name: "name",
                      type: "string",
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: "value",
                      type: "string",
                      validation: (rule) => rule.required(),
                    }),
                  ],
                  preview: {
                    select: {
                      title: "name",
                      subtitle: "value",
                    },
                  },
                }),
              ],
            }),
            defineField({
              name: "image",
              type: "image",
              options: {
                hotspot: true,
              },
            }),
          ],
          preview: {
            select: {
              sku: "sku",
              price: "price",
              optionValues: "optionValues",
              media: "image",
            },
            prepare({ sku, price, optionValues, media }) {
              const optionLabel = Array.isArray(optionValues)
                ? optionValues
                    .map((opt) =>
                      opt?.name && opt?.value
                        ? `${opt.name}: ${opt.value}`
                        : ""
                    )
                    .filter(Boolean)
                    .join(" / ")
                : "";
              return {
                title: sku || "Variant",
                subtitle: `${optionLabel}${price ? ` • ${price}` : ""}`,
                media,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "metafields",
      type: "array",
      group: "metadata",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "key",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "type",
              type: "string",
              options: {
                list: [
                  { title: "String", value: "string" },
                  { title: "Number", value: "number" },
                  { title: "Boolean", value: "boolean" },
                ],
                layout: "radio",
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "valueString",
              type: "string",
              hidden: ({ parent }) => parent?.type !== "string",
            }),
            defineField({
              name: "valueNumber",
              type: "number",
              hidden: ({ parent }) => parent?.type !== "number",
            }),
            defineField({
              name: "valueBoolean",
              type: "boolean",
              hidden: ({ parent }) => parent?.type !== "boolean",
            }),
          ],
          preview: {
            select: {
              key: "key",
              type: "type",
              valueString: "valueString",
              valueNumber: "valueNumber",
              valueBoolean: "valueBoolean",
            },
            prepare({ key, type, valueString, valueNumber, valueBoolean }) {
              const value =
                type === "number"
                  ? valueNumber
                  : type === "boolean"
                    ? valueBoolean
                    : valueString;
              return {
                title: key ?? "Metafield",
                subtitle: `${type ?? ""}${
                  value !== undefined ? ` • ${value}` : ""
                }`,
              };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "category.title",
      media: "images.0",
      price: "price",
      brand: "brand",
    },
    prepare({ title, subtitle, media, price, brand }) {
      const parts = [brand, subtitle].filter(Boolean).join(" • ");
      return {
        title,
        subtitle: `${parts ? parts + " • " : ""}${price ?? 0}`,
        media,
      };
    },
  },
});
