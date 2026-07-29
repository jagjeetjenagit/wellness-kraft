import { getPrisma } from "./prisma";
import { SAMPLE_EXPERTS, SAMPLE_PRODUCTS, SAMPLE_RECOMMENDATIONS } from "./sample-data";
import type { ExpertT, ProductT } from "./types";

// All page data flows through here. If the database isn't connected
// (or a query fails), we quietly fall back to the built-in sample
// data so visitors never see a blank or broken page.

const demoExperts: ExpertT[] = SAMPLE_EXPERTS.map((e) => ({
  ...e,
  id: e.slug,
  active: true,
}));

const demoProducts: ProductT[] = SAMPLE_PRODUCTS.map((p) => ({
  ...p,
  id: p.slug,
  active: true,
}));

export function isDemoMode(): boolean {
  return !process.env.DATABASE_URL;
}

export async function getExperts(): Promise<ExpertT[]> {
  const prisma = getPrisma();
  if (!prisma) return demoExperts;
  try {
    const rows = await prisma.expert.findMany({
      where: { active: true },
      orderBy: [{ featured: "desc" }, { rating: "desc" }],
    });
    return rows;
  } catch {
    return demoExperts;
  }
}

export async function getExpert(idOrSlug: string): Promise<ExpertT | null> {
  const prisma = getPrisma();
  if (!prisma) {
    return demoExperts.find((e) => e.id === idOrSlug || e.slug === idOrSlug) || null;
  }
  try {
    return await prisma.expert.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }], active: true },
    });
  } catch {
    // DB connected but unreachable/unmigrated: fall back to demo data so
    // the detail page stays consistent with the (also-falling-back) list
    // instead of 404-ing. A genuine "not found" returns null above.
    return demoExperts.find((e) => e.id === idOrSlug || e.slug === idOrSlug) || null;
  }
}

export async function getExpertProducts(expert: ExpertT): Promise<ProductT[]> {
  const prisma = getPrisma();
  if (!prisma) {
    const slugs = SAMPLE_RECOMMENDATIONS[expert.slug] || [];
    return demoProducts.filter((p) => slugs.includes(p.slug));
  }
  try {
    const rows = await prisma.product.findMany({
      where: { active: true, experts: { some: { id: expert.id } } },
    });
    return rows;
  } catch {
    // Keep the "recommended products" strip in sync with the demo
    // fallback used by getExpert when the DB is unreachable.
    const slugs = SAMPLE_RECOMMENDATIONS[expert.slug] || [];
    return demoProducts.filter((p) => slugs.includes(p.slug));
  }
}

export async function getProducts(): Promise<ProductT[]> {
  const prisma = getPrisma();
  if (!prisma) return demoProducts;
  try {
    return await prisma.product.findMany({
      where: { active: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
  } catch {
    return demoProducts;
  }
}

export async function getProduct(idOrSlug: string): Promise<ProductT | null> {
  const prisma = getPrisma();
  if (!prisma) {
    return demoProducts.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
  }
  try {
    return await prisma.product.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }], active: true },
    });
  } catch {
    // Same graceful fallback as getExpert: don't 404 the detail page when
    // the DB is unreachable/unmigrated; the shop list falls back too.
    return demoProducts.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
  }
}

export async function getFeaturedExperts(limit = 3): Promise<ExpertT[]> {
  const all = await getExperts();
  const featured = all.filter((e) => e.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

export async function getFeaturedProducts(limit = 4): Promise<ProductT[]> {
  const all = await getProducts();
  const featured = all.filter((p) => p.featured);
  return (featured.length ? featured : all).slice(0, limit);
}
