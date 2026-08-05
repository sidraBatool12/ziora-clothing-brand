"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Check,
  ImageSquare,
  Plus,
  SpinnerGap,
  Star,
  X,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface UploadedImage {
  url: string;
  publicId: string;
  alt?: string;
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  sku: "",
  barcode: "",
  brand: "ZIORA",
  price: "",
  discountPrice: "",
  costPrice: "",
  category: "",
  productLine: "Everyday",
  stockQuantity: "10",
  lowStockThreshold: "5",
  sizes: "",
  colors: "",
  material: "",
  fabric: "",
  careInstructions: "",
  tags: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  publishStatus: "published",
  isFeatured: false,
  isNewArrival: false,
  isTrending: false,
  isBestSeller: false,
};

const fieldClass =
  "w-full rounded-xl bg-white px-3.5 py-3 text-sm text-onyx outline-none ring-1 ring-inset ring-onyx/10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] placeholder:text-onyx/28 focus:ring-rose/55";

function FieldLabel({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <span className="flex items-center justify-between text-[10px] uppercase tracking-[0.17em] text-onyx/43">
      {children}
      {optional && <span className="normal-case tracking-normal text-onyx/25">Optional</span>}
    </span>
  );
}

function commaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AdminProductForm({ categories: initialCategories }: { categories: Category[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ ...emptyForm, category: initialCategories[0]?._id || "" });
  const [categories, setCategories] = useState(initialCategories);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [newCollection, setNewCollection] = useState("");
  const [collectionBusy, setCollectionBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  function update(field: keyof typeof emptyForm, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateName(name: string) {
    setForm((current) => ({
      ...current,
      name,
      slug: slugTouched ? current.slug : slugify(name),
    }));
  }

  async function addCollection() {
    const name = newCollection.trim();
    if (name.length < 2) return;
    setCollectionBusy(true);
    setError(null);

    const response = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: slugify(name) }),
    });
    const data = await response.json();
    setCollectionBusy(false);

    if (!response.ok) {
      setError(data.error || "Collection could not be created.");
      return;
    }

    const category = JSON.parse(JSON.stringify(data.category)) as Category;
    setCategories((current) => [...current, category].sort((a, b) => a.name.localeCompare(b.name)));
    update("category", category._id);
    setNewCollection("");
  }

  async function uploadFiles(files: FileList | File[]) {
    const selected = Array.from(files);
    if (!selected.length) return;
    if (images.length + selected.length > 12) {
      setError("A clothing card can contain up to 12 images.");
      return;
    }
    const invalid = selected.find(
      (file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8_000_000
    );
    if (invalid) {
      setError("Use JPG, PNG or WebP images smaller than 8 MB.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const uploaded: UploadedImage[] = [];
      for (const file of selected) {
        const fileData = await readFile(file);
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: fileData, folder: "ziora/products" }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Image upload failed.");
        uploaded.push({ url: data.url, publicId: data.publicId, alt: form.name || file.name });
      }
      setImages((current) => [...current, ...uploaded]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
    setThumbnailIndex((current) => {
      if (index === current) return 0;
      return index < current ? current - 1 : current;
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.category) {
      setError("Create or select a collection.");
      return;
    }
    if (!images.length) {
      setError("Upload at least one clothing image.");
      return;
    }

    setSaving(true);
    const thumbnail = images[thumbnailIndex] || images[0];
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        discountPrice: Number(form.discountPrice || 0),
        costPrice: form.costPrice ? Number(form.costPrice) : undefined,
        stockQuantity: Number(form.stockQuantity),
        lowStockThreshold: Number(form.lowStockThreshold),
        sizes: commaList(form.sizes),
        colors: commaList(form.colors),
        tags: commaList(form.tags),
        seoKeywords: commaList(form.seoKeywords),
        thumbnailUrl: thumbnail.url,
        thumbnailPublicId: thumbnail.publicId,
        images: images.map((image, index) => ({ ...image, sortOrder: index })),
      }),
    });
    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(data.error || "Clothing card could not be created.");
      return;
    }

    setSuccess(`${form.name} was added to the storefront.`);
    setForm({ ...emptyForm, category: categories[0]?._id || "" });
    setImages([]);
    setThumbnailIndex(0);
    setSlugTouched(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-8">
          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-rose">01 · Essentials</p>
                <h3 className="mt-1 text-lg font-medium tracking-tight">Clothing details</h3>
              </div>
              <p className="hidden text-[11px] text-onyx/35 sm:block">Fields marked by the form are required</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <FieldLabel>Clothing name</FieldLabel>
                <input
                  required
                  value={form.name}
                  onChange={(event) => updateName(event.target.value)}
                  className={fieldClass}
                  placeholder="Noor embroidered abaya"
                />
              </label>
              <label className="space-y-2">
                <FieldLabel>Storefront slug</FieldLabel>
                <input
                  required
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    update("slug", slugify(event.target.value));
                  }}
                  className={fieldClass}
                  placeholder="noor-embroidered-abaya"
                />
              </label>
              <label className="space-y-2">
                <FieldLabel>SKU</FieldLabel>
                <input
                  required
                  value={form.sku}
                  onChange={(event) => update("sku", event.target.value.toUpperCase())}
                  className={fieldClass}
                  placeholder="ZIO-ABA-014"
                />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <FieldLabel>Short description</FieldLabel>
                <input
                  value={form.shortDescription}
                  onChange={(event) => update("shortDescription", event.target.value)}
                  className={fieldClass}
                  placeholder="A concise line shown beneath the clothing title"
                />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <FieldLabel>Description</FieldLabel>
                <textarea
                  required
                  rows={5}
                  value={form.description}
                  onChange={(event) => update("description", event.target.value)}
                  className={`${fieldClass} resize-y leading-relaxed`}
                  placeholder="Describe the silhouette, construction and details..."
                />
              </label>
            </div>
          </section>

          <div className="h-px bg-onyx/[0.07]" />

          <section>
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-rose">02 · Commerce</p>
              <h3 className="mt-1 text-lg font-medium tracking-tight">Pricing and inventory</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="space-y-2">
                <FieldLabel>Price · PKR</FieldLabel>
                <input required min="1" type="number" value={form.price} onChange={(e) => update("price", e.target.value)} className={fieldClass} />
              </label>
              <label className="space-y-2">
                <FieldLabel optional>Sale price</FieldLabel>
                <input min="0" type="number" value={form.discountPrice} onChange={(e) => update("discountPrice", e.target.value)} className={fieldClass} />
              </label>
              <label className="space-y-2">
                <FieldLabel optional>Cost price</FieldLabel>
                <input min="0" type="number" value={form.costPrice} onChange={(e) => update("costPrice", e.target.value)} className={fieldClass} />
              </label>
              <label className="space-y-2">
                <FieldLabel>Stock</FieldLabel>
                <input required min="0" type="number" value={form.stockQuantity} onChange={(e) => update("stockQuantity", e.target.value)} className={fieldClass} />
              </label>
              <label className="space-y-2">
                <FieldLabel>Low-stock alert</FieldLabel>
                <input required min="0" type="number" value={form.lowStockThreshold} onChange={(e) => update("lowStockThreshold", e.target.value)} className={fieldClass} />
              </label>
              <label className="space-y-2">
                <FieldLabel optional>Barcode</FieldLabel>
                <input value={form.barcode} onChange={(e) => update("barcode", e.target.value)} className={fieldClass} />
              </label>
              <label className="space-y-2">
                <FieldLabel optional>Sizes</FieldLabel>
                <input value={form.sizes} onChange={(e) => update("sizes", e.target.value)} className={fieldClass} placeholder="XS, S, M, L" />
              </label>
              <label className="space-y-2">
                <FieldLabel optional>Colors</FieldLabel>
                <input value={form.colors} onChange={(e) => update("colors", e.target.value)} className={fieldClass} placeholder="Ivory, Sand, Onyx" />
              </label>
              <label className="space-y-2">
                <FieldLabel optional>Fabric</FieldLabel>
                <input value={form.fabric} onChange={(e) => update("fabric", e.target.value)} className={fieldClass} placeholder="Nida crepe" />
              </label>
            </div>
          </section>

          <div className="h-px bg-onyx/[0.07]" />

          <section>
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-rose">03 · Placement</p>
              <h3 className="mt-1 text-lg font-medium tracking-tight">Collection and visibility</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <FieldLabel>Collection</FieldLabel>
                <select
                  required
                  value={form.category}
                  onChange={(event) => update("category", event.target.value)}
                  className={fieldClass}
                >
                  <option value="">Choose a collection</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <FieldLabel>Publication</FieldLabel>
                <select value={form.publishStatus} onChange={(e) => update("publishStatus", e.target.value)} className={fieldClass}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="hidden">Hidden</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <div className="space-y-2 sm:col-span-2">
                <FieldLabel>Create collection</FieldLabel>
                <div className="flex gap-2">
                  <input
                    value={newCollection}
                    onChange={(event) => setNewCollection(event.target.value)}
                    className={fieldClass}
                    placeholder="Ramadan Edit"
                  />
                  <button
                    type="button"
                    disabled={collectionBusy || newCollection.trim().length < 2}
                    onClick={addCollection}
                    className="flex shrink-0 items-center gap-2 rounded-xl bg-onyx px-4 text-xs text-white transition-transform active:scale-[0.98] disabled:opacity-35"
                  >
                    {collectionBusy ? <SpinnerGap size={15} className="animate-spin" /> : <Plus size={15} />}
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {[
                ["isFeatured", "Featured", "Place in the featured edit"],
                ["isNewArrival", "New arrival", "Show in new arrivals"],
                ["isTrending", "Trending", "Mark as currently trending"],
                ["isBestSeller", "Best seller", "Show the best-seller badge"],
              ].map(([field, label, description]) => {
                const checked = form[field as keyof typeof form] as boolean;
                return (
                  <label
                    key={field}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl p-3.5 ring-1 ring-inset transition-all duration-300",
                      checked ? "bg-rose/[0.06] ring-rose/20" : "bg-white ring-onyx/[0.08]"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => update(field as keyof typeof emptyForm, event.target.checked)}
                      className="sr-only"
                    />
                    <span className={cn("flex h-5 w-5 items-center justify-center rounded-md", checked ? "bg-rose text-white" : "bg-onyx/[0.06] text-transparent")}>
                      <Check size={12} weight="bold" />
                    </span>
                    <span>
                      <span className="block text-xs font-medium">{label}</span>
                      <span className="block text-[10px] text-onyx/38">{description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-[1.75rem] bg-onyx/[0.035] p-1.5 ring-1 ring-inset ring-onyx/[0.05]">
            <div className="rounded-[calc(1.75rem-0.375rem)] bg-white p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-rose">04 · Gallery</p>
                  <h3 className="mt-1 text-base font-medium">Clothing images</h3>
                </div>
                <span className="text-[11px] text-onyx/35">{images.length}/12</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                onChange={(event) => event.target.files && uploadFiles(event.target.files)}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || images.length >= 12}
                className="mt-4 flex w-full flex-col items-center justify-center rounded-2xl bg-[#F5F3EF] px-4 py-8 text-center ring-1 ring-inset ring-onyx/[0.07] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#EFEBE5] active:scale-[0.99] disabled:opacity-45"
              >
                {uploading ? (
                  <SpinnerGap size={25} weight="light" className="animate-spin text-rose" />
                ) : (
                  <ImageSquare size={27} weight="light" className="text-rose" />
                )}
                <span className="mt-3 text-xs font-medium">{uploading ? "Uploading images" : "Choose multiple images"}</span>
                <span className="mt-1 text-[10px] text-onyx/35">JPG, PNG or WebP · 8 MB each</span>
              </button>

              <AnimatePresence initial={false}>
                {images.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 grid grid-cols-3 gap-2"
                  >
                    {images.map((image, index) => (
                      <motion.div layout key={image.publicId} className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-beige">
                        <Image src={image.url} alt={image.alt || "Clothing"} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => setThumbnailIndex(index)}
                          className={cn(
                            "absolute bottom-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full backdrop-blur-md",
                            thumbnailIndex === index ? "bg-rose text-white" : "bg-white/80 text-onyx/55"
                          )}
                          aria-label="Use as cover image"
                        >
                          <Star size={12} weight={thumbnailIndex === index ? "fill" : "light"} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-onyx/65 text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100"
                          aria-label="Remove image"
                        >
                          <X size={12} />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              {images.length > 0 && (
                <p className="mt-3 text-[10px] leading-relaxed text-onyx/38">
                  Select the star on an image to use it as the storefront cover.
                </p>
              )}
            </div>
          </section>

          <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-inset ring-onyx/[0.07]">
            <label className="space-y-2">
              <FieldLabel optional>Material</FieldLabel>
              <input value={form.material} onChange={(e) => update("material", e.target.value)} className={fieldClass} placeholder="Polyester blend" />
            </label>
            <label className="space-y-2">
              <FieldLabel optional>Care instructions</FieldLabel>
              <textarea rows={3} value={form.careInstructions} onChange={(e) => update("careInstructions", e.target.value)} className={`${fieldClass} resize-y`} />
            </label>
            <label className="space-y-2">
              <FieldLabel optional>Tags</FieldLabel>
              <input value={form.tags} onChange={(e) => update("tags", e.target.value)} className={fieldClass} placeholder="occasion, modest, embroidered" />
            </label>
          </section>
        </aside>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="rounded-xl bg-rose/[0.07] px-4 py-3 text-sm text-rose ring-1 ring-inset ring-rose/15"
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            key="success"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-emerald-700/[0.07] px-4 py-3 text-sm text-emerald-800 ring-1 ring-inset ring-emerald-700/15"
          >
            {success}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex justify-end border-t border-onyx/[0.07] pt-6">
        <button
          type="submit"
          disabled={saving || uploading}
          className="group flex min-w-56 items-center justify-between rounded-full bg-onyx py-1.5 pl-6 pr-1.5 text-xs uppercase tracking-[0.15em] text-white transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#272724] active:scale-[0.98] disabled:opacity-45"
        >
          <span>{saving ? "Creating card" : "Add clothing card"}</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
            {saving ? <SpinnerGap size={16} className="animate-spin" /> : <Plus size={16} />}
          </span>
        </button>
      </div>
    </form>
  );
}
