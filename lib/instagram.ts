type InstagramMedia = {
  id: string;
  caption?: string | null;
  media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | string | null;
  media_url?: string | null;
  thumbnail_url?: string | null;
  permalink?: string | null;
  timestamp?: string | null;
};

type InstagramResponse = {
  data?: InstagramMedia[];
};

const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const USER_ID = process.env.INSTAGRAM_USER_ID;

export const fetchInstagramMedia = async (limit = 8) => {
  if (!ACCESS_TOKEN) {
    return null;
  }

  const fields = [
    "id",
    "caption",
    "media_type",
    "media_url",
    "thumbnail_url",
    "permalink",
    "timestamp",
  ].join(",");

  const url = USER_ID
    ? new URL(`https://graph.facebook.com/v19.0/${USER_ID}/media`)
    : new URL("https://graph.instagram.com/me/media");

  url.searchParams.set("fields", fields);
  url.searchParams.set("access_token", ACCESS_TOKEN);
  url.searchParams.set("limit", String(limit));

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.warn("Instagram fetch failed:", res.status);
      return null;
    }

    const payload = (await res.json()) as InstagramResponse;
    if (!payload?.data) return null;

    return payload.data.filter(
      (item) => item.media_url || item.thumbnail_url
    );
  } catch (error) {
    console.warn("Instagram fetch error:", error);
    return null;
  }
};
