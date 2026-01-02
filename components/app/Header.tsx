"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Heart,
  Menu,
  Scale,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartActions, useTotalItems } from "@/lib/store/cart-store-provider";
import {
  useWishlistActions,
  useWishlistItems,
} from "@/lib/store/wishlist-store-provider";
import {
  useCompareActions,
  useCompareItems,
} from "@/lib/store/compare-store-provider";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About Us", href: "/about" },
  { label: "Pages", href: "/pages" },
  { label: "Contact", href: "/contact" },
];

const megaMenuColumns = [
  {
    title: "Equipments",
    slug: "gym-equipments",
    items: ["Dumbbells", "Weight Bench", "Treadmills", "Exercise Machines"],
  },
  {
    title: "Supplements",
    slug: "supplements",
    items: ["Antioxidants", "Build-Up Boosters", "Nutrition Mixes"],
  },
  {
    title: "Clothing",
    slug: "womens-wear",
    items: ["Track Pants", "Tank Tops", "Sports Bras"],
  },
  {
    title: "Gym Accessories",
    slug: "accessories",
    items: ["Bottles", "Bags", "Jump Ropes"],
  },
  {
    title: "Shoes",
    slug: "shoes",
    items: ["Training Shoes", "Running Shoes"],
  },
];

export function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalItems = useTotalItems();
  const wishlistItems = useWishlistItems();
  const compareItems = useCompareItems();
  const { openCart } = useCartActions();
  const { openWishlist } = useWishlistActions();
  const { openCompare } = useCompareActions();

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("q") ?? "");
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    const queryString = params.toString();
    router.push(queryString ? `/shop?${queryString}` : "/shop");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black">
      {/* Top bar */}
      <div className="border-b border-zinc-900 bg-zinc-950 text-xs text-zinc-400">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <span>Call Us: 0000-123-456789</span>
            <span className="hidden md:inline">info@fitfinity.com</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline">Free shipping on orders over ৳2,500</span>
            <span className="rounded-full border border-lime-400/40 px-2 py-0.5 text-[11px] text-lime-300">
              BDT
            </span>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded-md border border-zinc-800 p-2 text-zinc-200 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="https://dt-fitfinity.myshopify.com/cdn/shop/files/new-logo_1.png?v=1701161823"
              alt="Fitfinity"
              width={140}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <div key={item.label} className="group relative">
              <Link
                href={item.href}
                className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:text-lime-300"
              >
                {item.label}
                {item.label === "Shop" && (
                  <ChevronDown className="h-4 w-4 text-lime-300" />
                )}
              </Link>
              {item.label === "Shop" && (
                <div className="absolute left-1/2 top-full hidden w-[760px] -translate-x-1/2 pt-6 group-hover:block">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
                    <div className="grid grid-cols-5 gap-6">
                      {megaMenuColumns.map((column) => (
                        <div key={column.slug} className="space-y-3">
                          <Link
                            href={`/shop?category=${column.slug}`}
                            className="block text-sm font-semibold uppercase text-lime-300"
                          >
                            {column.title}
                          </Link>
                          <ul className="space-y-2 text-xs text-zinc-400">
                            {column.items.map((itemName) => (
                              <li key={itemName}>{itemName}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <form
            onSubmit={handleSearch}
            className="hidden items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 lg:flex"
          >
            <Search className="h-4 w-4 text-zinc-400" />
            <input
              name="q"
              defaultValue={searchParams.get("q") ?? ""}
              placeholder="Search"
              className="w-32 bg-transparent text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
            />
          </form>

          <Button
            variant="ghost"
            size="icon"
            className="relative text-zinc-200 hover:text-lime-300"
            onClick={openWishlist}
            aria-label="Open wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlistItems.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-lime-400 text-[10px] font-semibold text-black">
                {wishlistItems.length}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative text-zinc-200 hover:text-lime-300"
            onClick={openCompare}
            aria-label="Open compare"
          >
            <Scale className="h-5 w-5" />
            {compareItems.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-lime-400 text-[10px] font-semibold text-black">
                {compareItems.length}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-200 hover:text-lime-300"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative text-zinc-200 hover:text-lime-300"
            onClick={openCart}
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-lime-400 text-[10px] font-semibold text-black">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
