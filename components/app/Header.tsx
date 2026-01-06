"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  Calendar,
  Heart,
  Menu,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  User,
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCartActions, useTotalItems } from "@/lib/store/cart-store-provider";
import {
  useWishlistActions,
  useWishlistItems,
} from "@/lib/store/wishlist-store-provider";
import { useChatActions, useIsChatOpen } from "@/lib/store/chat-store-provider";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Packages", href: "/packages" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const megaMenuColumns = [
  {
    title: "Equipments",
    slug: "equipment",
    items: [
      { label: "Weight Bench", slug: "weight-bench" },
      { label: "Resistance Bands", slug: "resistance-bands" },
      { label: "Lifting Belts", slug: "lifting-belts" },
      { label: "Lifting Straps", slug: "lifting-straps" },
      { label: "Gym Gloves", slug: "gym-gloves" },
      { label: "Training Mats", slug: "training-mats" },
      { label: "Foam Rollers", slug: "foam-rollers" },
    ],
  },
  {
    title: "Supplements",
    slug: "supplements",
    items: [
      { label: "Creatine", slug: "creatine" },
      { label: "Pre-Workout", slug: "pre-workout" },
      { label: "Fat Burner", slug: "fat-burner" },
      { label: "Mass Gainer", slug: "mass-gainer" },
      { label: "Protein", slug: "protein" },
      { label: "BCAA & Aminos", slug: "bcaa-aminos" },
      { label: "Women's Collection", slug: "womens-collection" },
      { label: "Recovery", slug: "recovery" },
      { label: "Stress & Sleep Aid", slug: "stress-sleep-aid" },
      { label: "Joint Support", slug: "joint-support" },
    ],
  },
  {
    title: "Clothing",
    slug: "clothing",
    items: [
      { label: "T-Shirts", slug: "t-shirts" },
      { label: "Tank Tops", slug: "tank-tops" },
      { label: "Track Pants", slug: "track-pants" },
      { label: "Shorts", slug: "shorts" },
      { label: "Leggings", slug: "leggings" },
      { label: "Sports Bras", slug: "sports-bras" },
      { label: "Hoodies & Jackets", slug: "hoodies-jackets" },
    ],
  },
  {
    title: "Accessories",
    slug: "accessories",
    items: [
      { label: "Bottles", slug: "bottles" },
      { label: "Bags", slug: "bags" },
      { label: "Jump Ropes", slug: "jump-ropes" },
      { label: "Socks", slug: "socks" },
    ],
  },
  {
    title: "Shoes",
    slug: "shoes",
    items: [
      { label: "Training Shoes", slug: "training-shoes" },
      { label: "Running Shoes", slug: "running-shoes" },
      { label: "Basketball Shoes", slug: "basketball-shoes" },
      { label: "Lifestyle Shoes", slug: "lifestyle-shoes" },
      { label: "Soccer Boots", slug: "soccer-shoes" },
      { label: "Trail Running Shoes", slug: "trail-running-shoes" },
    ],
  },
];

