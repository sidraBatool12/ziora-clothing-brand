"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, SpinnerGap, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type ReviewImage = { url: string; publicId: string };

export function OrderItemReviewForm({
  orderId,
  productId,
  productName,
  onSubmitted,
}: {
  orderId: string;
  productId: string;
  productName: string;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<ReviewImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fileToDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function onPickImages(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setUploading(true);
    try {
      const next: ReviewImage[] = [...images];
      for (const file of Array.from(files).slice(0, 5 - images.length)) {
        if (!file.type.startsWith("image/") || file.size > 8_000_000) {
          throw new Error("Use an image under 8 MB.");
        }
        const dataUrl = await fileToDataUrl(file);
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: dataUrl, folder: "ziora/reviews" }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Upload failed.");
        next.push({ url: data.url, publicId: data.publicId });
      }
      setImages(next);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }
    if (images.length < 1) {
      setError("Please upload at least one product photo.");
      return;
    }

    setSubmitting(true);
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        productId,
        rating,
        comment,
        images,
      }),
    });
    const data = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(data.error || "Could not submit review.");
      return;
    }
    onSubmitted();
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-3 border border-rose/20 bg-rose/[0.03] p-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.16em] text-rose">Required review</p>
        <p className="mt-1 text-sm text-onyx">
          Rate <span className="font-medium">{productName}</span> with stars and a product photo.
        </p>
      </div>

      <div>
        <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-onyx/45">Stars *</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => {
            const active = (hover || rating) >= value;
            return (
              <button
                key={value}
                type="button"
                onMouseEnter={() => setHover(value)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(value)}
                className="p-0.5"
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
              >
                <Star
                  size={26}
                  weight={active ? "fill" : "light"}
                  className={cn(active ? "text-gold" : "text-onyx/25")}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-onyx/45">Product photo *</p>
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={uploading || images.length >= 5}
          onChange={(event) => onPickImages(event.target.files)}
          className="block w-full text-xs text-onyx/60"
        />
        {uploading && (
          <p className="mt-2 flex items-center gap-2 text-xs text-onyx/50">
            <SpinnerGap size={14} className="animate-spin" /> Uploading…
          </p>
        )}
        {images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {images.map((image) => (
              <div key={image.publicId} className="relative h-16 w-16 overflow-hidden bg-mist/60">
                <Image src={image.url} alt="Review" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((current) => current.filter((item) => item.publicId !== image.publicId))}
                  className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center bg-onyx/70 text-white"
                  aria-label="Remove photo"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <label className="block space-y-1.5">
        <span className="text-[10px] uppercase tracking-[0.16em] text-onyx/45">Comment (optional)</span>
        <textarea
          rows={3}
          maxLength={1000}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className="w-full border border-onyx/10 bg-white px-3 py-2 text-sm outline-none focus:border-rose"
          placeholder="How was the fit, fabric, and quality?"
        />
      </label>

      {error && <p className="text-sm text-rose">{error}</p>}

      <button
        type="submit"
        disabled={submitting || uploading}
        className="bg-onyx px-5 py-2.5 text-[10px] uppercase tracking-[0.16em] text-white disabled:opacity-45"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
