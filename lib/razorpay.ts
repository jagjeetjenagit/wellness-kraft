import Razorpay from "razorpay";
import crypto from "crypto";
import { hasRazorpay } from "./config";

// The Razorpay SECRET is only ever used here, on the server.
// It is never sent to the browser.

export function getRazorpay(): Razorpay | null {
  if (!hasRazorpay()) return null;
  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

// Verify that a payment really came from Razorpay (signature check).
export function verifyPaymentSignature(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${params.razorpay_order_id}|${params.razorpay_payment_id}`)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(params.razorpay_signature)
    );
  } catch {
    return false;
  }
}