export function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const totalItems = useTotalItems();
  const wishlistItems = useWishlistItems();
  const { openCart } = useCartActions();
  const { openWishlist } = useWishlistActions();
  const { openChat } = useChatActions();
  const isChatOpen = useIsChatOpen();

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
      <div className="border-b border-zinc-900 bg-zinc-950 text-xs text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <a
              href="tel:+8801704112385"
              className="text-white transition hover:text-primary"
            >
              Call Us: +880 1704 112385
            </a>
            <a
              href="mailto:info@goldsgym.com.bd"
              className="hidden text-white transition hover:text-primary md:inline"
            >
              info@goldsgym.com.bd
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-white md:inline">
              Free shipping on orders over ৳2,500
            </span>
            <span className="rounded-full border border-primary/40 px-2 py-0.5 text-[11px] text-primary">
              BDT
            </span>
            {!isChatOpen && (
              <>
                <SignedIn>
                  <Button
                    onClick={openChat}
                    className="h-7 gap-1 rounded-full bg-primary px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-primary/90"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span className="hidden sm:inline">Ask AI</span>
                    <span className="sm:hidden">AI</span>
                  </Button>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button
                      className="h-7 gap-1 rounded-full border border-primary/40 bg-transparent px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary transition hover:border-primary hover:bg-primary/90 hover:text-black"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span className="hidden sm:inline">Sign in to chat</span>
                      <span className="sm:hidden">Chat</span>
                    </Button>
                  </SignInButton>
                </SignedOut>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-4">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="rounded-md border border-zinc-800 p-2 text-zinc-200 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="border-zinc-800 bg-zinc-950 px-4 pb-6 pt-6 text-zinc-200"
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/Gold's_Gym_logo.png"
                  alt="Gold's Gym BD"
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full"
                />
                <span className="font-heading text-2xl uppercase tracking-[0.3em] text-white">
                  SHOP
                </span>
              </div>

              <form
                onSubmit={(event) => {
                  handleSearch(event);
                  setIsMenuOpen(false);
                }}
                className="mt-6 flex items-center gap-2 rounded-full border border-zinc-800 bg-black px-3 py-2"
              >
                <Search className="h-4 w-4 text-zinc-400" />
                <input
                  name="q"
                  defaultValue={searchParams.get("q") ?? ""}
                  placeholder="Search"
                  className="w-full bg-transparent text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
                />
              </form>

              <nav className="mt-6 space-y-2">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.label}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:border-primary/60 hover:text-primary"
                    >
                      {item.label}
                      {item.label === "Shop" && (
                        <ChevronDown className="h-4 w-4 text-primary" />
                      )}
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              <div className="mt-6 space-y-3">
                <p className="text-[11px] uppercase tracking-[0.3em] text-primary">
                  Shop Categories
                </p>
                {megaMenuColumns.map((column) => (
                  <details
                    key={column.slug}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2"
                  >
                    <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-white">
                      {column.title}
                    </summary>
                    <div className="mt-3 space-y-2 text-xs text-zinc-400">
                      <SheetClose asChild>
                        <Link
                          href={`/shop?category=${column.slug}`}
                          className="block text-primary"
                        >
                          View all {column.title}
                        </Link>
                      </SheetClose>
                      {column.items.map((item) => (
                        <SheetClose asChild key={item.slug}>
                          <Link
                            href={`/shop?category=${item.slug}`}
                            className="block text-zinc-300 hover:text-primary"
                          >
                            {item.label}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  </details>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-zinc-800 bg-black/60 p-4 text-xs text-zinc-400">
                <p className="font-semibold text-white">
                  Gold's Gym BD Shop
                </p>
                <p className="mt-2">+880 1704 112385</p>
                <p>info@goldsgym.com.bd</p>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/Gold's_Gym_logo.png"
              alt="Gold's Gym BD"
              width={44}
              height={44}
              className="h-11 w-11 rounded-full"
              priority
            />
            <span className="font-heading text-2xl uppercase leading-none tracking-[0.3em] text-white sm:text-3xl lg:text-4xl">
              SHOP
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <div key={item.label} className="group relative">
              <Link
                href={item.href}
                className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:text-primary"
              >
                {item.label}
                {item.label === "Shop" && (
                  <ChevronDown className="h-4 w-4 text-primary" />
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
                            className="block text-sm font-semibold uppercase text-primary"
                          >
                            {column.title}
                          </Link>
                          {column.items.length > 0 && (
                            <ul className="space-y-2 text-xs text-zinc-400">
                              {column.items.map((item) => (
                                <li key={item.slug}>
                                  <Link
                                    href={`/shop?category=${item.slug}`}
                                    className="transition hover:text-primary"
                                  >
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
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
            className="relative text-zinc-200 hover:bg-primary hover:text-black"
            onClick={openWishlist}
            aria-label="Open wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlistItems.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-black">
                {wishlistItems.length}
              </span>
            )}
          </Button>

          <SignedIn>
            <UserButton
              afterSwitchSessionUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9",
                  userButtonPopoverCard:
                    "bg-zinc-950 border border-primary/40 text-white",
                  userButtonPopoverMain: "text-white",
                  userButtonPopoverActionButton:
                    "text-white hover:bg-primary/10",
                  userButtonPopoverActionButtonText: "text-white",
                  userButtonPopoverActionButtonIcon: "text-primary",
                  userButtonPopoverActionButtonLabel: "text-white",
                  userButtonPopoverActionButtonDescription: "text-primary/80",
                  userButtonPopoverFooter:
                    "border-t border-primary/30 bg-zinc-950 text-white",
                  userButtonPopoverFooterAction: "text-primary",
                  userButtonPopoverFooterActionText: "text-primary",
                  userButtonPopoverCustomItemButton:
                    "text-white hover:bg-primary/10",
                  userButtonPopoverCustomItemButtonIconBox: "text-primary",
                  userButtonPopoverActionItemButtonIcon: "text-primary",
                },
              }}
            >
              <UserButton.MenuItems>
                <UserButton.Link
                  label="My Orders"
                  labelIcon={<Package className="h-4 w-4" />}
                  href="/orders"
                />
                <UserButton.Link
                  label="My Subscriptions"
                  labelIcon={<Calendar className="h-4 w-4" />}
                  href="/my-subscription"
                />
              </UserButton.MenuItems>
            </UserButton>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-200 hover:bg-primary hover:text-black"
              >
                <User className="h-5 w-5" />
                <span className="sr-only">Sign in</span>
              </Button>
            </SignInButton>
          </SignedOut>

          <Button
            variant="ghost"
            size="icon"
            className="relative text-zinc-200 hover:bg-primary hover:text-black"
            onClick={openCart}
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-black">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
