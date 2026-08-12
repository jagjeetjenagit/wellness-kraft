import { cache } from "react";
import { getPrisma } from "@/lib/prisma";

// Site-wide SEO settings, editable from /admin/seo. These are the built-in
// defaults used until the admin saves their own (and whenever the database
// is unreachable) — so the site always ships sensible <head> metadata.
export const SEO_DEFAULTS = {
  metaTitle: "Wellness Kraft — Expert Consultations & Tested Wellness Products",
  metaDescription:
    "Book 1-on-1 consultations with verified health experts and shop medically-tested wellness products. Nutrition, Ayurveda, skin, sleep and more.",
  keywords: "",
  ogImage: "",
};

export interface SiteSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
}

// `cache` dedupes the read within a single request (layout + page can both
// call it). Never throws — a missing DB or row yields the defaults above.
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const prisma = getPrisma();
  if (!prisma) return { ...SEO_DEFAULTS };
  try {
    const row = await prisma.siteSetting.findUnique({ where: { id: 1 } });
    if (!row) return { ...SEO_DEFAULTS };
    return {
      metaTitle: row.metaTitle || SEO_DEFAULTS.metaTitle,
      metaDescription: row.metaDescription || SEO_DEFAULTS.metaDescription,
      keywords: row.keywords || SEO_DEFAULTS.keywords,
      ogImage: row.ogImage || SEO_DEFAULTS.ogImage,
    };
  } catch (e) {
    console.error("getSiteSettings failed, using defaults:", e);
    return { ...SEO_DEFAULTS };
  }
});

// Split the stored comma-separated keywords into a clean array for <meta>.
export function keywordList(keywords: string): string[] {
  return keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}
