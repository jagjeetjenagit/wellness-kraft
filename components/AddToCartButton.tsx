"use client";

import { useState } from "react";
import { useCart } from "./cart/CartProvider";
import type { ProductT } from "@/lib/types";

export default function AddToCartButton({
  product,
  compact = false,
}: {
  product: ProductT;
  compact?: boolean;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const out = product.stock <= 0;

  const handleAdd = () => {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] || "",
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  if (compact) {
    return (
      <button
        onClick={handleAdd}
        disabled={out}
        className="btn-secondary !px-4 !py-2 text-xs"
        aria-label={`Add ${product.name} to cart`}
      >
        {out ? "Sold out" : added ? "Added ✓" : "Add to cart"}
      </button>
    );
  }

  return (
    <button onClick={handleAdd} disabled={out} className="btn-primary w-full sm:w-auto sm:min-w-[220px]">
      {out ? "Out of stock" : added ? "Added to cart ✓" : "Add to cart"}
    </button>
  );
}
