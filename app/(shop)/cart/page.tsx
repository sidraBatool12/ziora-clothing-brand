"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash } from "@phosphor-icons/react";
import { useCartStore } from "@/store";
import { formatPrice } from "@/lib/utils";
import { useStoreSettings } from "@/hooks/use-store-settings";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();
  const storeSettings = useStoreSettings();

  if (items.length === 0) {
    return (
      <main className="page-shell py-28 text-center md:py-36">
        <p className="eyebrow mb-3">Cart</p>
        <h1 className="text-4xl tracking-tight text-onyx">Your bag is empty</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-onyx/55">
          Browse the latest ready-to-wear and save pieces you want to wear next.
        </p>
        <Link href="/shop" className="btn-primary mt-8 inline-flex">
          Continue Shopping
        </Link>
      </main>
    );
  }

  const sub = subtotal();
  const shipping =
    sub >= storeSettings.freeShippingThreshold ? 0 : storeSettings.shippingFee;
  const total = sub + shipping;

  return (
    <main className="page-shell py-12 md:py-16">
      <div className="mb-10 border-b border-onyx/10 pb-6">
        <p className="eyebrow mb-2">Cart</p>
        <h1 className="text-4xl tracking-tight text-onyx">Shopping Bag</h1>
      </div>

      <div className="grid gap-12 lg:grid-cols-12">
        <div className="space-y-0 divide-y divide-onyx/10 lg:col-span-8">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}-${item.color}`}
              className="flex gap-4 py-6 first:pt-0"
            >
              <Link
                href={`/product/${item.slug}`}
                className="relative h-32 w-24 shrink-0 overflow-hidden bg-mist/50 sm:h-36 sm:w-28"
              >
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="112px" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-sm tracking-tight text-onyx transition-colors hover:text-rose"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-onyx/45">
                      {item.color} / {item.size}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-onyx">{formatPrice(item.price)}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center border border-onyx/15">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.size, item.color, item.quantity - 1)
                      }
                      className="flex h-9 w-9 items-center justify-center"
                      aria-label="Decrease"
                    >
                      <Minus size={12} weight="bold" />
                    </button>
                    <span className="min-w-8 text-center text-xs">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.size, item.color, item.quantity + 1)
                      }
                      className="flex h-9 w-9 items-center justify-center"
                      aria-label="Increase"
                    >
                      <Plus size={12} weight="bold" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.size, item.color)}
                    className="inline-flex items-center gap-1.5 text-xs text-onyx/45 transition-colors hover:text-rose"
                  >
                    <Trash size={14} weight="light" />
                    Remove
                  </button>
                </div>
                {item.quantity >= item.maxStock && (
                  <p className="mt-2 text-xs text-rose">Only {item.maxStock} available</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4">
          <div className="border border-onyx/10 bg-white p-6 md:sticky md:top-28 md:p-8">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-onyx/40">Order Summary</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-onyx/70">
                <span>Subtotal</span>
                <span>{formatPrice(sub)}</span>
              </div>
              <div className="flex justify-between text-onyx/70">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-onyx/10 pt-4 text-base font-medium text-onyx">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Link href="/checkout" className="btn-primary mt-7 w-full">
              Proceed to Checkout
            </Link>
            <Link href="/shop" className="btn-ghost mt-4 w-full">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
