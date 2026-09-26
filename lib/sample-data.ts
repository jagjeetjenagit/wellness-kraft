// Sample experts and products.
// Used two ways:
//  1. `npm run db:seed` loads them into your Neon database.
//  2. If no database is connected yet, the site shows this same
//     data in "demo mode" so the pages are never blank.

// No individual doctors — the two "experts" are consultation types, added
// the same way as any expert, with a banner image instead of a face
// (public/graphics/*-consultation.jpg).
export const SAMPLE_EXPERTS = [
  {
    slug: "health-consultation",
    name: "Health Consultation",
    specialty: "Health",
    photo: "/graphics/health-consultation.jpg",
    bio: "A 1-on-1 session about your overall health — digestion, energy, sleep, stress, weight and everyday habits. We look at your routine and history together and give you a practical plan: what to eat, what to change, and which natural products (if any) will genuinely help.",
    credentials: ["Personalised diet & lifestyle plan", "Natural product guidance", "Follow-up support"],
    rating: 5,
    reviewCount: 0,
    fee: 499,
    calLink: "",
    featured: true,
  },
  {
    slug: "fitness-consultation",
    name: "Fitness Consultation",
    specialty: "Fitness",
    photo: "/graphics/fitness-consultation.jpg",
    bio: "A 1-on-1 session about your fitness goals — fat loss, strength, stamina or simply getting started. We assess where you are today and build a realistic workout and nutrition plan around your schedule, with supplement advice only where it actually helps.",
    credentials: ["Personalised workout plan", "Nutrition & supplement guidance", "Follow-up support"],
    rating: 5,
    reviewCount: 0,
    fee: 499,
    calLink: "",
    featured: true,
  },
];

export const SAMPLE_PRODUCTS = [
  {
    slug: "ashwagandha-ksm66",
    sku: "VW-ASH-60",
    name: "Ashwagandha KSM-66 Capsules",
    description:
      "Clinically studied KSM-66 ashwagandha root extract, 600 mg per serving, to support stress resilience, sleep quality and energy. Each batch is third-party tested for purity and heavy metals.\n\n60 vegetarian capsules — a 30-day supply. Take two capsules with dinner, or as advised by your consultant.",
    price: 899,
    images: [],
    stock: 42,
    category: "Supplements",
    consultRecommended: true,
    featured: true,
  },
  {
    slug: "triphala-tablets",
    sku: "VW-TRI-90",
    name: "Triphala Digestive Tablets",
    description:
      "The classical three-fruit Ayurvedic formulation — amalaki, bibhitaki and haritaki — for gentle daily digestive support and regularity. Made from organically grown fruit, lab-tested for purity.\n\n90 tablets — a 45-day supply. Take two tablets before bed with warm water.",
    price: 449,
    images: [],
    stock: 68,
    category: "Ayurveda",
    consultRecommended: false,
    featured: true,
  },
  {
    slug: "omega3-fish-oil",
    sku: "VW-OMG-60",
    name: "Omega-3 Triple Strength Fish Oil",
    description:
      "High-potency omega-3 with 1,100 mg EPA+DHA per serving for heart, joint and brain health. Molecularly distilled, IFOS-certified, with no fishy aftertaste.\n\n60 softgels — a 30-day supply. Take two softgels with your largest meal.",
    price: 1249,
    images: [],
    stock: 35,
    category: "Supplements",
    consultRecommended: false,
    featured: true,
  },
  {
    slug: "vitamin-d3-k2",
    sku: "VW-D3K2-60",
    name: "Vitamin D3 + K2 Drops",
    description:
      "5,000 IU vitamin D3 paired with K2 (MK-7) for absorption and bone health — the deficiency most commonly flagged in Indian blood work. Sunflower-oil base, one drop a day.\n\n30 ml bottle — approximately a 10-month supply at one drop daily.",
    price: 699,
    images: [],
    stock: 51,
    category: "Supplements",
    consultRecommended: true,
    featured: true,
  },
  {
    slug: "night-calm-tea",
    sku: "VW-TEA-40",
    name: "Night Calm Herbal Tea",
    description:
      "A caffeine-free evening blend of chamomile, ashwagandha, brahmi and rose petals, developed with our sleep coaches. Steep for five minutes, forty minutes before bed.\n\n40 whole-leaf pyramid bags. No added flavours or sweeteners.",
    price: 549,
    images: [],
    stock: 84,
    category: "Teas & Tonics",
    consultRecommended: false,
    featured: false,
  },
  {
    slug: "magnesium-glycinate",
    sku: "VW-MAG-90",
    name: "Magnesium Glycinate Tablets",
    description:
      "Highly absorbable chelated magnesium for muscle recovery, sleep and nervous-system support — gentle on the stomach, unlike oxide forms. 400 mg elemental magnesium per serving.\n\n90 tablets — a 30-day supply. Take three tablets in the evening.",
    price: 799,
    images: [],
    stock: 12,
    category: "Supplements",
    consultRecommended: false,
    featured: false,
  },
  {
    slug: "barrier-repair-serum",
    sku: "VW-SKN-30",
    name: "Barrier Repair Ceramide Serum",
    description:
      "A dermatologist-formulated serum with 5 ceramides, niacinamide and hyaluronic acid to restore a damaged skin barrier. Fragrance-free, non-comedogenic, suitable for sensitive skin.\n\n30 ml airless pump. Apply two pumps to damp skin, morning and night.",
    price: 1399,
    images: [],
    stock: 27,
    category: "Skin & Hair",
    consultRecommended: true,
    featured: false,
  },
  {
    slug: "hair-density-tonic",
    sku: "VW-HAIR-100",
    name: "Hair Density Scalp Tonic",
    description:
      "A leave-in scalp tonic with 3% redensyl, rosemary extract and biotin to support hair density and reduce fall. Lightweight, non-greasy, safe for daily use.\n\n100 ml spray bottle. Apply to scalp nightly and massage in — do not rinse.",
    price: 1099,
    images: [],
    stock: 4,
    category: "Skin & Hair",
    consultRecommended: true,
    featured: false,
  },
];

// Which experts recommend which products (by slug) — used by the seed.
export const SAMPLE_RECOMMENDATIONS: Record<string, string[]> = {
  "health-consultation": ["triphala-tablets", "ashwagandha-ksm66", "vitamin-d3-k2"],
  "fitness-consultation": ["omega3-fish-oil", "magnesium-glycinate"],
};
