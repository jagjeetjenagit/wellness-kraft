import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import { CartProvider } from "@/components/cart/CartProvider";
import WhatsAppButton from "@/components/WhatsAppButton";
import { siteUrl } from "@/lib/config";
import { getSiteSettings, keywordList } from "@/lib/settings";

// One clean professional sans for the whole site (Practo-style).
// Serif experiments (Playfair, Cormorant) read decorative next to the
// clinical, trustworthy tone the client wants — the logo image keeps
// its own serif lettering.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the site extend into notch/gesture areas; safe-area padding
  // in globals.css keeps content clear of them on phones.
  viewportFit: "cover",
  themeColor: "#FEFAEF",
};

// Site-wide <head> metadata. Reads the admin-managed SEO settings
// (/admin/seo) and falls back to the built-in defaults when nothing is
// saved or the database is unreachable. Page-specific titles/descriptions
// (product, expert, etc.) still override these per page.
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const keywords = keywordList(s.keywords);
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: s.metaTitle,
      template: "%s | Wellness Kraft",
    },
    description: s.metaDescription,
    keywords: keywords.length ? keywords : undefined,
    openGraph: {
      type: "website",
      siteName: "Wellness Kraft",
      title: s.metaTitle,
      description: s.metaDescription,
      images: s.ogImage ? [s.ogImage] : undefined,
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // SessionProvider exposes the Google login state to client components
  // (the header account menu). It's safe to always mount — when login
  // isn't configured yet the session is simply null and the site works
  // exactly as before.
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <SessionProvider>
          <CartProvider>
            <Header />
            <main className="min-h-[70vh]">{children}</main>
            <Footer />
            <WhatsAppButton />
          </CartProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
