import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name = "", email = "", phone = "", message = "" } = body || {};
    if (!name.trim() || !email.trim() || !message.trim()) {
      return NextResponse.json(
        { error: "Please fill in your name, email and message." },
        { status: 400 }
      );
    }

    const sent = await sendContactEmail({
      name: name.trim().slice(0, 200),
      email: email.trim().slice(0, 200),
      phone: phone.trim().slice(0, 30),
      message: message.trim().slice(0, 5000),
    });

    if (!sent) {
      return NextResponse.json(
        { error: "Messaging isn't set up yet — please reach us directly. Owner: add the Resend key (README step 6)." },
        { status: 503 }
      );
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Could not send your message. Please try again." },
      { status: 500 }
    );
  }
}
