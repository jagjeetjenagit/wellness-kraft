import { Resend } from "resend";
import { hasResend, siteUrl } from "./config";
import { formatINR, formatDateTime } from "./utils";

// All emails go through Resend. If the key isn't set yet, emails are
// simply skipped (never an error the customer sees). Every send is
// best-effort: a mail failure must never block a payment or a booking.

function getResend(): Resend | null {
  if (!hasResend()) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = () => process.env.EMAIL_FROM || "onboarding@resend.dev";
const ADMIN = () => process.env.ADMIN_NOTIFY_EMAIL || "";
const BRAND = "Wellness Kraft";

type Job = { to?: string | null; subject: string; html: string; replyTo?: string };

// Fire a batch of emails, skipping any without a recipient. Never throws.
async function deliver(jobs: Job[]): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  const valid = jobs.filter((j) => j.to && j.to.includes("@"));
  await Promise.allSettled(
    valid.map((j) =>
      resend.emails.send({
        from: FROM(),
        to: j.to as string,
        subject: j.subject,
        html: j.html,
        ...(j.replyTo ? { replyTo: j.replyTo } : {}),
      })
    )
  );
}

// Shared branded wrapper. `accent` picks the header colour: green for
// good news (confirmations), muted red for problems (failures/cancels).
function shell(headline: string, subline: string, inner: string, accent: "green" | "red" = "green"): string {
  const bar = accent === "red" ? "#8a2b2b" : "#334720";
  return `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1e1e1e">
    <div style="background:${bar};color:#fefaef;padding:24px;border-radius:12px 12px 0 0">
      <h1 style="margin:0;font-size:22px">${headline}</h1>
      ${subline ? `<p style="margin:8px 0 0;opacity:.85">${subline}</p>` : ""}
    </div>
    <div style="border:1px solid #d5d8cf;border-top:none;padding:24px;border-radius:0 0 12px 12px">
      ${inner}
      <p style="font-size:12px;color:#6b7a5e;margin-top:28px;border-top:1px solid #eee;padding-top:16px">
        ${BRAND} · This is an automated message about your account with us.<br/>
        Our products support general wellness and are not intended to diagnose, treat, cure or prevent any disease.
      </p>
    </div>
  </div>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:20px 0"><a href="${href}" style="background:#334720;color:#fefaef;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block;font-size:15px">${label}</a></p>`;
}

// Human "starts in ~2 hours" text, computed at send time. Email can't run a
// live countdown, so we show the remaining time as a static timer instead.
function timeUntil(start: string | Date): string {
  const ms = new Date(start).getTime() - Date.now();
  if (ms <= 0) return "now";
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"}`;
  const hours = Math.floor(mins / 60);
  const remMin = mins % 60;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"}${remMin ? ` ${remMin} min` : ""}`;
  const days = Math.floor(hours / 24);
  const remHr = hours % 24;
  return `${days} day${days === 1 ? "" : "s"}${remHr ? ` ${remHr} hr` : ""}`;
}

// A prominent "when + starts in" block used by confirmation & reminders.
function timerBlock(startTime: string | Date): string {
  return `<div style="background:#f4f2e9;border:1px solid #d5d8cf;border-radius:10px;padding:16px;margin:16px 0;text-align:center">
      <div style="font-size:13px;color:#6b7a5e;text-transform:uppercase;letter-spacing:.5px">Your consultation</div>
      <div style="font-size:18px;margin:6px 0"><strong>${formatDateTime(startTime)} (IST)</strong></div>
      <div style="font-size:14px;color:#334720">Starts in ${timeUntil(startTime)}</div>
    </div>`;
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  address: string;
}

function orderRows(items: OrderEmailData["items"]): string {
  return items
    .map(
      (i) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee">${i.name} × ${i.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${formatINR(i.price * i.quantity)}</td></tr>`
    )
    .join("");
}

// Order paid → confirmation to customer + alert to admin.
export async function sendOrderEmails(o: OrderEmailData): Promise<void> {
  const table = `<table style="width:100%;border-collapse:collapse;margin:16px 0">${orderRows(o.items)}
      <tr><td style="padding:12px;font-weight:bold">Total paid</td><td style="padding:12px;text-align:right;font-weight:bold">${formatINR(o.total)}</td></tr>
    </table>`;

  const customer = shell(
    "Thank you for your order",
    `Order ${o.orderId}`,
    `<p>Hi ${o.customerName}, your payment was received and your order is being prepared.</p>
     ${table}
     <p style="font-size:14px;color:#6b7a5e"><strong>Delivery address:</strong><br/>${o.address}</p>
     ${button(`${siteUrl()}/dashboard`, "Track your order")}`
  );

  const admin = shell(
    "New order received",
    `Order ${o.orderId}`,
    `<p><strong>Customer:</strong> ${o.customerName} (${o.customerEmail})</p>
     ${table}
     <p style="font-size:14px;color:#6b7a5e"><strong>Deliver to:</strong><br/>${o.address}</p>
     ${button(`${siteUrl()}/admin/orders`, "Open admin orders")}`
  );

  await deliver([
    { to: o.customerEmail, subject: `Order confirmed — ${formatINR(o.total)} (${o.orderId})`, html: customer },
    { to: ADMIN(), subject: `New order ${o.orderId} — ${formatINR(o.total)} from ${o.customerName}`, html: admin },
  ]);
}

