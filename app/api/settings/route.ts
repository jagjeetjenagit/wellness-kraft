import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { SEO_DEFAULTS } from "@/lib/settings";

// Site-wide SEO settings for the admin editor (/admin/seo).
//  GET  — current saved values (falls back to defaults if none saved yet)
//  PUT  — upsert the single settings row (id = 1)

export async function GET() {
  const { error, prisma } = await adminGuard();
  if (error) return error;
  const row = await prisma.siteSetting.findUnique({ where: { id: 1 } }).catch((e) => {
    console.error("load settings failed:", e);
    return null;
  });
  return NextResponse.json({
    metaTitle: row?.metaTitle ?? "",
    metaDescription: row?.metaDescription ?? "",
    keywords: row?.keywords ?? "",
    ogImage: row?.ogImage ?? "",
    // The built-in fallbacks, so the form can show them as placeholders.
    defaults: SEO_DEFAULTS,
  });
}

export async function PUT(req: NextRequest) {
  const { error, prisma } = await adminGuard();
  if (error) return error;
  try {
    const b = await req.json();
    const data = {
      metaTitle: String(b.metaTitle ?? "").trim().slice(0, 200),
      metaDescription: String(b.metaDescription ?? "").trim().slice(0, 400),
      keywords: String(b.keywords ?? "").trim().slice(0, 600),
      ogImage: String(b.ogImage ?? "").trim(),
    };
    const saved = await prisma.siteSetting.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });
    return NextResponse.json(saved);
  } catch (err) {
    console.error("save settings failed:", err);
    return NextResponse.json(
      { error: "Could not save SEO settings. Please try again." },
      { status: 500 }
    );
  }
}
