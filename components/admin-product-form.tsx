"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Category { _id: string; name: string; }

const inputClass = "w-full border border-onyx/15 px-3 py-2 text-sm outline-none focus-visible:border-gold";

export function AdminProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", slug: "", description: "", sku: "", price: "", discountPrice: "0",
    category: categories[0]?._id || "", productLine: "Everyday", stockQuantity: "10",
    sizes: "", colors: "", fabric: "", thumbnailUrl: "", thumbnailPublicId: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        discountPrice: Number(form.discountPrice),
        stockQuantity: Number(form.stockQuantity),
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setError(data.error || "Failed to create product.");
    router.refresh();
    setForm({ ...form, name: "", slug: "", sku: "", price: "", thumbnailUrl: "", thumbnailPublicId: "" });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <input placeholder="Name" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} required />
      <input placeholder="Slug" value={form.slug} onChange={(e) => update("slug", e.target.value)} className={inputClass} required />
      <input placeholder="SKU" value={form.sku} onChange={(e) => update("sku", e.target.value)} className={inputClass} required />
      <input placeholder="Price (PKR)" type="number" value={form.price} onChange={(e) => update("price", e.target.value)} className={inputClass} required />
      <input placeholder="Discount price (0 = none)" type="number" value={form.discountPrice} onChange={(e) => update("discountPrice", e.target.value)} className={inputClass} />
      <select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputClass}>
        {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
      </select>
      <input placeholder="Product line (e.g. Premium Abayas)" value={form.productLine} onChange={(e) => update("productLine", e.target.value)} className={inputClass} />
      <input placeholder="Stock quantity" type="number" value={form.stockQuantity} onChange={(e) => update("stockQuantity", e.target.value)} className={inputClass} />
      <input placeholder="Sizes (comma separated)" value={form.sizes} onChange={(e) => update("sizes", e.target.value)} className={inputClass} />
      <input placeholder="Colors (comma separated)" value={form.colors} onChange={(e) => update("colors", e.target.value)} className={inputClass} />
      <input placeholder="Fabric" value={form.fabric} onChange={(e) => update("fabric", e.target.value)} className={inputClass} />
      <input placeholder="Thumbnail URL (Cloudinary)" value={form.thumbnailUrl} onChange={(e) => update("thumbnailUrl", e.target.value)} className={`${inputClass} sm:col-span-2`} required />
      <input placeholder="Thumbnail public_id" value={form.thumbnailPublicId} onChange={(e) => update("thumbnailPublicId", e.target.value)} className={`${inputClass} sm:col-span-2`} required />
      <textarea placeholder="Description" value={form.description} onChange={(e) => update("description", e.target.value)} className={`${inputClass} sm:col-span-2`} rows={3} required />
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <button type="submit" disabled={saving} className="bg-onyx px-6 py-2 text-xs uppercase tracking-widest text-white sm:col-span-2">
        {saving ? "Saving…" : "Create Product"}
      </button>
    </form>
  );
}
