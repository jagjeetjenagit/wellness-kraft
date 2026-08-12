"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

// A 9:16 testimonial video picker. Uploads straight to Vercel Blob (so big
// files bypass the serverless body limit) or lets the admin paste a hosted
// link. Empty string = no video. Falls back gracefully when Blob is off.
export default function VideoUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [linkMode, setLinkMode] = useState(false);
  const [link, setLink] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function pick(file: File | undefined) {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setError("Please choose a video file (MP4 or WebM).");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("Video is too large (max 100 MB). Trim it, or paste a hosted link instead.");
      return;
    }
    setBusy(true);
    setProgress(0);
    try {
      const safeName = file.name.replace(/[^a-z0-9.\-]/gi, "_");
      const blob = await upload(`testimonials/${Date.now()}-${safeName}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload/video",
        onUploadProgress: (e) => setProgress(Math.round(e.percentage)),
      });
      onChange(blob.url);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Upload failed. You can paste a hosted video link instead."
      );
    }
    setBusy(false);
  }

  const addLink = () => {
    const u = link.trim();
    if (!u) return;
    onChange(u);
    setLink("");
    setLinkMode(false);
  };

  // Current video preview (portrait 9:16).
  if (value) {
    return (
      <div>
        <div className="relative w-40 overflow-hidden rounded-xl border border-sage/30 bg-charcoal/5">
          <video
            src={value}
            controls
            playsInline
            preload="metadata"
            className="aspect-[9/16] w-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove video"
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-alert text-sm font-bold text-white shadow"
          >
            ×
          </button>
        </div>
        <p className="mt-1.5 text-xs text-sage/70">Portrait 9:16 — how it appears on the site.</p>
      </div>
    );
  }

  return (
    <div>
      {!linkMode ? (
        <div
          onClick={() => !busy && fileRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            busy ? "border-sage/40 opacity-70" : "border-sage/40 hover:border-olive hover:bg-cream"
          }`}
        >
          {busy ? (
            <>
              <p className="text-sm font-semibold text-charcoal">Uploading… {progress}%</p>
              <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-sage/20">
                <div className="h-full bg-olive transition-all" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-olive/60" aria-hidden="true">
                <path d="m10 8 6 4-6 4V8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              <p className="mt-2 text-sm font-semibold text-charcoal">
                Upload a testimonial video, or <span className="text-olive underline">browse</span>
              </p>
              <p className="mt-1 text-xs text-sage/70">
                Portrait 9:16 (like a Reel/Short). MP4 or WebM, up to 100 MB.
              </p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0])}
          />
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Paste a video link (https://…​.mp4)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <button type="button" onClick={addLink} className="btn-secondary shrink-0">
            Add
          </button>
        </div>
      )}

      {!busy && (
        <button
          type="button"
          onClick={() => setLinkMode((v) => !v)}
          className="mt-2 text-xs font-semibold text-sage hover:text-olive"
        >
          {linkMode ? "← Upload a video instead" : "or paste a video link instead"}
        </button>
      )}

      {error && (
        <p className="mt-2 rounded-lg border border-alert/30 bg-alert/10 p-2.5 text-xs font-semibold text-alert">
          {error}
        </p>
      )}
    </div>
  );
}
