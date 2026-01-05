import { Suspense } from "react";
import { CartStoreProvider } from "@/lib/store/cart-store-provider";
import { ChatStoreProvider } from "@/lib/store/chat-store-provider";
import { WishlistStoreProvider } from "@/lib/store/wishlist-store-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { SanityLive } from "@/sanity/lib/live";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/app/Header";
import { CartSheet } from "@/components/app/CartSheet";
import { ChatSheet } from "@/components/app/ChatSheet";
import { WishlistSheet } from "@/components/app/WishlistSheet";
import { AppShell } from "@/components/app/AppShell";
import { Footer } from "@/components/app/Footer";
import { FacebookPixel } from "@/components/app/FacebookPixel";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#FDE915",
          colorBackground: "#ffffff",
          colorText: "#111111",
          colorTextSecondary: "#4b5563",
          colorInputBackground: "#ffffff",
          colorInputText: "#111111",
          colorTextOnPrimaryBackground: "#111111",
        },
        elements: {
          card: "bg-white text-black border border-zinc-200 shadow-[0_30px_60px_rgba(0,0,0,0.35)]",
          modalBackdrop: "bg-black/60 backdrop-blur-sm",
          modalContent: "bg-white text-black border border-zinc-200",
          headerTitle: "text-black",
          headerSubtitle: "text-black/70",
          socialButtonsBlockButton:
            "border-zinc-200 text-black hover:bg-zinc-100",
          socialButtonsBlockButtonText: "text-black",
          socialButtonsBlockButtonIcon: "text-black",
          socialButtonsProviderIcon: "text-black",
          dividerLine: "bg-zinc-200",
          dividerText: "text-black/60",
          formFieldLabel: "text-black/80",
          formButtonPrimary: "bg-primary text-black hover:bg-primary/90",
          formFieldInput:
            "bg-white text-black border-zinc-200 placeholder:text-zinc-500 focus:ring-1 focus:ring-primary/40",
          formFieldInputShowPasswordButton: "text-black/60 hover:text-black",
          formFieldAction: "text-black underline hover:text-black/80",
          footerActionLink: "text-black underline hover:text-black/80",
          footerActionText: "text-black/70",
          userButtonPopoverCard:
            "bg-zinc-950 border border-primary/40 text-white",
          userButtonPopoverMain: "text-white",
          userButtonPopoverActionButtonLabel: "text-white",
          userButtonPopoverActionButtonDescription: "text-primary/80",
          userButtonPopoverActions: "text-white",
          userButtonPopoverActionButton:
            "text-white hover:bg-primary/10",
          userButtonPopoverActionButtonText: "text-white",
          userButtonPopoverActionButtonIcon: "text-primary",
          userButtonPopoverFooter:
            "border-t border-primary/30 bg-zinc-950 text-white",
          userButtonPopoverFooterAction: "text-primary",
          userButtonPopoverFooterActionText: "text-primary",
          userButtonPopoverCustomItemButton: "text-white hover:bg-primary/10",
          userButtonPopoverCustomItemButtonIconBox: "text-primary",
          userButtonPopoverActionItemButtonIcon: "text-primary",
        },
      }}
    >
      <CartStoreProvider>
        <WishlistStoreProvider>
          <ChatStoreProvider>
            <AppShell>
              <Suspense fallback={null}>
                <FacebookPixel />
              </Suspense>
              <Suspense fallback={null}>
                <Header />
              </Suspense>
              <main>{children}</main>
              <Footer />
            </AppShell>
            <CartSheet />
            <WishlistSheet />
            <ChatSheet />
            <Toaster position="bottom-center" />
            <SanityLive />
          </ChatStoreProvider>
        </WishlistStoreProvider>
      </CartStoreProvider>
    </ClerkProvider>
  );
}

export default AppLayout;
