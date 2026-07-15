import { NextRequest, NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";
import { getPrisma } from "@/lib/prisma";
import { getSafeUser, ensureDbUser } from "@/lib/auth";

// Step 1 of payment: validate the cart against real database prices,
// create a Razorpay order (server-side, using the secret), and save
// a PENDING order. The browser never decides prices.

export async function POST(req: NextRequest) {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: "The store isn't fully set up yet (database missing). Owner: see README step 3." },
        { status: 503 }
      );
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      return NextResponse.json(
        { error: "Online payment isn't switched on yet. Owner: add Razorpay keys — README step 5." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const items: { productId: string; quantity: number }[] = body.items || [];
    const c: Record<string, string> = body.customer || {};

    for (const field of ["name", "phone", "email", "address1", "city", "state", "pincode"]) {
      if (!c[field]?.trim()) {
        return NextResponse.json(
          { error: `Please fill in your ${field === "address1" ? "address" : field}.` },
          { status: 400 }
        );
      }
    }
    if (!items.length) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    // Look up real prices & stock from the database
    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) }, active: true },
    });

    const orderItems: { productId: string; name: string; price: number; quantity: number }[] = [];
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: "One of the items in your cart is no longer available. Please review your cart." },
          { status: 409 }
        );
      }
      const qty = Math.max(1, Math.min(Math.floor(item.quantity), 99));
      if (product.stock < qty) {
        return NextResponse.json(
          { error: `Sorry, only ${product.stock} of "${product.name}" left in stock. Please adjust your cart.` },
          { status: 409 }
        );
      }
      orderItems.push({ productId: product.id, name: product.name, price: product.price, quantity: qty });
    }

    const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Amount for Razorpay is in paise
    const rzpOrder = await razorpay.orders.create({
      amount: total * 100,
      currency: "INR",
      notes: { customer: c.name, phone: c.phone },
    });

    // Attach the order to the signed-in user, if any
    const user = await getSafeUser();
    const dbUserId = user ? await ensureDbUser(user) : null;

    const order = await prisma.order.create({
      data: {
        userId: dbUserId,
        total,
        paymentStatus: "PENDING",
        razorpayOrderId: rzpOrder.id,
        shipName: c.name.trim(),
        shipPhone: c.phone.trim(),
        shipEmail: c.email.trim(),
        shipAddress1: c.address1.trim(),
        shipAddress2: (c.address2 || "").trim(),
        shipCity: c.city.trim(),
        shipState: c.state.trim(),
        shipPincode: c.pincode.trim(),
        items: { create: orderItems },
      },
    });

    return NextResponse.json({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: total * 100,
      currency: "INR",
      razorpayOrderId: rzpOrder.id,
      orderId: order.id,
    });
  } catch (err) {
    console.error("create-order failed:", err);
    return NextResponse.json(
      { error: "Could not start the payment. Please try again in a moment." },
      { status: 500 }
    );
  }
}
