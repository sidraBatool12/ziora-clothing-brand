"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-3xl text-onyx">Your Cart is Empty</h1>
        <Link href="/shop" className="mt-6 inline-block bg-onyx px-8 py-3 text-xs uppercase tracking-widest text-white">Continue Shopping</Link>
      </main>
    );
  }

  const sub = subtotal();
  const shipping = sub > 10000 ? 0 : 250;
  const total = sub + shipping;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-12">
      <h1 className="mb-8 text-3xl text-onyx">Shopping Cart</h1>
      <div className="grid gap-10 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4 border-b border-onyx/10 pb-6">
              <div className="relative h-28 w-20 shrink-0 overflow-hidden bg-beige/40">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-onyx">{item.name}</p>
                <p className="mt-1 text-xs text-onyx/50">{item.color} / {item.size}</p>
                <p className="mt-2 text-sm text-gold">{formatPrice(item.price)}</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center border border-onyx/20">
                    <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)} className="px-2 py-1 text-xs">−</button>
                    <span className="px-3 text-xs">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)} className="px-2 py-1 text-xs">+</button>
                  </div>
                  <button onClick={() => removeItem(item.productId, item.size, item.color)} className="text-xs text-onyx/50 underline">Remove</button>
                </div>
                {item.quantity >= item.maxStock && <p className="mt-1 text-xs text-red-600">Only {item.maxStock} available</p>}
              </div>
            </div>
          ))}
        </div>
        <div className="border border-onyx/10 p-6">
          <h2 className="mb-4 text-sm uppercase tracking-widest text-onyx/60">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(sub)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
            <div className="mt-3 flex justify-between border-t border-onyx/10 pt-3 text-base font-medium"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
          <Link href="/checkout" className="mt-6 block bg-onyx py-3 text-center text-xs uppercase tracking-widest text-white hover:bg-onyx/90">Proceed to Checkout</Link>
        </div>
      </div>
    </main>
  );
}
