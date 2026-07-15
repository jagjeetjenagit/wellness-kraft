"use client";

import { useMemo, useState } from "react";
import type { ExpertT } from "@/lib/types";
import ExpertCard from "./ExpertCard";

export default function ExpertsGrid({ experts }: { experts: ExpertT[] }) {
  const [specialty, setSpecialty] = useState("All");
  const [query, setQuery] = useState("");

  const specialties = useMemo(
    () => ["All", ...Array.from(new Set(experts.map((e) => e.specialty)))],
    [experts]
  );

  const filtered = experts.filter((e) => {
    const matchesSpecialty = specialty === "All" || e.specialty === specialty;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.specialty.toLowerCase().includes(q) ||
      e.bio.toLowerCase().includes(q);
    return matchesSpecialty && matchesQuery;
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by specialty">
          {specialties.map((s) => (
            <button
              key={s}
              onClick={() => setSpecialty(s)}
              className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors sm:py-1.5 ${
                specialty === s
                  ? "border-pine bg-pine text-white"
                  : "border-sand bg-white text-ink-soft hover:border-pine hover:text-pine"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search experts…"
          className="input sm:max-w-xs"
          aria-label="Search experts"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card mt-8 p-12 text-center text-ink-soft">
          No experts match that search. Try a different specialty.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <ExpertCard key={e.id} expert={e} />
          ))}
        </div>
      )}
    </div>
  );
}
