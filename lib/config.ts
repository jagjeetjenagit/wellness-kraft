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
