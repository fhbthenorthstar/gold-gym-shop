"use client";

import { SanityApp } from "@sanity/sdk-react";
import { dataset, projectId } from "@/sanity/env";

const appUrl = process.env.NEXT_PUBLIC_APP_URL; // https://www.goldgym.shop
const callbackUrl = appUrl ? `${appUrl}/admin` : undefined;

function SanityAppProvider({ children }: { children: React.ReactNode }) {
  return (
    <SanityApp
      config={[
        {
          projectId,
          dataset,
          auth: {
            callbackUrl,
            // optional but helps a lot if redirects get weird
            initialLocationHref: callbackUrl,
          },
        },
      ]}
      fallback={<div />}
    >
      {children}
    </SanityApp>
  );
}

export default SanityAppProvider;
