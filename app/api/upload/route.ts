import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/auth";
import { hasBlob } from "@/lib/config";

// Admin-only image upload. Receives an already-cropped image (the browser
// crops + resizes to fixed dimensions before sending) and stores it in
// Vercel Blob, returning a public URL that goes into the product/expert.
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "You need admin access to upload images." }, { status: 403 });
  }

  if (!hasBlob()) {
    return NextResponse.json(
      {
        error:
          "Image uploads aren't switched on yet. Owner: add BLOB_READ_WRITE_TOKEN — see README step “Image uploads”. You can paste an image link instead for now.",
      },
      { status: 503 }
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No image received. Please try again." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "That file isn't an image." }, { status: 400 });
  }
  // Cropped images are small; guard against anything unexpectedly large.
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Image is too large (max 8 MB)." }, { status: 400 });
  }

  const folder = String(form?.get("folder") || "uploads").replace(/[^a-z0-9-]/gi, "");
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const name = `${folder || "uploads"}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  try {
    const blob = await put(name, file, { access: "public", contentType: file.type });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("blob upload failed:", err);
    // Surface the real reason (this endpoint is admin-only) so setup
    // issues like a wrong/expired token are obvious instead of generic.
    const detail = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: `Upload failed: ${detail}` }, { status: 500 });
  }
}
