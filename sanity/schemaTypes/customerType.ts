import { UserIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import { DEFAULT_COUNTRY, BANGLADESH_DIVISIONS } from "@/lib/constants/bangladesh";

export const customerType = defineType({
  name: "customer",
  title: "Customer",
  type: "document",
  icon: UserIcon,
  groups: [
    { name: "details", title: "Customer Details", default: true },
    { name: "stripe", title: "Stripe" },
  ],
  fields: [
    defineField({
      name: "email",
      type: "string",
      group: "details",
      validation: (rule) => [rule.required().error("Email is required")],
    }),
    defineField({
      name: "name",
      type: "string",
      group: "details",
      description: "Customer's full name",
    }),
    defineField({
      name: "clerkUserId",
      type: "string",
      group: "details",
      description: "Clerk user ID for authentication",
    }),
    defineField({
      name: "addresses",
      type: "array",
      group: "details",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              type: "string",
              title: "Label",
              description: "Optional label like Home or Office",
            }),
            defineField({ name: "name", type: "string", title: "Full Name" }),
            defineField({
              name: "line1",
              type: "string",
              title: "Address Line 1",
            }),
            defineField({
              name: "line2",
              type: "string",
              title: "Address Line 2",
            }),
            defineField({
              name: "division",
              type: "string",
              title: "Division",
              options: {
                list: [...BANGLADESH_DIVISIONS],
              },
            }),
            defineField({
              name: "postcode",
              type: "string",
              title: "Postcode",
            }),
            defineField({
              name: "country",
              type: "string",
              initialValue: DEFAULT_COUNTRY,
            }),
            defineField({ name: "phone", type: "string", title: "Phone" }),
            defineField({
              name: "isDefault",
              type: "boolean",
              title: "Default Address",
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              title: "label",
              name: "name",
              line1: "line1",
              division: "division",
              isDefault: "isDefault",
            },
            prepare({ title, name, line1, division, isDefault }) {
              const label = title || name || "Address";
              const location = [line1, division].filter(Boolean).join(", ");
              return {
                title: isDefault ? `${label} (Default)` : label,
                subtitle: location || "No address details",
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "stripeCustomerId",
      type: "string",
      group: "stripe",
      readOnly: true,
      description: "Stripe customer ID for payments",
    }),
    defineField({
      name: "createdAt",
      type: "datetime",
      group: "details",
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      email: "email",
      name: "name",
      stripeCustomerId: "stripeCustomerId",
    },
    prepare({ email, name, stripeCustomerId }) {
      return {
        title: name ?? email ?? "Unknown Customer",
        subtitle: stripeCustomerId
          ? `${email ?? ""} • ${stripeCustomerId}`
          : (email ?? ""),
      };
    },
  },
  orderings: [
    {
      title: "Newest First",
      name: "createdAtDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
    {
      title: "Email A-Z",
      name: "emailAsc",
      by: [{ field: "email", direction: "asc" }],
    },
  ],
});
