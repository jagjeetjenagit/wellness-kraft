import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAdmin } from "@/lib/auth";
import { hasBlob } from "@/lib/config";

// Direct client-to-Blob upload for testimonial videos. Videos are far bigger
// than the ~4.5 MB serverless request-body limit, so the browser uploads
// straight to Vercel Blob using a short-lived token minted here (admin only).
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!hasBlob()) {
    return NextResponse.json(
      {
        error:
          "Video uploads aren't switched on yet. Owner: add BLOB_READ_WRITE_TOKEN (README “Image uploads”). You can paste a hosted video link instead for now.",
      },
      { status: 503 }
    );
  }

  const body = (await req.json()) as HandleUploadBody;
  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        if (!(await isAdmin())) {
          throw new Error("You need admin access to upload videos.");
        }
        return {
          allowedContentTypes: ["video/mp4", "video/webm", "video/quicktime"],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100 MB
          addRandomSuffix: true,
        };
      },
      // Fires via webhook once the upload finishes. Not called on localhost
      // (no public URL) — that's fine; the browser gets the URL directly.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 }
    );
  }
}
