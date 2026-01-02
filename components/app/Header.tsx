"use client";

// import Link from "next/link";
// import { Package, ShoppingBag, Sparkles, User } from "lucide-react";
// import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
// import { Button } from "@/components/ui/button";
// import { useCartActions, useTotalItems } from "@/lib/store/cart-store-provider";
// import { useChatActions, useIsChatOpen } from "@/lib/store/chat-store-provider";

// export function Header() {
//   const { openCart } = useCartActions();
//   const { openChat } = useChatActions();
//   const isChatOpen = useIsChatOpen();
//   const totalItems = useTotalItems();

//   return (
//     <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
//       <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
//         {/* Logo */}
//         <Link href="/" className="flex items-center gap-2">
//           <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
//             The Furniture Store
//           </span>
//         </Link>

//         {/* Actions */}
//         <div className="flex items-center gap-2">
//           {/* My Orders - Only when signed in */}
//           <SignedIn>
//             <Button asChild>
//               <Link href="/orders" className="flex items-center gap-2">
//                 <Package className="h-5 w-5" />
//                 <span className="text-sm font-medium">My Orders</span>
//               </Link>
//             </Button>
//           </SignedIn>

//           {/* AI Shopping Assistant */}
//           {!isChatOpen && (
//             <Button
//               onClick={openChat}
//               className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200/50 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-300/50 dark:shadow-amber-900/30 dark:hover:shadow-amber-800/40"
//             >
//               <Sparkles className="h-4 w-4" />
//               <span className="text-sm font-medium">Ask AI</span>
//             </Button>
//           )}

//           {/* Cart Button */}
//           <Button
//             variant="ghost"
//             size="icon"
//             className="relative"
//             onClick={openCart}
//           >
//             <ShoppingBag className="h-5 w-5" />
//             {totalItems > 0 && (
//               <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
//                 {totalItems > 99 ? "99+" : totalItems}
//               </span>
//             )}
//             <span className="sr-only">Open cart ({totalItems} items)</span>
//           </Button>

//           {/* User */}
//           <SignedIn>
//             <UserButton
//               afterSwitchSessionUrl="/"
//               appearance={{
//                 elements: {
//                   avatarBox: "h-9 w-9",
//                 },
//               }}
//             >
//               <UserButton.MenuItems>
//                 <UserButton.Link
//                   label="My Orders"
//                   labelIcon={<Package className="h-4 w-4" />}
//                   href="/orders"
//                 />
//               </UserButton.MenuItems>
//             </UserButton>
//           </SignedIn>
//           <SignedOut>
//             <SignInButton mode="modal">
//               <Button variant="ghost" size="icon">
//                 <User className="h-5 w-5" />
//                 <span className="sr-only">Sign in</span>
//               </Button>
//             </SignInButton>
//           </SignedOut>
//         </div>
//       </div>
//     </header>
//   );
// }

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { User, ShoppingBag, Menu } from "lucide-react";

const navItems = [
  { label: "SUPPLEMENTS", slug: "supplements" },
  { label: "ACTIVEWEAR", slug: "activewear" },
  { label: "EQUIPMENT", slug: "equipment" },
  { label: "ACCESSORIES", slug: "gym-accessories" },
  { label: "COMBAT GEAR", slug: "combat-gear" },
  { label: "RECOVERY", slug: "recovery-wellness" },
  { label: "PASSES", slug: "memberships-passes" },
];

export function Header() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "";

  return (
    <header className="w-full border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* LEFT */}
        <div className="flex items-center gap-6">
          {/* Mobile hamburger */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-zinc-900 hover:bg-zinc-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => {
              const isActive = activeCategory === item.slug;

              return (
                <Link
                  key={item.slug}
                  href={`/?category=${item.slug}`}
                  className={`relative text-sm font-medium tracking-wide text-zinc-900 transition-colors ${
                    isActive ? "" : "hover:text-zinc-600"
                  }`}
                >
                  {item.label}

                  {/* underline like screenshot */}
                  {isActive && (
                    <span className="absolute -bottom-[22px] left-0 h-[2px] w-full bg-zinc-900" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* CENTER LOGO */}
        <div className="flex flex-1 justify-center">
          <Link href="/" className="text-xl font-extrabold text-zinc-900">
            GOLD'S GYM SHOP
          </Link>
        </div>

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-5">
          <button
            type="button"
            className="rounded-md p-2 text-zinc-900 hover:bg-zinc-100"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="rounded-md p-2 text-zinc-900 hover:bg-zinc-100"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
