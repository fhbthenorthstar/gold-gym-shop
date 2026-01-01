"use client";

import { SanityApp } from "@sanity/sdk-react";
import { dataset, projectId } from "@/sanity/env";

const normalizeUrl = (value: string | undefined | null) => {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).toString();
  } catch {
    try {
      return new URL(decodeURIComponent(value)).toString();
    } catch {
      return null;
    }
  }
};

function SanityAppProvider({ children }: { children: React.ReactNode }) {
  const appBaseUrl = normalizeUrl(process.env.NEXT_PUBLIC_APP_URL);
  const adminBaseUrl =
    typeof window !== "undefined"
      ? new URL("/admin", window.location.origin).toString()
      : appBaseUrl
        ? new URL("/admin", appBaseUrl).toString()
        : null;
  const initialLocationHref =
    typeof window !== "undefined" ? window.location.href : adminBaseUrl;

  return (
    <SanityApp
      config={[
        {
          projectId,
          dataset,
          ...(adminBaseUrl
            ? {
                auth: {
                  callbackUrl: adminBaseUrl,
                  initialLocationHref,
                },
              }
            : {}),
        },
      ]}
      // We handle the loading state in the Providers component by showing a loading indicator via the dynamic import
      fallback={<div />}
    >
      {children}
    </SanityApp>
  );
}

export default SanityAppProvider;
