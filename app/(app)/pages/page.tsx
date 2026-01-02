import Link from "next/link";
import { PageHero } from "@/components/app/PageHero";

const pages = [
  { title: "Shipping Information", href: "/pages/shipping" },
  { title: "Returns & Exchanges", href: "/pages/returns" },
  { title: "Privacy Policy", href: "/pages/privacy" },
  { title: "Terms & Conditions", href: "/pages/terms" },
];

export default function PagesIndex() {
  return (
    <div className="min-h-screen bg-black">
      <PageHero title="Pages" subtitle="Quick links and store policies." />
      <section className="mx-auto max-w-4xl px-4 py-12 text-zinc-300">
        <div className="grid gap-4">
          {pages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4 text-sm text-white hover:border-lime-300 hover:text-lime-300"
            >
              {page.title}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
