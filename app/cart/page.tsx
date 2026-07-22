"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { formatINR } from "@/lib/utils";
import { ProductImage } from "@/components/Placeholder";

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, ready } = useCart();

  if (!ready) {
    return <div className="container-x py-24 text-center text-sage">Loading your cart…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container-x flex min-h-[50vh] flex-col items-center justify-center py-24 text-center">
        <p className="eyebrow">Your cart</p>
        <h1 className="section-title mt-3">Your cart is empty</h1>
        <p className="mt-3 max-w-md text-sage">
          Browse our tested wellness range, or book a consultation and let an
          expert recommend exactly what you need.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn-primary">Browse the shop</Link>
          <Link href="/experts" className="btn-secondary">Book a consultation</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-12 sm:py-16">
      <p className="eyebrow">Your cart</p>
      <h1 className="section-title mt-2">
        {items.length} {items.length === 1 ? "item" : "items"}
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,360px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card flex gap-4 p-4">
              <Link href={`/product/${item.slug}`} className="flex-shrink-0">
                <ProductImage
                  name={item.name}
                  image={item.image}
                  className="h-20 w-20 rounded-xl sm:h-24 sm:w-24"
                />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-display text-xl font-semibold text-charcoal hover:text-olive"
                  >
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="-m-2 p-2 text-sm font-semibold text-sage/70 hover:text-alert sm:m-0 sm:p-0"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-sage/30">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-4 py-2.5 text-lg font-semibold text-sage hover:text-olive sm:px-3 sm:py-1.5"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      −
                    </button>
                    <span className="min-w-[32px] text-center text-sm font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-4 py-2.5 text-lg font-semibold text-sage hover:text-olive sm:px-3 sm:py-1.5"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold text-charcoal">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="card h-fit p-6">
          <h2 className="font-display text-2xl font-semibold">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-sage">Subtotal</dt>
              <dd className="font-semibold">{formatINR(total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sage">Delivery</dt>
              <dd className="font-semibold text-olive">Free</dd>
            </div>
            <div className="flex justify-between border-t border-sage/30 pt-3 text-base">
              <dt className="font-bold">Total</dt>
              <dd className="font-bold">{formatINR(total)}</dd>
            </div>
          </dl>
          <Link href="/checkout" className="btn-primary mt-6 w-full">
            Proceed to checkout
          </Link>
          <p className="mt-3 text-center text-xs text-sage/70">
            Secure payment via Razorpay — UPI, cards, netbanking
          </p>
        </aside>
      </div>
    </div>
  );
}
