"use client";

import { SanityApp } from "@sanity/sdk-react";
import { dataset, projectId } from "@/sanity/env";

function SanityAppProvider({ children }: { children: React.ReactNode }) {
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const adminUrl = appBaseUrl
    ? new URL("/admin", appBaseUrl).toString()
    : null;

  return (
    <SanityApp
      config={[
        {
          projectId,
          dataset,
          ...(adminUrl
            ? {
                auth: {
                  callbackUrl: adminUrl,
                  initialLocationHref: adminUrl,
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
