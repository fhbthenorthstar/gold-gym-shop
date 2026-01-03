import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const comment = String(body?.comment ?? "").trim();

    if (!name || !phone || !comment) {
      return NextResponse.json(
        { error: "Name, phone, and comment are required." },
        { status: 400 }
      );
    }

    const created = await writeClient.create({
      _type: "contactMessage",
      name,
      phone,
      comment,
      status: "pending",
    });

    return NextResponse.json({ id: created._id });
  } catch (error) {
    console.error("Contact form submission failed", error);
    return NextResponse.json(
      { error: "Unable to submit contact request." },
      { status: 500 }
    );
  }
}
