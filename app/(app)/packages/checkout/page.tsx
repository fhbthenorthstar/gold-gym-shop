import { redirect } from "next/navigation";

export default function SubscriptionCheckoutRedirect({
  searchParams,
}: {
  searchParams: { package?: string };
}) {
  const packageSlug = searchParams.package;
  if (!packageSlug) {
    redirect("/subscribe");
  }

  redirect(`/subscribe?package=${encodeURIComponent(packageSlug)}`);
}