// Order payment failed / could not be verified → let the customer know
// it didn't go through (and any deduction is auto-refunded), alert admin.
export async function sendOrderFailedEmail(o: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
}): Promise<void> {
  const customer = shell(
    "Your payment didn't go through",
    `Order ${o.orderId}`,
    `<p>Hi ${o.customerName || "there"}, we couldn't confirm your payment of <strong>${formatINR(o.total)}</strong>, so your order was not placed.</p>
     <p>If any amount was deducted, it is automatically refunded by your bank within 5–7 working days. You're welcome to try again.</p>
     ${button(`${siteUrl()}/cart`, "Return to your cart")}`,
    "red"
  );
  const admin = shell(
    "Payment failed",
    `Order ${o.orderId}`,
    `<p><strong>${o.customerName || "A customer"}</strong> (${o.customerEmail || "no email"}) had a payment of ${formatINR(o.total)} fail.</p>`,
    "red"
  );
  await deliver([
    { to: o.customerEmail, subject: `Payment failed — order ${o.orderId}`, html: customer },
    { to: ADMIN(), subject: `Payment FAILED — order ${o.orderId} (${o.customerName})`, html: admin },
  ]);
}

// Admin moved an order to SHIPPED / DELIVERED / CANCELLED → tell the customer.
export async function sendOrderStatusEmail(o: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  status: "SHIPPED" | "DELIVERED" | "CANCELLED";
  address?: string;
}): Promise<void> {
  const copy: Record<string, { head: string; body: string; accent: "green" | "red" }> = {
    SHIPPED: {
      head: "Your order is on the way",
      body: `Good news — your order has been shipped and is heading to you.${o.address ? `<br/><br/><strong>Delivery address:</strong><br/>${o.address}` : ""}`,
      accent: "green",
    },
    DELIVERED: {
      head: "Your order has been delivered",
      body: "Your order has been marked as delivered. We hope you love it — reach out any time if anything isn't right.",
      accent: "green",
    },
    CANCELLED: {
      head: "Your order was cancelled",
      body: "Your order has been cancelled. If a payment was made, any refund will reach you within 5–7 working days. Contact us if you have any questions.",
      accent: "red",
    },
  };
  const c = copy[o.status];
  if (!c) return;
  const html = shell(
    c.head,
    `Order ${o.orderId}`,
    `<p>Hi ${o.customerName || "there"}, ${c.body}</p>${button(`${siteUrl()}/dashboard`, "View your orders")}`,
    c.accent
  );
  await deliver([{ to: o.customerEmail, subject: `${c.head} — order ${o.orderId}`, html }]);
}

/* ------------------------------------------------------------------ */
/* Consultation payments                                               */
/* ------------------------------------------------------------------ */

// Consultation fee paid → immediate admin alert only. (The customer's
// "pick your slot" prompt is sent by the cron 5 min later, and only if
// they still haven't booked — so booking-then gets no redundant nudge.)
export async function sendConsultPaidAdminAlert(p: {
  customerName: string;
  customerEmail: string;
  expertName: string;
  amount: number;
}): Promise<void> {
  const admin = shell(
    "Consultation fee paid",
    `${p.expertName}`,
    `<p><strong>${p.customerName || "A customer"}</strong> (${p.customerEmail}) paid ${formatINR(p.amount)} for a consultation. Awaiting slot selection.</p>`
  );
  await deliver([{ to: ADMIN(), subject: `Consultation paid — ${formatINR(p.amount)} from ${p.customerName}`, html: admin }]);
}

// "You've paid — now pick your slot." Sent by the cron 5 min after a paid
// consultation still has no booking. Customer only.
export async function sendPickSlotNudge(p: {
  customerName: string;
  customerEmail: string;
  expertName: string;
  amount: number;
}): Promise<void> {
  const customer = shell(
    "One step left — pick your slot",
    `Consultation with ${p.expertName}`,
    `<p>Hi ${p.customerName || "there"}, we've received your consultation fee of <strong>${formatINR(p.amount)}</strong>, but you haven't chosen a time yet.</p>
     <p>Pick a slot that suits you and your consultation will be confirmed instantly.</p>
     ${button(`${siteUrl()}/consult`, "Pick your slot")}`
  );
  await deliver([{ to: p.customerEmail, subject: `Pick your consultation slot`, html: customer }]);
}

