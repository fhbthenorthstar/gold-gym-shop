import { auth, currentUser } from "@clerk/nextjs/server";
import { sanityFetch } from "@/sanity/lib/live";
import { CUSTOMER_BY_CLERK_ID_QUERY } from "@/lib/sanity/queries/customers";
import { CheckoutClient } from "./CheckoutClient";

export const metadata = {
  title: "Checkout | Gold's Gym Shop",
  description: "Complete your purchase",
};

export default function CheckoutPage() {
  return <CheckoutClientLoader />;
}

async function CheckoutClientLoader() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;

  const { data: customer } = userId
    ? await sanityFetch({
        query: CUSTOMER_BY_CLERK_ID_QUERY,
        params: { clerkUserId: userId },
      })
    : { data: null };

  const initialEmail = user?.emailAddresses[0]?.emailAddress ?? customer?.email ?? "";
  const fallbackName =
    user?.fullName ??
    [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const initialName = customer?.name ?? fallbackName ?? "";

  return (
    <CheckoutClient
      isSignedIn={!!userId}
      initialEmail={initialEmail}
      initialName={initialName}
      initialAddresses={customer?.addresses ?? []}
    />
  );
}
