// Conditions we guide people through. Shared by the homepage chips and
// the /conditions/[slug] pages.
//
// Compliance note (FSSAI): condition pages must describe support and
// guidance for these conditions — never cures, treatment, or disease-
// reversal claims.

export interface ConditionT {
  slug: string;
  name: string;
}

export const CONDITIONS: ConditionT[] = [
  { slug: "weight-management", name: "Weight management" },
  { slug: "pcos", name: "PCOS" },
  { slug: "diabetes-blood-sugar", name: "Diabetes & blood sugar" },
  { slug: "thyroid-imbalance", name: "Thyroid imbalance" },
  { slug: "digestive-issues", name: "Digestive issues" },
  { slug: "stress-burnout", name: "Stress & burnout" },
  { slug: "poor-sleep", name: "Poor sleep" },
  { slug: "low-energy-fatigue", name: "Low energy & fatigue" },
];

export const getCondition = (slug: string) =>
  CONDITIONS.find((c) => c.slug === slug);
