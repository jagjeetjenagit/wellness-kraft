import type { Metadata, Viewport } from "next";
import { Fraunces, Albert_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import { CartProvider } from "@/components/cart/CartProvider";
import { siteUrl } from "@/lib/config";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the site extend into notch/gesture areas; safe-area padding
  // in globals.css keeps content clear of them on phones.
  viewportFit: "cover",
  themeColor: "#FAF7F1",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Veda Wellness — Expert Consultations & Tested Wellness Products",
    template: "%s | Veda Wellness",
  },
  description:
    "Book 1-on-1 consultations with verified health experts and shop medically-tested wellness products. Nutrition, Ayurveda, skin, sleep and more.",
  openGraph: {
    type: "website",
    siteName: "Veda Wellness",
    title: "Veda Wellness — Expert Consultations & Tested Wellness Products",
    description:
      "Book 1-on-1 consultations with verified health experts and shop medically-tested wellness products.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const inner = (
    <html lang="en" className={`${fraunces.variable} ${albertSans.variable}`}>
      <body>
        <CartProvider>
          <Header />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );

  // Only wrap with Clerk once its keys exist — the site never
  // shows a blank screen because a key is missing.
  return clerkEnabled ? <ClerkProvider>{inner}</ClerkProvider> : inner;
}
