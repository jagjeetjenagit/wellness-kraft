"use client";

import { useCallback, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { getCroppedBlob } from "@/lib/crop-image";

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Drag-and-drop image picker with a fixed-ratio crop step. Produces a
// uniform square image, uploads it to Vercel Blob via /api/upload, and
// stores the returned URL. Falls back to pasting a link if uploads aren't
// configured, so the admin is never stuck.
export default function ImageUploader({
  value,
  onChange,
  folder,
  max = 1,
  outSize = 800,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: string;
  max?: number;
  outSize?: number;
}) {
  const [src, setSrc] = useState<string | null>(null); // image being cropped
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [linkMode, setLinkMode] = useState(false);
  const [link, setLink] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const full = value.length >= max;

  const pickFile = (file: File | undefined) => {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_a: Area, pixels: Area) => setAreaPixels(pixels), []);

  const confirmCrop = async () => {
    if (!src || !areaPixels) return;
    setBusy(true);
    setError("");
    try {
      const blob = await getCroppedBlob(src, areaPixels, outSize);
      const fd = new FormData();
      fd.append("file", blob, "image.jpg");
      fd.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed. Please try again.");
      onChange([...value, data.url].slice(0, max));
      setSrc(null);
      setAreaPixels(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    }
    setBusy(false);
  };

  const remove = (url: string) => onChange(value.filter((u) => u !== url));

  const addLink = () => {
    const u = link.trim();
    if (!u) return;
    onChange([...value, u].slice(0, max));
    setLink("");
    setLinkMode(false);
  };

  return (
    <div>
      {/* Current images */}
      {value.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3">
          {value.map((url, i) => (
            <div key={url + i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Image ${i + 1}`}
                className="h-20 w-20 rounded-lg border border-sage/30 object-cover"
              />
              {i === 0 && max > 1 && (
                <span className="absolute left-1 top-1 rounded bg-olive px-1.5 py-0.5 text-[10px] font-bold text-white">
                  Main
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(url)}
                aria-label="Remove image"
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-alert text-sm font-bold text-white shadow"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {!full && !linkMode && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            pickFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => fileRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            dragOver ? "border-olive bg-soft-cream" : "border-sage/40 hover:border-olive hover:bg-cream"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-olive/60" aria-hidden="true">
            <path d="M12 16V4m0 0L8 8m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-2 text-sm font-semibold text-charcoal">
            Drag &amp; drop a photo, or <span className="text-olive underline">browse</span>
          </p>
          <p className="mt-1 text-xs text-sage/70">
            You&apos;ll crop it to a {outSize}×{outSize} square. {max > 1 ? `Up to ${max} photos.` : ""}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
        </div>
      )}

      {/* Link fallback */}
      {!full && linkMode && (
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Paste an image link (https://…)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <button type="button" onClick={addLink} className="btn-secondary shrink-0">Add</button>
        </div>
      )}

      {!full && (
        <button
          type="button"
          onClick={() => setLinkMode((v) => !v)}
          className="mt-2 text-xs font-semibold text-sage hover:text-olive"
        >
          {linkMode ? "← Upload a photo instead" : "or paste an image link instead"}
        </button>
      )}

      {error && !src && (
        <p className="mt-2 rounded-lg border border-alert/30 bg-alert/10 p-2.5 text-xs font-semibold text-alert">
          {error}
        </p>
      )}

      {/* Crop modal */}
      {src && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-cream p-5 shadow-lift">
            <h3 className="font-display text-lg font-semibold">Crop your photo</h3>
            <p className="mt-1 text-xs text-sage/70">
              Drag to reposition, pinch or use the slider to zoom.
            </p>
            <div className="relative mt-4 h-72 w-full overflow-hidden rounded-xl bg-charcoal/10">
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <label className="mt-4 block text-xs font-semibold text-sage">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-olive"
            />
            {error && (
              <p className="mt-2 rounded-lg border border-alert/30 bg-alert/10 p-2.5 text-xs font-semibold text-alert">
                {error}
              </p>
            )}
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={confirmCrop} disabled={busy} className="btn-primary">
                {busy ? "Uploading…" : "Crop & upload"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSrc(null);
                  setError("");
                }}
                disabled={busy}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
