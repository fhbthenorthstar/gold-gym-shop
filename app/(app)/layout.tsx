import { Suspense } from "react";
import { CartStoreProvider } from "@/lib/store/cart-store-provider";
import { ChatStoreProvider } from "@/lib/store/chat-store-provider";
import { WishlistStoreProvider } from "@/lib/store/wishlist-store-provider";
import { CompareStoreProvider } from "@/lib/store/compare-store-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { SanityLive } from "@/sanity/lib/live";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/app/Header";
import { CartSheet } from "@/components/app/CartSheet";
import { ChatSheet } from "@/components/app/ChatSheet";
import { WishlistSheet } from "@/components/app/WishlistSheet";
import { CompareSheet } from "@/components/app/CompareSheet";
import { AppShell } from "@/components/app/AppShell";
import { Footer } from "@/components/app/Footer";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#FDE915",
          colorBackground: "#050505",
          colorText: "#f4f4f5",
          colorTextSecondary: "#a1a1aa",
          colorInputBackground: "#0b0b0b",
          colorInputText: "#f4f4f5",
          colorTextOnPrimaryBackground: "#0b0b0b",
        },
        elements: {
          card: "bg-zinc-950 border border-zinc-800",
          headerTitle: "text-white",
          headerSubtitle: "text-zinc-400",
          socialButtonsBlockButton:
            "border-zinc-800 text-zinc-200 hover:bg-zinc-900",
          formButtonPrimary: "bg-primary text-black hover:bg-primary/90",
          formFieldInput: "bg-black text-white border-zinc-800",
          footerActionLink: "text-primary hover:text-primary/90",
          userButtonPopoverCard: "bg-zinc-950 border border-zinc-800",
          userButtonPopoverActionButton:
            "text-zinc-200 hover:bg-zinc-900",
          userButtonPopoverActionButtonText: "text-zinc-200",
          userButtonPopoverActionButtonIcon: "text-primary",
          userButtonPopoverFooter: "border-t border-zinc-800 bg-zinc-950",
        },
      }}
    >
      <CartStoreProvider>
        <WishlistStoreProvider>
          <CompareStoreProvider>
            <ChatStoreProvider>
              <AppShell>
                <Suspense fallback={null}>
                  <Header />
                </Suspense>
                <main>{children}</main>
                <Footer />
              </AppShell>
              <CartSheet />
              <WishlistSheet />
              <CompareSheet />
              <ChatSheet />
              <Toaster position="bottom-center" />
              <SanityLive />
            </ChatStoreProvider>
          </CompareStoreProvider>
        </WishlistStoreProvider>
      </CartStoreProvider>
    </ClerkProvider>
  );
}

export default AppLayout;
