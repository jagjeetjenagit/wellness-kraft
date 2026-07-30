"use client";

import { useCart } from "./cart/CartProvider";

// "Add to cart" that turns into a − / qty / + stepper once the item is in the
// cart, so customers can order multiples without leaving the page.
export default function CartControl({
  product,
}: {
  product: { id: string; slug: string; name: string; price: number; image: string; stock: number };
}) {
  const { items, addItem, updateQuantity, ready } = useCart();
  const out = product.stock <= 0;

  if (out) return <span className="text-xs font-semibold text-alert">Sold out</span>;
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
            image: product.image,
            stock: product.stock,
          })
        }
        className="btn-secondary !px-4 !py-1.5 text-xs"
      >
        Add to cart
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-sage/40 bg-white px-1.5 py-1">
      <button
        type="button"
        onClick={() => updateQuantity(product.id, inCart.quantity - 1)}
        className="flex h-6 w-6 items-center justify-center rounded text-lg leading-none text-olive hover:bg-soft-cream"
        aria-label={`Remove one ${product.name}`}
      >
        −
      </button>
      <span className="min-w-[1.75rem] text-center text-sm font-semibold tabular-nums">
        {inCart.quantity}
      </span>
      <button
        type="button"
        onClick={() => updateQuantity(product.id, inCart.quantity + 1)}
        disabled={inCart.quantity >= (product.stock || 99)}
        className="flex h-6 w-6 items-center justify-center rounded text-lg leading-none text-olive hover:bg-soft-cream disabled:opacity-40"
        aria-label={`Add one more ${product.name}`}
      >
        +
      </button>
    </div>
  );
}
