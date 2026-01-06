import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function SubscribeRedirectPage({
  searchParams,
}: {
  searchParams: { package?: string };
}) {
  const packageSlug = searchParams.package;
  if (packageSlug) {
    redirect(`/packages/checkout?package=${encodeURIComponent(packageSlug)}`);
  }

  redirect("/packages");
}
