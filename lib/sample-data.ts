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

// Real Wellness Kraft products (from the client's labels). Images live in
// public/products/. Prices are the label MRPs.
export const SAMPLE_PRODUCTS = [
  {
    slug: "andevor",
    sku: "WK-AND-60",
    name: "Andevor — Men's Wellness Tablets",
    description:
      "Natural strength for a better tomorrow. A powerful herbal men's wellness formula — 100% herbal, made with Ayurvedic herbs.\n\n• Boosts stamina & energy\n• Supports strength & performance\n• Promotes vitality & male wellness\n• Enriched with powerful herbal extracts\n\nComposition (each 2 tablets): Kaunch Beej extract (Mucuna pruriens) 300 mg, Ashwagandha extract (Withania somnifera) 300 mg, Safed Musli extract (Chlorophytum borivilianum) 200 mg, Gokshura extract (Tribulus terrestris) 200 mg, Putrajeevak extract (Putranjiva roxburghii) 150 mg, Shivlingi seed extract (Bryonia laciniosa) 150 mg, Amla extract (Emblica officinalis) 150 mg, Guduchi extract (Tinospora cordifolia) 100 mg, Pippali extract (Piper longum) 5 mg.\n\nDosage: 1 tablet twice daily after meals, or as directed by the physician. Use under medical supervision; do not exceed the recommended dosage.\n\nNet: 60 tablets. An Ayurvedic proprietary medicine.",
    price: 2499,
    images: ["/products/andevor-1.jpg", "/products/andevor-2.jpg"],
    stock: 100,
    category: "Men's Wellness",
    consultRecommended: true,
    featured: true,
  },
  {
    slug: "livnora-liver-juice",
    sku: "WK-LIV-500",
    name: "Livnora Liver Juice",
    description:
      "100% natural herbal goodness that supports liver health and natural detoxification.\n\n• Supports healthy liver function\n• Promotes natural detoxification\n• Supports healthy metabolism\n• Helps maintain overall wellness\n\nKey herbs (each 15 ml): Kutki, Giloy, Kalmegh, Punarnava, Bhumi Amla, Makoy, Saunf-Jeera-Pudina, Triphala, Kasni, Amla, Chirayata, Daru Haldi, Kachur, Patha, Vidang, Nishoth + Revand Chini, Mulethi and Rose.\n\nDosage: 30 ml twice daily after meals, or as directed by the physician. Shake well before use.\n\nNet: 500 ml. An Ayurvedic proprietary medicine.",
    price: 1499,
    images: ["/products/livnora-1.jpg", "/products/livnora-2.jpg"],
    stock: 100,
    category: "Liver Care",
    consultRecommended: false,
    featured: true,
  },
  {
    slug: "bloomies-juice",
    sku: "WK-BLM-500",
    name: "Bloomies Juice — Women's Wellness",
    description:
      "An Ayurvedic women's wellness formula — 100% natural herbal goodness. Natural herbs, pure wellness.\n\n• Boosts immunity\n• Supports a healthy mind\n• Ayurvedic goodness\n• Enhances well-being\n\nKey herbs (each 15 ml): Kanchanar bark, Ashoka bark, Shatavari root, Lodhra bark, Guduchi stem, Spearmint, Shivlingi seed, Putrajeevak seed, Ashwagandha root, Amla, Fenugreek seed, Daruharidra, Kumari, Jamun seed, Dashmoola, Musta, Nirgundi, Dalchini and Trikatu.\n\nDosage: 30 ml twice daily after meals, or as directed by the physician. Shake well before use.\n\nNet: 500 ml. An Ayurvedic proprietary medicine.",
    price: 1799,
    images: ["/products/bloomies-1.jpg", "/products/bloomies-2.jpg"],
    stock: 100,
    category: "Women's Wellness",
    consultRecommended: false,
    featured: true,
  },
  {
    slug: "fuel-kraft-protein-chocolate",
    sku: "WK-FK-200",
    name: "Fuel Kraft Protein Powder — Chocolate",
    description:
      "A chocolate-flavour protein powder for everyday strength and fitness.\n\n• Improved strength & fitness\n• Promotes bone health\n• Boosts energy & overall health\n\nPer 30 g serving: 16 g protein, plus calcium, vitamin D3, B-vitamins, vitamin C & E, zinc, magnesium, iodine, selenium, omega-3 (algae source) and digestive enzymes.\n\nHow to use: add one scoop to a glass of lukewarm water or milk, add sugar to taste, stir and enjoy — or as directed by a dietitian. Not a substitute for a varied diet.\n\nNet: 200 g. Dietary supplement — not for medicinal use. FSSAI Lic. No. 12123999000001.",
    price: 999,
    images: ["/products/fuel-kraft-1.jpg"],
    stock: 100,
    category: "Protein & Fitness",
    consultRecommended: false,
    featured: true,
  },
];

export const SAMPLE_RECOMMENDATIONS: Record<string, string[]> = {
  "health-consultation": ["livnora-liver-juice", "bloomies-juice", "andevor"],
  "fitness-consultation": ["fuel-kraft-protein-chocolate", "andevor"],
};
