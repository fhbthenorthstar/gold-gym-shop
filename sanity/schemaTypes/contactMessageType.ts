import { CommentIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const contactMessageType = defineType({
  name: "contactMessage",
  title: "Inquiry",
  type: "document",
  icon: CommentIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "phone",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "comment",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      type: "string",
      initialValue: "pending",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Resolved", value: "resolved" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "phone",
    },
  },
});
