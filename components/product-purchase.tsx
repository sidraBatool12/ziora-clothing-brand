"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, Heart, Minus, Plus } from "@phosphor-icons/react";
import type { ProductLean } from "@/features/products/queries";
import { resolveUnitPrice } from "@/lib/pricing";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore, useWishlistStore } from "@/store";

function galleryFor(product: ProductLean) {
  const images = [...(product.images || [])];
  if (product.thumbnail?.publicId) {
    const exists = images.some((image) => image.publicId === product.thumbnail.publicId);
    if (!exists) images.unshift(product.thumbnail);
  }
  return images;
}

export function ProductPurchase({ product }: { product: ProductLean }) {
  const router = useRouter();
  const { status } = useSession();
  const gallery = useMemo(() => galleryFor(product), [product]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [size, setSize] = useState(product.sizes[0] || "One Size");
  const [color, setColor] = useState(product.colors[0] || "Default");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [stockWarning, setStockWarning] = useState<string | null>(null);
  const [wishlistBusy, setWishlistBusy] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.has(product._id));

  const activeImage = gallery[activeIndex] || product.thumbnail;
  const unitPrice = resolveUnitPrice(product, {
    size,
    imagePublicId: activeImage?.publicId,
  });
  const basePrice = product.price;
  const showCompare = unitPrice < basePrice;
  const outOfStock = product.stockQuantity <= 0;

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
      image: activeImage.url,
      imagePublicId: activeImage.publicId,
      price: unitPrice,
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

  async function handleWishlistToggle() {
    if (wishlistBusy) return;
    if (status !== "authenticated") {
      router.push(`/login?redirect=/product/${product.slug}`);
      return;
    }
    setWishlistBusy(true);
    toggleWishlist(product._id);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id }),
      });
      if (!res.ok) toggleWishlist(product._id);
    } catch {
      toggleWishlist(product._id);
    } finally {
      setWishlistBusy(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-7">
        <div className="space-y-3">
          <div className="relative aspect-[3/4] overflow-hidden bg-mist/50">
            <Image
              src={activeImage.url}
              alt={activeImage.alt || product.name}
              fill
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
            {showCompare && (
              <span className="absolute left-4 top-4 bg-onyx px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white">
                Sale
              </span>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-2 md:gap-3">
              {gallery.map((img, i) => (
                <button
                  key={img.publicId}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "relative aspect-square overflow-hidden bg-mist/50 ring-1 ring-inset transition-all",
                    i === activeIndex ? "ring-onyx" : "ring-transparent hover:ring-onyx/25"
                  )}
                  aria-label={`View image ${i + 1}`}
                >
                  <Image src={img.url} alt={img.alt || product.name} fill sizes="15vw" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-5 lg:pt-4">
        <p className="eyebrow mb-3">{product.productLine || "ZIORA"}</p>
        <h1 className="text-3xl tracking-tight text-onyx md:text-4xl">{product.name}</h1>
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-xl font-medium text-onyx transition-colors duration-300">
            {formatPrice(unitPrice)}
          </span>
          {showCompare && (
            <span className="text-sm text-onyx/35 line-through">{formatPrice(basePrice)}</span>
          )}
        </div>
        <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-onyx/40">
          Price updates with selected image and size
        </p>
        <p className="mt-5 max-w-[48ch] text-sm leading-relaxed text-onyx/65">{product.description}</p>

        <div className="mt-8 space-y-7">
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
                      color === c ? "border-onyx bg-onyx text-white" : "border-onyx/15 hover:border-onyx/40"
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
                {product.sizes.map((s) => {
                  const sizedPrice = resolveUnitPrice(product, {
                    size: s,
                    imagePublicId: activeImage?.publicId,
                  });
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={cn(
                        "min-w-10 border px-2.5 py-2 text-xs transition-all duration-300 active:scale-[0.98]",
                        size === s ? "border-onyx bg-onyx text-white" : "border-onyx/15 hover:border-onyx/40"
                      )}
                      title={formatPrice(sizedPrice)}
                    >
                      <span className="block">{s}</span>
                      <span className={cn("mt-0.5 block text-[9px]", size === s ? "text-white/70" : "text-onyx/40")}>
                        {formatPrice(sizedPrice)}
                      </span>
                    </button>
                  );
                })}
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
              onClick={handleWishlistToggle}
              disabled={wishlistBusy}
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

        {(product.fabric || product.careInstructions) && (
          <div className="mt-10 space-y-3 border-t border-onyx/10 pt-8 text-sm text-onyx/65">
            {product.fabric && (
              <p>
                <span className="text-[10px] uppercase tracking-[0.16em] text-onyx/40">Fabric</span>
                <span className="mt-1 block text-onyx/100">{product.fabric}</span>
              </p>
            )}
            {product.careInstructions && (
              <p>
                <span className="text-[10px] uppercase tracking-[0.16em] text-onyx/40">Care</span>
                <span className="mt-1 block text-onyx/100">{product.careInstructions}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
