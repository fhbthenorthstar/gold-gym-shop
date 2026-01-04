import { NextResponse } from "next/server";
import { client, writeClient } from "@/sanity/lib/client";

type ReviewResponse = {
  _id: string;
  name: string;
  title: string;
  rating: number;
  body: string;
  createdAt: string;
  verifiedPurchase: boolean;
};

const REVIEW_QUERY = `*[
  _type == "review"
  && product._ref == $productId
  && status == "approved"
] | order(createdAt desc, _createdAt desc) {
  _id,
  name,
  title,
  rating,
  body,
  createdAt,
  verifiedPurchase
}`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json(
      { error: "Missing productId" },
      { status: 400 }
    );
  }

  const reviews = await client.fetch<ReviewResponse[]>(REVIEW_QUERY, {
    productId,
  });

  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const name = String(payload?.name ?? "").trim();
    const title = String(payload?.title ?? "").trim();
    const body = String(payload?.body ?? "").trim();
    const productId = String(payload?.productId ?? "").trim();
    const rating = Number(payload?.rating ?? 0);

    if (!productId || !name || !title || !body) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const createdAt = new Date().toISOString();
    const reviewDoc = {
      _type: "review",
      product: { _type: "reference", _ref: productId },
      name,
      title,
      rating,
      body,
      verifiedPurchase: false,
      status: "approved",
      createdAt,
    };

    const created = await writeClient.create(reviewDoc);

    return NextResponse.json(
      {
        review: {
          _id: created._id,
          name,
          title,
          rating,
          body,
          createdAt,
          verifiedPurchase: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Review submit error:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
