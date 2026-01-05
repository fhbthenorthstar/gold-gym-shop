import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const discountType = defineType({
  name: "discount",
  title: "Discount",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "code",
      type: "string",
      description: "Enter the code shoppers will apply at checkout.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "type",
      type: "string",
      initialValue: "percentage",
      options: {
        list: [
          { title: "Percentage", value: "percentage" },
          { title: "Fixed Amount", value: "fixed" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "amount",
      type: "number",
      description: "Percentage or fixed amount in BDT.",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "minSubtotal",
      type: "number",
      description: "Minimum cart subtotal required.",
      initialValue: 0,
    }),
    defineField({
      name: "maxDiscount",
      type: "number",
      description: "Optional cap for percentage discounts.",
    }),
    defineField({
      name: "startsAt",
      type: "datetime",
    }),
    defineField({
      name: "endsAt",
      type: "datetime",
    }),
    defineField({
      name: "maxUses",
      type: "number",
      description: "Optional max number of redemptions.",
    }),
    defineField({
      name: "usedCount",
      type: "number",
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: "active",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      code: "code",
      type: "type",
      amount: "amount",
    },
    prepare({ title, code, type, amount }) {
      const suffix = type === "percentage" ? "%" : "BDT";
      return {
        title: title ?? code ?? "Discount",
        subtitle: code ? `${code} • ${amount ?? 0}${suffix}` : undefined,
      };
    },
  },
});
