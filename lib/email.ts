import { Resend } from "resend";
import { hasResend, siteUrl } from "./config";
import { formatINR, formatDateTime } from "./utils";

// All emails go through Resend. If the key isn't set yet, emails
// are simply skipped (never an error the customer sees).

function getResend(): Resend | null {
  if (!hasResend()) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = () => process.env.EMAIL_FROM || "onboarding@resend.dev";
const ADMIN = () => process.env.ADMIN_NOTIFY_EMAIL || "";

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  address: string;
}

function orderHtml(o: OrderEmailData, forAdmin: boolean): string {
  const rows = o.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee">${i.name} × ${i.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${formatINR(i.price * i.quantity)}</td></tr>`
    )
    .join("");
  return `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1b2823">
    <div style="background:#0e6b4f;color:#fff;padding:24px;border-radius:12px 12px 0 0">
      <h1 style="margin:0;font-size:22px">${forAdmin ? "New order received" : "Thank you for your order"}</h1>
      <p style="margin:8px 0 0;opacity:.85">Order ${o.orderId}</p>
    </div>
    <div style="border:1px solid #e7dfd0;border-top:none;padding:24px;border-radius:0 0 12px 12px">
      ${forAdmin ? `<p><strong>Customer:</strong> ${o.customerName} (${o.customerEmail})</p>` : `<p>Hi ${o.customerName}, your payment was received and your order is being prepared.</p>`}
      <table style="width:100%;border-collapse:collapse;margin:16px 0">${rows}
        <tr><td style="padding:12px;font-weight:bold">Total paid</td><td style="padding:12px;text-align:right;font-weight:bold">${formatINR(o.total)}</td></tr>
      </table>
      <p style="font-size:14px;color:#43524b"><strong>Delivery address:</strong><br/>${o.address}</p>
      ${forAdmin ? `<p><a href="${siteUrl()}/admin/orders" style="color:#0e6b4f">Open the admin orders page →</a></p>` : `<p style="font-size:14px;color:#43524b">You can track this order any time from <a href="${siteUrl()}/dashboard" style="color:#0e6b4f">your dashboard</a>.</p>`}
      <p style="font-size:12px;color:#6b7a72;margin-top:24px">Our products support general wellness and are not intended to diagnose, treat, cure or prevent any disease. Please follow the guidance of your consultant.</p>
    </div>
  </div>`;
}

export async function sendOrderEmails(o: OrderEmailData): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  const jobs: Promise<unknown>[] = [];
  if (o.customerEmail) {
    jobs.push(
      resend.emails.send({
        from: FROM(),
        to: o.customerEmail,
        subject: `Order confirmed — ${formatINR(o.total)} (${o.orderId})`,
        html: orderHtml(o, false),
      })
    );
  }
  if (ADMIN()) {
    jobs.push(
      resend.emails.send({
        from: FROM(),
        to: ADMIN(),
        subject: `New order ${o.orderId} — ${formatINR(o.total)} from ${o.customerName}`,
        html: orderHtml(o, true),
      })
    );
  }
  await Promise.allSettled(jobs);
}

export async function sendBookingEmails(b: {
  attendeeName: string;
  attendeeEmail: string;
  expertName: string;
  title: string;
  startTime: string | Date;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  const when = formatDateTime(b.startTime);
  const html = `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1b2823">
    <div style="background:#0e6b4f;color:#fff;padding:24px;border-radius:12px 12px 0 0">
      <h1 style="margin:0;font-size:22px">Consultation confirmed</h1>
    </div>
    <div style="border:1px solid #e7dfd0;border-top:none;padding:24px;border-radius:0 0 12px 12px">
      <p>Hi ${b.attendeeName || "there"}, your consultation is booked.</p>
      <p><strong>${b.title}</strong>${b.expertName ? ` with ${b.expertName}` : ""}<br/>${when}</p>
      <p style="font-size:14px;color:#43524b">Cal.com has also sent you a calendar invite with the meeting link. See all your bookings in <a href="${siteUrl()}/dashboard" style="color:#0e6b4f">your dashboard</a>.</p>
    </div>
  </div>`;
  const jobs: Promise<unknown>[] = [];
  if (b.attendeeEmail) {
    jobs.push(
      resend.emails.send({
        from: FROM(),
        to: b.attendeeEmail,
        subject: `Booking confirmed — ${b.title} (${when})`,
        html,
      })
    );
  }
  if (ADMIN()) {
    jobs.push(
      resend.emails.send({
        from: FROM(),
        to: ADMIN(),
        subject: `New booking: ${b.attendeeName || "A customer"} — ${b.title} (${when})`,
        html,
      })
    );
  }
  await Promise.allSettled(jobs);
}

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
      html: `<div style="font-family:Georgia,serif;max-width:560px;color:#1b2823">
        <h2>New enquiry from the website contact form</h2>
        <p><strong>Name:</strong> ${c.name}<br/><strong>Email:</strong> ${c.email}<br/><strong>Phone:</strong> ${c.phone}</p>
        <p style="white-space:pre-wrap;border-left:3px solid #0e6b4f;padding-left:12px">${c.message}</p>
      </div>`,
    });
    return true;
  } catch {
    return false;
  }
}
