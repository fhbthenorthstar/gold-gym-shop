import { NextResponse } from "next/server";
import { createHash } from "crypto";

const FACEBOOK_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_TEST_EVENT_CODE = process.env.FACEBOOK_TEST_EVENT_CODE;

type CapiPayload = {
  eventName?: string;
  eventId?: string;
  eventTime?: number;
  eventSourceUrl?: string;
  customData?: Record<string, unknown>;
  userData?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    externalId?: string;
    fbp?: string;
    fbc?: string;
  };
};

const normalize = (value: string) => value.trim().toLowerCase();
const normalizePhone = (value: string) => value.replace(/\D/g, "");

const hashValue = (value: string) =>
  createHash("sha256").update(value).digest("hex");

const readCookieValue = (cookieHeader: string, key: string) => {
  const match = cookieHeader.match(new RegExp(`(?:^|; )${key}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
};

export async function POST(request: Request) {
  if (!FACEBOOK_PIXEL_ID || !FACEBOOK_ACCESS_TOKEN) {
    return NextResponse.json({ ok: false, skipped: true });
  }

  try {
    const body = (await request.json()) as CapiPayload;
    const eventName = body.eventName ?? "PageView";
    const eventId = body.eventId ?? undefined;
    const eventTime = body.eventTime ?? Math.floor(Date.now() / 1000);
    const eventSourceUrl = body.eventSourceUrl ?? undefined;
    const customData = body.customData ?? {};

    const cookieHeader = request.headers.get("cookie") ?? "";
    const userData = body.userData ?? {};
    const fbp =
      userData.fbp || readCookieValue(cookieHeader, "_fbp") || undefined;
    const fbc =
      userData.fbc || readCookieValue(cookieHeader, "_fbc") || undefined;

    const userPayload: Record<string, string> = {};

    if (userData.email) {
      userPayload.em = hashValue(normalize(userData.email));
    }
    if (userData.phone) {
      userPayload.ph = hashValue(normalizePhone(userData.phone));
    }
    if (userData.firstName) {
      userPayload.fn = hashValue(normalize(userData.firstName));
    }
    if (userData.lastName) {
      userPayload.ln = hashValue(normalize(userData.lastName));
    }
    if (userData.externalId) {
      userPayload.external_id = hashValue(normalize(userData.externalId));
    }
    if (fbp) {
      userPayload.fbp = fbp;
    }
    if (fbc) {
      userPayload.fbc = fbc;
    }

    const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
    const clientIp = forwardedFor.split(",")[0]?.trim();
    const userAgent = request.headers.get("user-agent") ?? "";

    if (clientIp) {
      userPayload.client_ip_address = clientIp;
    }
    if (userAgent) {
      userPayload.client_user_agent = userAgent;
    }

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: eventTime,
          event_id: eventId,
          action_source: "website",
          event_source_url: eventSourceUrl,
          user_data: userPayload,
          custom_data: customData,
        },
      ],
      ...(FACEBOOK_TEST_EVENT_CODE
        ? { test_event_code: FACEBOOK_TEST_EVENT_CODE }
        : {}),
    };

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${FACEBOOK_PIXEL_ID}/events?access_token=${FACEBOOK_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Facebook CAPI error:", errorText);
    }

    return NextResponse.json({ ok: response.ok });
  } catch (error) {
    console.error("Facebook CAPI error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
