import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/data";
import { formatINR } from "@/lib/utils";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButton from "@/components/AddToCartButton";
import DemoBanner from "@/components/DemoBanner";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.id);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 155),
    openGraph: {
      title: `${product.name} | Wellness Kraft`,
      description: product.description.slice(0, 155),
      images: product.images[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const low = product.stock > 0 && product.stock <= 5;
  const out = product.stock <= 0;

  return (
    <>
      <DemoBanner />
      <div className="container-x py-12 sm:py-16">
        <Link href="/shop" className="text-sm font-semibold text-olive hover:underline">
          ← Back to shop
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <ProductGallery name={product.name} images={product.images} />

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-sage/70">
              {product.category} · SKU {product.sku}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-charcoal sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-3xl font-bold text-charcoal">{formatINR(product.price)}</span>
              {out ? (
                <span className="badge bg-charcoal/80 text-white">Out of stock</span>
              ) : low ? (
                <span className="badge bg-alert/10 text-alert">Only {product.stock} left</span>
              ) : (
                <span className="badge bg-soft-cream text-olive">In stock</span>
              )}
            </div>

            {product.consultRecommended && (
              <div className="mt-6 rounded-2xl border border-olive/25 bg-soft-cream p-4">
                <p className="text-sm font-semibold text-olive">
                  💬 We recommend a consultation with this product
                </p>
                <p className="mt-1 text-sm text-charcoal/75">
                  Dosage and suitability vary from person to person. A short
                  consultation makes sure this is right for you.{" "}
                  <Link href="/experts" className="font-semibold text-olive hover:underline">
                    Book an expert →
                  </Link>
                </p>
              </div>
            )}

            <div className="mt-6 whitespace-pre-line leading-relaxed text-charcoal/75">
              {product.description}
            </div>

            <div className="mt-8">
              <AddToCartButton product={product} />
            </div>

            <ul className="mt-8 space-y-2 border-t border-sage/30 pt-6 text-sm text-charcoal/75">
              <li>✓ Batch-tested for purity and heavy metals</li>
              <li>✓ Secure checkout — UPI, cards, netbanking</li>
              <li>✓ Ships across India in 3–7 working days</li>
            </ul>

            <p className="mt-8 text-xs leading-relaxed text-sage/70">
              This product supports general wellness and is not intended to
              diagnose, treat, cure or prevent any disease. Consult a qualified
              professional before use if you are pregnant, nursing, or on
              medication.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
