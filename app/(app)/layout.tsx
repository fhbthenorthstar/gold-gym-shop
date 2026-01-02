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
    <ClerkProvider>
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
