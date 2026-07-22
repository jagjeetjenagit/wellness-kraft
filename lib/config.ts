// Central place that answers: "which services are set up yet?"
// The site never crashes when a key is missing — features switch
// to a friendly demo/fallback mode instead.

export const hasDatabase = () => !!process.env.DATABASE_URL;

export const hasClerk = () =>
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY;

export const hasRazorpay = () =>
  !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET;

export const hasResend = () => !!process.env.RESEND_API_KEY;

export const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// General (not expert-specific) consultation — fee in rupees and the
// Cal.com link for the shared/general calendar. Both can be overridden
// from the environment without code changes.
export const generalConsultFee = () => {
  const n = Number(process.env.NEXT_PUBLIC_GENERAL_CONSULT_FEE);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 499;
};

export const generalCalLink = () =>
  process.env.NEXT_PUBLIC_GENERAL_CAL_LINK || "";
