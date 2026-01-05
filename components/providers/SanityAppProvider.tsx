"use client";

import { ResourceProvider } from "@sanity/sdk-react";
import { createClient } from "@sanity/client";
import { apiVersion, dataset, projectId } from "@/sanity/env";

const readToken =
  process.env.NEXT_PUBLIC_SANITY_WRITE_TOKEN ||
  process.env.NEXT_PUBLIC_SANITY_READ_TOKEN;

function SanityAppProvider({ children }: { children: React.ReactNode }) {
  const apiHost = projectId ? `${projectId}.api.sanity.io` : undefined;

  return (
    <ResourceProvider
      projectId={projectId}
      dataset={dataset}
      studioMode={{ enabled: true }}
      auth={
        readToken
          ? {
              token: readToken,
              apiHost,
              clientFactory: (config) =>
                createClient({
                  ...config,
                  apiVersion,
                  useCdn: false,
                }),
            }
          : undefined
      }
      fallback={<div />}
    >
      {children}
    </ResourceProvider>
  );
}

export default SanityAppProvider;
