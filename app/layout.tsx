import type { Metadata } from "next";
import { Bai_Jamjuree, Zen_Dots } from "next/font/google";
import "./globals.css";

const zenDots = Zen_Dots({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
});

const baiJamjuree = Bai_Jamjuree({
  weight: ["200", "300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Fitfinity Storefront",
  description: "Fitfinity-inspired ecommerce storefront",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${zenDots.variable} ${baiJamjuree.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
