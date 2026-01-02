import { redirect } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/live";
import { ORDER_BY_ID_QUERY } from "@/lib/sanity/queries/orders";
import { SuccessClient } from "./SuccessClient";

export const metadata = {
  title: "Order Confirmed | Gold's Gym Shop",
  description: "Your order has been placed successfully",
};

interface SuccessPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const orderId = params.orderId;

  if (!orderId) {
    redirect("/");
  }

  const { data: order } = await sanityFetch({
    query: ORDER_BY_ID_QUERY,
    params: { id: orderId },
  });

  if (!order) {
    redirect("/");
  }

  return <SuccessClient order={order} />;
}
