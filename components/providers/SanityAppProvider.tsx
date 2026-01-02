"use client";

import { ResourceProvider } from "@sanity/sdk-react";
import { dataset, projectId } from "@/sanity/env";

const readToken = process.env.NEXT_PUBLIC_SANITY_READ_TOKEN;

function SanityAppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ResourceProvider
      projectId={projectId}
      dataset={dataset}
      auth={readToken ? { token: readToken } : undefined}
      fallback={<div />}
    >
      {children}
    </ResourceProvider>
  );
}

export default SanityAppProvider;
