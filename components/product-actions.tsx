"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, Check } from "@phosphor-icons/react";
import { useCartStore, useWishlistStore } from "@/store";
import type { ProductLean } from "@/features/products/queries";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function ProductActions({
  product,
  hidePrice = false,
}: {
  product: ProductLean;
  hidePrice?: boolean;
}) {
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
  const price =
    product.discountPrice > 0 && product.discountPrice < product.price
      ? product.discountPrice
      : product.price;

  function handleAddToCart() {
    if (quantity > product.stockQuantity) {
      setStockWarning(
        `Only ${product.stockQuantity} item${product.stockQuantity === 1 ? "" : "s"} available`
      );
      return;
    }
    setStockWarning(null);
    addItem({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: product.thumbnail.url,
      price,
      size,
      color,
      quantity,
      maxStock: product.stockQuantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleBuyNow() {
    if (quantity > product.stockQuantity) {
      setStockWarning(
        `Only ${product.stockQuantity} item${product.stockQuantity === 1 ? "" : "s"} available`
      );
      return;
    }
    handleAddToCart();
    router.push("/checkout");
  }

  return (
    <div className="space-y-7">
      {!hidePrice && <p className="text-2xl tracking-tight text-onyx">{formatPrice(price)}</p>}

      {outOfStock && <p className="text-sm font-medium text-rose">Out of Stock</p>}
      {!outOfStock && product.stockQuantity <= 5 && (
        <p className="text-sm text-rose">Only {product.stockQuantity} left in stock</p>
      )}

      {product.colors.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-onyx/45">Color</p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "border px-3.5 py-2 text-xs transition-all duration-300 active:scale-[0.98]",
                  color === c
                    ? "border-onyx bg-onyx text-white"
                    : "border-onyx/15 hover:border-onyx/40"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.sizes.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-onyx/45">Size</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center border text-xs transition-all duration-300 active:scale-[0.98]",
                  size === s
                    ? "border-onyx bg-onyx text-white"
                    : "border-onyx/15 hover:border-onyx/40"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-onyx/45">Qty</p>
        <div className="flex items-center border border-onyx/15">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-mist/60"
            aria-label="Decrease quantity"
          >
            <Minus size={14} weight="bold" />
          </button>
          <span className="min-w-10 text-center text-sm">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
            className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-mist/60"
            aria-label="Increase quantity"
          >
            <Plus size={14} weight="bold" />
          </button>
        </div>
      </div>

      {stockWarning && <p className="text-sm text-rose">{stockWarning}</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="btn-primary flex-1 disabled:opacity-40"
        >
          {added ? (
            <span className="inline-flex items-center gap-2">
              <Check size={14} weight="bold" /> Added
            </span>
          ) : (
            "Add to Cart"
          )}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="btn-secondary flex-1 disabled:opacity-40"
        >
          Buy Now
        </button>
        <button
          type="button"
          onClick={() => toggleWishlist(product._id)}
          aria-label="Toggle wishlist"
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center border transition-all duration-300 active:scale-[0.98]",
            inWishlist ? "border-rose bg-rose/5 text-rose" : "border-onyx/15 text-onyx/60 hover:border-onyx"
          )}
        >
          <Heart size={18} weight={inWishlist ? "fill" : "light"} />
        </button>
      </div>
    </div>
  );
}
