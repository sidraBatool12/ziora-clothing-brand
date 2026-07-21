"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, useWishlistStore } from "@/store";
import type { ProductLean } from "@/features/products/queries";
import { formatPrice } from "@/lib/utils";

export function ProductActions({ product }: { product: ProductLean }) {
  const router = useRouter();
  const [size, setSize] = useState(product.sizes[0] || "");
  const [color, setColor] = useState(product.colors[0] || "");
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.has(product._id));
  const [added, setAdded] = useState(false);
  const [stockWarning, setStockWarning] = useState<string | null>(null);

  const outOfStock = product.stockQuantity <= 0;
  const price = product.discountPrice > 0 && product.discountPrice < product.price ? product.discountPrice : product.price;

  function handleAddToCart() {
    if (quantity > product.stockQuantity) {
      setStockWarning(`Only ${product.stockQuantity} item${product.stockQuantity === 1 ? "" : "s"} available`);
      return;
    }
    setStockWarning(null);
    addItem({
      productId: product._id, name: product.name, slug: product.slug, image: product.thumbnail.url,
      price, size, color, quantity, maxStock: product.stockQuantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleBuyNow() {
    if (quantity > product.stockQuantity) {
      setStockWarning(`Only ${product.stockQuantity} item${product.stockQuantity === 1 ? "" : "s"} available`);
      return;
    }
    handleAddToCart();
    router.push("/checkout");
  }

  return (
    <div className="space-y-6">
      <p className="text-2xl text-onyx">{formatPrice(price)}</p>

      {outOfStock && <p className="text-sm font-medium text-red-600">Out of Stock</p>}
      {!outOfStock && product.stockQuantity <= 5 && <p className="text-sm text-gold">Only {product.stockQuantity} left in stock</p>}

      {product.colors.length > 0 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-onyx/60">Color</p>
          <div className="flex gap-2">
            {product.colors.map((c) => (
              <button key={c} onClick={() => setColor(c)} className={`border px-3 py-1.5 text-xs ${color === c ? "border-gold text-gold" : "border-onyx/20"}`}>{c}</button>
            ))}
          </div>
        </div>
      )}

      {product.sizes.length > 0 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-onyx/60">Size</p>
          <div className="flex gap-2">
            {product.sizes.map((s) => (
              <button key={s} onClick={() => setSize(s)} className={`h-9 w-9 border text-xs ${size === s ? "border-gold text-gold" : "border-onyx/20"}`}>{s}</button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <p className="text-xs uppercase tracking-widest text-onyx/60">Qty</p>
        <div className="flex items-center border border-onyx/20">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-1.5">−</button>
          <span className="px-4 text-sm">{quantity}</span>
          <button onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))} className="px-3 py-1.5">+</button>
        </div>
      </div>

      {stockWarning && <p className="text-sm text-red-600">{stockWarning}</p>}

      <div className="flex gap-3">
        <button onClick={handleAddToCart} disabled={outOfStock} className="flex-1 bg-onyx py-3 text-xs uppercase tracking-widest text-white hover:bg-onyx/90 disabled:opacity-40">
          {added ? "Added ✓" : "Add to Cart"}
        </button>
        <button onClick={handleBuyNow} disabled={outOfStock} className="flex-1 border border-onyx py-3 text-xs uppercase tracking-widest hover:border-gold hover:text-gold disabled:opacity-40">
          Buy Now
        </button>
        <button onClick={() => toggleWishlist(product._id)} aria-label="Toggle wishlist" className={`border px-4 ${inWishlist ? "border-gold text-gold" : "border-onyx/20"}`}>♥</button>
      </div>
    </div>
  );
}
