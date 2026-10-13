// Central place that answers: "which services are set up yet?"
// The site never crashes when a key is missing — features switch
// to a friendly demo/fallback mode instead.

export const hasDatabase = () => !!process.env.DATABASE_URL;

// True once Google login (Auth.js) is configured. The old name `hasClerk`
// is kept as an alias so existing call sites keep working.
export const hasAuth = () =>
  !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

export const hasClerk = hasAuth;

export const hasRazorpay = () =>
  !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET;

export const hasResend = () => !!process.env.RESEND_API_KEY;

// Image uploads (Vercel Blob). When missing, the admin image picker
// falls back to pasting a link so the site still works.
export const hasBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

export const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// General (not expert-specific) consultation — fee in rupees and the
// Cal.com link for the shared/general calendar. Both can be overridden
// from the environment without code changes.
// Testing switch: set TEST_PRICE=20 (in .env / Vercel) and every product and
// every paid consultation is shown AND charged at that price. Delete the
// variable and redeploy to go back to the real prices — the prices saved in
// the database (and shown in /admin) are never changed.
export const testPrice = () => {
  const n = Number(process.env.TEST_PRICE);
  return Number.isInteger(n) && n > 0 ? n : 0;
};

// The price a customer actually pays for a product.
export const effectivePrice = (price: number) => testPrice() || price;

// The fee a customer actually pays for a consultation. A fee of 0 means
// "no online payment" and stays 0 even in test mode.
export const effectiveFee = (fee: number) => (fee > 0 ? testPrice() || fee : fee);

export const generalConsultFee = () => {
  if (testPrice()) return testPrice();
  const n = Number(process.env.NEXT_PUBLIC_GENERAL_CONSULT_FEE);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 499;
};

export const generalCalLink = () =>
  process.env.NEXT_PUBLIC_GENERAL_CAL_LINK || "";

// WhatsApp support. Set NEXT_PUBLIC_WHATSAPP_NUMBER to a full international
// number (digits only, e.g. "919876543210") to switch on the floating
// support button. Missing/blank => the button simply doesn't render.
export const whatsappNumber = () => {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const digits = raw.replace(/[^\d]/g, "");
  return digits.length >= 10 ? digits : "";
};

export const whatsappMessage = () =>
  process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
  "Hi Wellness Kraft, I'd like some help.";
