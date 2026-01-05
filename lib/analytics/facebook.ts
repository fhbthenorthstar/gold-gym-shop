export type FacebookEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase";

export interface FacebookUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  externalId?: string;
}

export interface FacebookEventOptions {
  eventId?: string;
  eventSourceUrl?: string;
  eventData?: Record<string, unknown>;
  userData?: FacebookUserData;
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

const FACEBOOK_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID ?? "";

export const getFacebookPixelId = () => FACEBOOK_PIXEL_ID;

const createEventId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : "";
};

export const ensureFbcCookie = (search?: string) => {
  if (typeof document === "undefined") return;
  const params = new URLSearchParams(search ?? window.location.search);
  const fbclid = params.get("fbclid");
  if (!fbclid) return;

  const fbcValue = `fb.1.${Date.now()}.${fbclid}`;
  document.cookie = `_fbc=${encodeURIComponent(fbcValue)}; path=/; max-age=7776000`;
};

const getFacebookCookies = () => ({
  fbp: getCookieValue("_fbp"),
  fbc: getCookieValue("_fbc"),
});

export const trackFacebookEvent = async (
  eventName: FacebookEventName,
  options: FacebookEventOptions = {}
) => {
  if (!FACEBOOK_PIXEL_ID || typeof window === "undefined") return null;

  const eventId = options.eventId ?? createEventId();
  const eventSourceUrl = options.eventSourceUrl ?? window.location.href;
  const customData = options.eventData ?? {};
  const { fbp, fbc } = getFacebookCookies();
  const userData = {
    ...options.userData,
    fbp: fbp || undefined,
    fbc: fbc || undefined,
  };

  if (window.fbq) {
    window.fbq("track", eventName, customData, { eventID: eventId });
  }

  try {
    await fetch("/api/facebook/capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        eventName,
        eventId,
        eventSourceUrl,
        customData,
        userData,
      }),
    });
  } catch (error) {
    console.warn("Facebook CAPI request failed", error);
  }

  return eventId;
};
