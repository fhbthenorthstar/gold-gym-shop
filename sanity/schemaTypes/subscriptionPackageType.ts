import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

const PACKAGE_LOCATIONS = [
  { title: "Bashundhara Sports City", value: "bashundhara-sports-city" },
  { title: "Bashundhara City Shopping Mall", value: "bashundhara-city-shopping-mall" },
] as const;

const PACKAGE_TIERS = [
  { title: "Gold", value: "gold" },
  { title: "Silver", value: "silver" },
  { title: "Pool & Spa", value: "pool-spa" },
] as const;

export const subscriptionPackageType = defineType({
  name: "subscriptionPackage",
  title: "Subscription Package",
  type: "document",
  icon: TagIcon,
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
      name: "location",
      type: "string",
      options: {
        list: PACKAGE_LOCATIONS,
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tier",
      type: "string",
      options: {
        list: PACKAGE_TIERS,
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "durationLabel",
      type: "string",
      description: "Display label (e.g., 1 Month, 6 Months, 1 Year).",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "durationMonths",
      type: "number",
      description: "Billing length in months (e.g., 1, 3, 6, 12).",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "accessLabel",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "packagePrice",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "offerPrice",
      type: "number",
      description: "Optional discounted price shown to members.",
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
      location: "location",
      tier: "tier",
      duration: "durationLabel",
    },
    prepare({ title, location, tier, duration }) {
      const locationLabel =
        location === "bashundhara-sports-city"
          ? "Bashundhara Sports City"
          : location === "bashundhara-city-shopping-mall"
            ? "Bashundhara City Shopping Mall"
            : location;
      const tierLabel =
        tier === "pool-spa" ? "Pool & Spa" : tier ? tier[0]?.toUpperCase() + tier.slice(1) : "";
      const subtitleParts = [locationLabel, tierLabel, duration].filter(Boolean);
      return {
        title: title ?? "Subscription Package",
        subtitle: subtitleParts.join(" • "),
      };
    },
  },
});
