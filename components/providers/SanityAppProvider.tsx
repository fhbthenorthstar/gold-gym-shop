"use client";

import { ResourceProvider } from "@sanity/sdk-react";
import { dataset, projectId } from "@/sanity/env";

function SanityAppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ResourceProvider projectId={projectId} dataset={dataset} fallback={<div />}>
      {children}
    </ResourceProvider>
  );
}

export default SanityAppProvider;
