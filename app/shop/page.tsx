import type { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@/lib/data";
import ShopGrid from "@/components/ShopGrid";
import DemoBanner from "@/components/DemoBanner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Wellness Products",
  description:
    "Medically-tested supplements, Ayurvedic formulations, skincare and teas. Batch-tested for purity, honestly labelled, delivered across India.",
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <>
      <DemoBanner />
      <div className="container-x py-12 sm:py-16">
        <p className="eyebrow">The store</p>
        <h1 className="section-title mt-2">Wellness products, tested properly</h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Our own range — every batch tested for purity and labelled honestly.
          Products marked <span className="badge bg-pine text-white">Consult recommended</span>{" "}
          work best with expert guidance;{" "}
          <Link href="/experts" className="font-semibold text-pine hover:underline">
            book a consultation
          </Link>{" "}
          if you&apos;re unsure.
        </p>
        <div className="mt-10">
          <ShopGrid products={products} />
        </div>
      </div>
    </>
  );
}
