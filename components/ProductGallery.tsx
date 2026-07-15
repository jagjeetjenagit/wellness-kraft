"use client";

import { useState } from "react";
import { ProductImage } from "./Placeholder";

export default function ProductGallery({
  name,
  images,
}: {
  name: string;
  images: string[];
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="card overflow-hidden">
        <ProductImage
          name={name}
          image={images[active]}
          className="aspect-square w-full"
          large
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                i === active ? "border-pine" : "border-sand hover:border-pine/50"
              }`}
              aria-label={`View image ${i + 1} of ${name}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
