import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

const serverReadToken =
  process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN;
const browserReadToken = process.env.NEXT_PUBLIC_SANITY_READ_TOKEN;
const readToken =
  typeof window === "undefined"
    ? serverReadToken ?? browserReadToken
    : browserReadToken;

// Read-only client (for fetching data)
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to false if statically generating pages, using ISR or tag-based revalidation
  perspective: "published",
  token: readToken,
});

// Write client (for mutations - used in webhooks/server actions)
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});
