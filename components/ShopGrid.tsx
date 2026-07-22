"use client";

import { useMemo, useState } from "react";
import type { ProductT } from "@/lib/types";
import ProductCard from "./ProductCard";

export default function ShopGrid({ products }: { products: ProductT[] }) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const filtered = products.filter((p) => {
    const matchesCategory = category === "All" || p.category === category;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors sm:py-1.5 ${
                category === c
                  ? "border-olive bg-olive text-white"
                  : "border-sage/30 bg-white text-sage hover:border-olive hover:text-olive"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="input sm:max-w-xs"
          aria-label="Search products"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card mt-8 p-12 text-center text-sage">
          Nothing matches that search. Try another category.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
