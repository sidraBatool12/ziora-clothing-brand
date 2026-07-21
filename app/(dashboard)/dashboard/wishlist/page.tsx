"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store";
import { formatPrice } from "@/lib/utils";
import type { ProductLean } from "@/features/products/queries";

export default function WishlistPage() {
  const [products, setProducts] = useState<ProductLean[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  async function load() {
    const res = await fetch("/api/wishlist");
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function remove(productId: string) {
    await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setProducts((p) => p.filter((x) => x._id !== productId));
  }

  if (loading) return <p className="text-onyx/60">Loading your wishlist…</p>;
  if (products.length === 0) return <p className="text-onyx/60">Your wishlist is empty. Save pieces you love while you shop.</p>;

  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
      {products.map((p) => (
        <div key={p._id} className="group">
          <Link href={`/product/${p.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-beige/40">
            <Image src={p.thumbnail.url} alt={p.name} fill className="object-cover" />
          </Link>
          <p className="mt-2 text-sm">{p.name}</p>
          <p className="text-sm text-gold">{formatPrice(p.discountPrice > 0 ? p.discountPrice : p.price)}</p>
          <div className="mt-2 flex gap-2 text-xs">
            <button
              onClick={() =>
                addItem({
                  productId: p._id, name: p.name, slug: p.slug, image: p.thumbnail.url,
                  price: p.discountPrice > 0 ? p.discountPrice : p.price,
                  size: p.sizes[0] || "", color: p.colors[0] || "", quantity: 1,
                  maxStock: p.stockQuantity,
                })
              }
              className="underline"
            >
              Move to Bag
            </button>
            <button onClick={() => remove(p._id)} className="text-onyx/50 underline">Remove</button>
          </div>
        </div>
      ))}
    </div>
  );
}
