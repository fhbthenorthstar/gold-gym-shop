import { CalendarIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { SUBSCRIPTION_STATUS_SANITY_LIST } from "@/lib/constants/subscriptionStatus";
import {
  SUBSCRIPTION_PAYMENT_METHOD_SANITY_LIST,
  SUBSCRIPTION_PAYMENT_STATUS_SANITY_LIST,
} from "@/lib/constants/subscriptionPayments";

export const subscriptionType = defineType({
  name: "subscription",
  title: "Subscription",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "subscriptionNumber",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subscriberName",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subscriberEmail",
      type: "string",
    }),
    defineField({
      name: "subscriberPhone",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "userId",
      type: "string",
      description: "Clerk user ID for logged-in members.",
    }),
    defineField({
      name: "package",
      type: "reference",
      to: [{ type: "subscriptionPackage" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "price",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "startDate",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "endDate",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "nextRenewalDate",
      type: "date",
    }),
    defineField({
      name: "status",
      type: "string",
      options: {
        list: SUBSCRIPTION_STATUS_SANITY_LIST,
      },
      initialValue: "pending",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "paymentMethod",
      type: "string",
      options: {
        list: SUBSCRIPTION_PAYMENT_METHOD_SANITY_LIST,
      },
      initialValue: "online",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "paymentStatus",
      type: "string",
      options: {
        list: SUBSCRIPTION_PAYMENT_STATUS_SANITY_LIST,
      },
      initialValue: "pending",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "notes",
      type: "text",
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: "subscriberName",
      packageTitle: "package.title",
      status: "status",
    },
    prepare({ title, packageTitle, status }) {
      const statusLabel =
        status ? status[0]?.toUpperCase() + status.slice(1) : "Pending";
      return {
        title: title ?? "Subscriber",
        subtitle: `${packageTitle ?? "Package"} • ${statusLabel}`,
      };
    },
  },
});