// Consultation fee payment failed → customer + admin.
export async function sendConsultPaymentFailedEmail(p: {
  customerName: string;
  customerEmail: string;
  expertName: string;
  amount: number;
}): Promise<void> {
  const customer = shell(
    "Your payment didn't go through",
    `Consultation with ${p.expertName}`,
    `<p>Hi ${p.customerName || "there"}, we couldn't confirm your consultation payment of <strong>${formatINR(p.amount)}</strong>, so no booking was made.</p>
     <p>If any amount was deducted, your bank refunds it automatically within 5–7 working days. You're welcome to try again.</p>
     ${button(`${siteUrl()}/consult`, "Try booking again")}`,
    "red"
  );
  const admin = shell(
    "Consultation payment failed",
    `${p.expertName}`,
    `<p><strong>${p.customerName || "A customer"}</strong> (${p.customerEmail || "no email"}) had a consultation payment of ${formatINR(p.amount)} fail.</p>`,
    "red"
  );
  await deliver([
    { to: p.customerEmail, subject: `Payment failed — consultation`, html: customer },
    { to: ADMIN(), subject: `Consultation payment FAILED — ${p.customerName}`, html: admin },
  ]);
}

/* ------------------------------------------------------------------ */
/* Bookings                                                            */
/* ------------------------------------------------------------------ */

interface BookingEmailData {
  attendeeName: string;
  attendeeEmail: string;
  expertName: string;
  expertEmail?: string; // the consultant's own inbox
  title: string;
  startTime: string | Date;
  amountPaid?: number;
}

const LINK_NOTE =
  `<p style="font-size:14px;color:#6b7a5e">Your private video link will be emailed to you <strong>10 minutes before</strong> the consultation — no link is needed until then.</p>`;

// Slot confirmed → customer + admin + the consultant themselves.
// The confirmation shows only WHEN it is (a timer), never the join link.
export async function sendBookingEmails(b: BookingEmailData): Promise<void> {
  const when = formatDateTime(b.startTime);

  const customer = shell(
    "Consultation confirmed",
    "",
    `<p>Hi ${b.attendeeName || "there"}, your video consultation${b.expertName ? ` with ${b.expertName}` : ""} is booked.</p>
     ${timerBlock(b.startTime)}
     ${LINK_NOTE}
     <p style="font-size:14px;color:#6b7a5e">See all your bookings in <a href="${siteUrl()}/dashboard" style="color:#334720">your dashboard</a>.</p>`
  );

  const forExpert = shell(
    "New consultation booked",
    when + " (IST)",
    `<p>Hi ${b.expertName || "there"}, a new consultation has been booked with you.</p>
     <p><strong>Client:</strong> ${b.attendeeName || "—"}<br/>
        <strong>Email:</strong> ${b.attendeeEmail || "—"}</p>
     ${timerBlock(b.startTime)}
     ${LINK_NOTE}
     ${button(`${siteUrl()}/studio`, "Open your consultant studio")}`
  );

  const admin = shell(
    "New booking",
    when + " (IST)",
    `<p><strong>${b.attendeeName || "A customer"}</strong> (${b.attendeeEmail || "no email"}) booked <strong>${b.title}</strong>${b.expertName ? ` with ${b.expertName}` : ""}.</p>
     ${b.amountPaid ? `<p>Amount paid: ${formatINR(b.amountPaid)}</p>` : ""}
     ${button(`${siteUrl()}/admin/bookings`, "Open admin bookings")}`
  );

  await deliver([
    { to: b.attendeeEmail, subject: `Booking confirmed — ${when} (IST)`, html: customer, replyTo: b.expertEmail },
    { to: b.expertEmail, subject: `New consultation — ${b.attendeeName || "a client"} (${when})`, html: forExpert, replyTo: b.attendeeEmail },
    { to: ADMIN(), subject: `New booking: ${b.attendeeName || "A customer"} — ${b.title} (${when})`, html: admin },
  ]);
}

