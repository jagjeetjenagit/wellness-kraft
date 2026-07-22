import Link from "next/link";
import type { ProductT } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { ProductImage } from "./Placeholder";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ product }: { product: ProductT }) {
  const out = product.stock <= 0;
  return (
    <article className="card group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lift">
      <Link href={`/product/${product.slug}`} className="relative block">
        <ProductImage
          name={product.name}
          image={product.images[0]}
          className="h-48 w-full"
        />
        {product.consultRecommended && (
          <span className="badge absolute left-3 top-3 bg-olive text-white">
            Consult recommended
          </span>
        )}
        {out && (
          <span className="badge absolute right-3 top-3 bg-alert text-white">
            Out of stock
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-sage/70">
          {product.category}
        </p>
        <Link href={`/product/${product.slug}`}>
          <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-charcoal group-hover:text-olive">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-lg font-bold text-charcoal">{formatINR(product.price)}</span>
          <AddToCartButton product={product} compact />
        </div>
      </div>
    </article>
  );
}
