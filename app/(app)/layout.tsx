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
          colorBackground: "#050505",
          colorText: "#ffffff",
          colorTextSecondary: "#d4d4d8",
          colorInputBackground: "#0b0b0b",
          colorInputText: "#ffffff",
          colorTextOnPrimaryBackground: "#050505",
        },
        elements: {
          card: "bg-zinc-950 text-white border border-zinc-800 shadow-[0_30px_60px_rgba(0,0,0,0.45)]",
          modalBackdrop: "bg-black/60 backdrop-blur-sm",
          modalContent: "bg-zinc-950 text-white border border-zinc-800",
          headerTitle: "text-white",
          headerSubtitle: "text-zinc-400",
          socialButtonsBlockButton:
            "border-zinc-800 bg-zinc-950 text-white hover:bg-zinc-900",
          socialButtonsBlockButtonText: "text-white",
          socialButtonsBlockButtonIcon: "text-primary",
          socialButtonsProviderIcon: "text-primary",
          dividerLine: "bg-zinc-800",
          dividerText: "text-zinc-500",
          formFieldLabel: "text-white",
          formButtonPrimary: "bg-primary text-black hover:bg-primary/90",
          formFieldInput:
            "bg-zinc-950 text-white border-zinc-800 placeholder:text-zinc-500 focus:ring-1 focus:ring-primary/40",
          formFieldInputShowPasswordButton: "text-zinc-400 hover:text-white",
          formFieldAction: "text-white underline hover:text-primary",
          footerActionLink: "text-white underline hover:text-primary",
          footerActionText: "text-zinc-400",
          userButtonPopoverCard:
            "bg-zinc-950 border border-primary/40 text-white",
          userButtonPopoverMain: "text-white",
          userButtonPopoverActionButtonLabel: "text-white",
          userButtonPopoverActionButtonDescription: "text-primary/80",
          userButtonPopoverActions: "text-white",
          userButtonPopoverActionButton: "text-white hover:bg-primary/10",
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