// Reminder before a consultation → customer + consultant.
// `stage` 30 = no link; `stage` 10 = includes the join link (released now).
export async function sendReminderEmails(b: {
  attendeeName: string;
  attendeeEmail: string;
  expertName: string;
  expertEmail?: string;
  startTime: string | Date;
  meetUrl: string;
  stage: 30 | 10;
}): Promise<void> {
  const when = formatDateTime(b.startTime);
  const linkPart =
    b.stage === 10
      ? `${button(b.meetUrl, "Join the video consultation")}
         <p style="font-size:13px;color:#6b7a5e">Or open this link: <a href="${b.meetUrl}" style="color:#334720">${b.meetUrl}</a></p>`
      : `<p style="font-size:14px;color:#6b7a5e">Your join link will arrive in a follow-up email 10 minutes before the start.</p>`;

  const head = b.stage === 10 ? "Your consultation starts soon — join link inside" : "Reminder: consultation in 30 minutes";

  const customer = shell(
    head,
    "",
    `<p>Hi ${b.attendeeName || "there"}, this is a reminder about your consultation${b.expertName ? ` with ${b.expertName}` : ""}.</p>
     ${timerBlock(b.startTime)}
     ${linkPart}`
  );
  const forExpert = shell(
    b.stage === 10 ? "Consultation starting soon — join link inside" : "Reminder: consultation in 30 minutes",
    "",
    `<p>Hi ${b.expertName || "there"}, your consultation with <strong>${b.attendeeName || "a client"}</strong> is coming up.</p>
     ${timerBlock(b.startTime)}
     ${linkPart}`
  );

  const subj = b.stage === 10 ? `Join now — consultation at ${when}` : `Reminder — consultation at ${when} (in 30 min)`;
  await deliver([
    { to: b.attendeeEmail, subject: subj, html: customer, replyTo: b.expertEmail },
    { to: b.expertEmail, subject: subj, html: forExpert, replyTo: b.attendeeEmail },
  ]);
}

// Booking cancelled → customer + admin + consultant.
export async function sendBookingCancelledEmail(b: {
  attendeeName: string;
  attendeeEmail: string;
  expertName: string;
  expertEmail?: string;
  title: string;
  startTime: string | Date;
}): Promise<void> {
  const when = formatDateTime(b.startTime);
  const customer = shell(
    "Your consultation was cancelled",
    "",
    `<p>Hi ${b.attendeeName || "there"}, your consultation${b.expertName ? ` with ${b.expertName}` : ""} on <strong>${when} (IST)</strong> has been cancelled.</p>
     <p>If you paid for this consultation, any refund will reach you within 5–7 working days. You're welcome to book another time.</p>
     ${button(`${siteUrl()}/consult`, "Book again")}`,
    "red"
  );
  const forExpert = shell(
    "A consultation was cancelled",
    when + " (IST)",
    `<p>Hi ${b.expertName || "there"}, the consultation with <strong>${b.attendeeName || "a client"}</strong> on ${when} (IST) has been cancelled. That slot is free again.</p>`,
    "red"
  );
  const admin = shell(
    "Booking cancelled",
    when + " (IST)",
    `<p><strong>${b.attendeeName || "A customer"}</strong> — ${b.title}${b.expertName ? ` with ${b.expertName}` : ""} on ${when} (IST) was cancelled.</p>`,
    "red"
  );
  await deliver([
    { to: b.attendeeEmail, subject: `Consultation cancelled — ${when}`, html: customer },
    { to: b.expertEmail, subject: `Consultation cancelled — ${b.attendeeName || "a client"} (${when})`, html: forExpert },
    { to: ADMIN(), subject: `Booking cancelled — ${b.attendeeName || "A customer"} (${when})`, html: admin },
  ]);
}

// Expert (or admin) saved the post-consultation advice → nudge the customer.
export async function sendPrescriptionReadyEmail(p: {
  attendeeName: string;
  attendeeEmail: string;
  expertName: string;
}): Promise<void> {
  const html = shell(
    "Your consultation notes are ready",
    "",
    `<p>Hi ${p.attendeeName || "there"}, ${p.expertName || "your consultant"} has shared advice and recommendations from your consultation.</p>
     ${button(`${siteUrl()}/dashboard`, "View your notes")}`
  );
  await deliver([{ to: p.attendeeEmail, subject: `Your consultation notes are ready`, html }]);
}

/* ------------------------------------------------------------------ */
/* Contact form                                                        */
/* ------------------------------------------------------------------ */

export async function sendContactEmail(c: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): Promise<boolean> {
  const resend = getResend();
  if (!resend || !ADMIN()) return false;
  try {
    await resend.emails.send({
      from: FROM(),
      to: ADMIN(),
      replyTo: c.email || undefined,
      subject: `Website enquiry from ${c.name}`,
      html: `<div style="font-family:Georgia,serif;max-width:560px;color:#1e1e1e">
        <h2>New enquiry from the website contact form</h2>
        <p><strong>Name:</strong> ${c.name}<br/><strong>Email:</strong> ${c.email}<br/><strong>Phone:</strong> ${c.phone}</p>
        <p style="white-space:pre-wrap;border-left:3px solid #334720;padding-left:12px">${c.message}</p>
      </div>`,
    });
    return true;
  } catch {
    return false;
  }
}
