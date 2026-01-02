import { notFound } from "next/navigation";
import { PageHero } from "@/components/app/PageHero";

const contentMap: Record<
  string,
  { title: string; body: string[] }
> = {
  shipping: {
    title: "Shipping Information",
    body: [
      "Orders are processed within 24-48 hours.",
      "Nationwide delivery with tracking updates via SMS and email.",
      "Contact support for bulk or custom shipping.",
    ],
  },
  returns: {
    title: "Returns & Exchanges",
    body: [
      "Returns are accepted within 7 days of delivery.",
      "Items must be unused and in original packaging.",
      "Contact support to initiate a return or exchange.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "We respect your privacy and protect your data.",
      "Customer data is used only for order processing and support.",
      "Contact us for any privacy-related requests.",
    ],
  },
  terms: {
    title: "Terms & Conditions",
    body: [
      "Prices and availability are subject to change without notice.",
      "Orders may be canceled for suspected fraud or inventory issues.",
      "By purchasing, you agree to our policies and store terms.",
    ],
  },
};

export default function StaticPage({
  params,
}: {
  params: { slug: string };
}) {
  const page = contentMap[params.slug];
  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black">
      <PageHero title={page.title} />
      <section className="mx-auto max-w-3xl px-4 py-12 text-zinc-300">
        <div className="space-y-4 text-sm">
          {page.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
