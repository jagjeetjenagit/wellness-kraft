"use client";

import { useCart } from "./cart/CartProvider";

// "Add to cart" that turns into a − / qty / + stepper once the item is in the
// cart, so customers can order multiples without leaving the page. Accepts a
// full product (with images[]) or a minimal shape (with a single image).
export default function CartControl({
  product,
  full = false,
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    stock: number;
    image?: string;
    images?: string[];
  };
  full?: boolean;
}) {
  const { items, addItem, updateQuantity, ready } = useCart();
  const out = product.stock <= 0;
  const image = product.image ?? product.images?.[0] ?? "";

  if (out) {
    return full ? (
      <button disabled className="btn-primary w-full opacity-60 sm:w-auto sm:min-w-[220px]">
        Out of stock
      </button>
    ) : (
      <span className="text-xs font-semibold text-alert">Sold out</span>
    );
  }

  if (!ready) return <span className="inline-block h-8 w-24" aria-hidden="true" />;

  const inCart = items.find((i) => i.id === product.id);

  if (!inCart) {
    return (
      <button
        type="button"
        onClick={() =>
          addItem({
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image,
            stock: product.stock,
          })
        }
        className={
          full ? "btn-primary w-full sm:w-auto sm:min-w-[220px]" : "btn-secondary !px-4 !py-1.5 text-xs"
        }
      >
        Add to cart
      </button>
    );
  }

  const btn = full ? "h-11 w-11 text-2xl" : "h-9 w-9 text-xl";
  const qty = full ? "min-w-[2.5rem] text-base" : "min-w-[2rem] text-sm";

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-xl border border-sage/40 bg-white ${
        full ? "px-2 py-1.5" : "px-1.5 py-1"
      }`}
    >
      <button
        type="button"
        onClick={() => updateQuantity(product.id, inCart.quantity - 1)}
        className={`flex items-center justify-center rounded leading-none text-olive hover:bg-soft-cream ${btn}`}
        aria-label={`Remove one ${product.name}`}
      >
        −
      </button>
      <span className={`text-center font-semibold tabular-nums ${qty}`}>{inCart.quantity}</span>
      <button
        type="button"
        onClick={() => updateQuantity(product.id, inCart.quantity + 1)}
        disabled={inCart.quantity >= (product.stock || 99)}
        className={`flex items-center justify-center rounded leading-none text-olive hover:bg-soft-cream disabled:opacity-40 ${btn}`}
        aria-label={`Add one more ${product.name}`}
      >
        +
      </button>
      {full && (
        <span className="ml-2 text-sm font-semibold text-success">In cart ✓</span>
      )}
    </div>
  );
}
