"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlass,
  Package,
  Sparkle,
  Star,
  Trash,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ClothingItem {
  _id: string;
  name: string;
  sku: string;
  price: number;
  discountPrice: number;
  stockQuantity: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  publishStatus: string;
  thumbnail: { url: string };
  category?: { _id: string; name: string } | null;
}

export function ClothingCatalog({ products }: { products: ClothingItem[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search) ||
        product.category?.name.toLowerCase().includes(search);
      const matchesFilter =
        filter === "all" ||
        (filter === "featured" && product.isFeatured) ||
        (filter === "new" && product.isNewArrival) ||
        (filter === "low" && product.stockQuantity > 0 && product.stockQuantity <= 5) ||
        (filter === "out" && product.stockQuantity === 0) ||
        product.publishStatus === filter;
      return matchesSearch && matchesFilter;
    });
  }, [filter, products, query]);

  async function patchProduct(id: string, patch: Record<string, unknown>) {
    setBusyId(id);
    setError(null);
    const response = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await response.json();
    setBusyId(null);
    if (!response.ok) {
      setError(data.error || "Clothing card could not be updated.");
      return;
    }
    router.refresh();
  }

  async function deleteProduct(id: string) {
    setBusyId(id);
    setError(null);
    const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    const data = await response.json();
    setBusyId(null);
    setDeleteId(null);
    if (!response.ok) {
      setError(data.error || "Clothing card could not be deleted.");
      return;
    }
    router.refresh();
  }

  return (
    <section>
      <div className="flex flex-col gap-3 border-y border-onyx/[0.07] py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-md">
          <MagnifyingGlass size={17} weight="light" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-onyx/35" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search clothing, SKU or collection"
            className="w-full rounded-full bg-white py-3 pl-10 pr-4 text-sm outline-none ring-1 ring-inset ring-onyx/[0.08] placeholder:text-onyx/30 focus:ring-rose/45"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 lg:pb-0">
          {[
            ["all", "All"],
            ["published", "Published"],
            ["draft", "Draft"],
            ["featured", "Featured"],
            ["new", "New"],
            ["low", "Low stock"],
            ["out", "Sold out"],
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-[10px] uppercase tracking-[0.12em] transition-all active:scale-[0.98]",
                filter === value ? "bg-onyx text-white" : "bg-white text-onyx/50 ring-1 ring-inset ring-onyx/[0.07]"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-rose/[0.07] px-4 py-3 text-sm text-rose ring-1 ring-inset ring-rose/15">
          {error}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-onyx/[0.05] text-onyx/35">
            <Package size={22} weight="light" />
          </span>
          <p className="mt-4 text-sm font-medium">No clothing cards found</p>
          <p className="mt-1 text-xs text-onyx/38">Adjust the search or add a card above.</p>
        </div>
      ) : (
        <div className="mt-5 divide-y divide-onyx/[0.07]">
          {filtered.map((product, index) => (
            <motion.article
              key={product._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.025, 0.2), duration: 0.4 }}
              className="grid grid-cols-[4.25rem_1fr] gap-4 py-4 sm:grid-cols-[4.75rem_1fr_auto] sm:items-center"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-beige">
                <Image src={product.thumbnail.url} alt={product.name} fill className="object-cover" sizes="76px" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-medium">{product.name}</h3>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-[8px] uppercase tracking-[0.12em]",
                      product.publishStatus === "published"
                        ? "bg-emerald-700/[0.08] text-emerald-800"
                        : "bg-onyx/[0.06] text-onyx/45"
                    )}
                  >
                    {product.publishStatus}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-onyx/38">
                  {product.sku} · {product.category?.name || "Unassigned"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <span className="font-medium">PKR {(product.discountPrice || product.price).toLocaleString()}</span>
                  <span className={cn(product.stockQuantity <= 5 ? "text-rose" : "text-onyx/42")}>
                    {product.stockQuantity} in stock
                  </span>
                </div>
              </div>

              <div className="col-span-2 flex items-center justify-end gap-1.5 sm:col-span-1">
                <button
                  type="button"
                  disabled={busyId === product._id}
                  onClick={() => patchProduct(product._id, { isFeatured: !product.isFeatured })}
                  className={cn(
                    "flex h-9 items-center gap-1.5 rounded-full px-3 text-[10px] transition-all active:scale-[0.97]",
                    product.isFeatured ? "bg-rose/10 text-rose" : "bg-white text-onyx/38 ring-1 ring-inset ring-onyx/[0.08]"
                  )}
                  aria-label="Toggle featured"
                >
                  <Star size={13} weight={product.isFeatured ? "fill" : "light"} />
                  Featured
                </button>
                <button
                  type="button"
                  disabled={busyId === product._id}
                  onClick={() => patchProduct(product._id, { isNewArrival: !product.isNewArrival })}
                  className={cn(
                    "flex h-9 items-center gap-1.5 rounded-full px-3 text-[10px] transition-all active:scale-[0.97]",
                    product.isNewArrival ? "bg-onyx text-white" : "bg-white text-onyx/38 ring-1 ring-inset ring-onyx/[0.08]"
                  )}
                  aria-label="Toggle new arrival"
                >
                  <Sparkle size={13} weight={product.isNewArrival ? "fill" : "light"} />
                  New
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(product._id)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-onyx/30 ring-1 ring-inset ring-onyx/[0.08] transition-colors hover:bg-rose/[0.07] hover:text-rose"
                  aria-label={`Delete ${product.name}`}
                >
                  <Trash size={14} weight="light" />
                </button>
              </div>

              <AnimatePresence>
                {deleteId === product._id && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="col-span-2 flex flex-col gap-3 rounded-xl bg-rose/[0.06] p-3 ring-1 ring-inset ring-rose/15 sm:col-span-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <p className="text-xs text-rose">Delete this card and its Cloudinary images permanently?</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setDeleteId(null)} className="rounded-full px-3 py-2 text-[10px] text-onyx/50">
                        Keep card
                      </button>
                      <button
                        type="button"
                        disabled={busyId === product._id}
                        onClick={() => deleteProduct(product._id)}
                        className="rounded-full bg-rose px-4 py-2 text-[10px] text-white disabled:opacity-50"
                      >
                        Delete permanently
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
}
